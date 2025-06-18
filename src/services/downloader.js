const Client = require('ssh2-sftp-client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

// Set downloads directory to project root
const LOCAL_DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');

async function checkAndDownloadXML() {
  // Create a new SFTP client instance for each connection
  const sftp = new Client();
  
  try {
    logger.info('Connecting to SFTP...');

    await sftp.connect({
      host: process.env.FTP_HOST,
      port: process.env.FTP_PORT || 22,
      username: process.env.FTP_USER,
      password: process.env.FTP_PASS,
    });

    const fileList = await sftp.list(process.env.FTP_REMOTE_PATH);
    const xmlFiles = fileList.filter(file => file.name.endsWith('.xml'));

    if (xmlFiles.length === 0) {
      logger.info('No XML files found.');
      return;
    }

    // Ensure local download directory exists
    if (!fs.existsSync(LOCAL_DOWNLOAD_DIR)) {
      fs.mkdirSync(LOCAL_DOWNLOAD_DIR, { recursive: true });
      logger.info(`Created downloads directory at: ${LOCAL_DOWNLOAD_DIR}`);
    }

    for (const file of xmlFiles) {
      const remoteFilePath = `${process.env.FTP_REMOTE_PATH}/${file.name}`;
      const localFilePath = path.join(LOCAL_DOWNLOAD_DIR, file.name);

      logger.info(`Downloading ${file.name}...`);
      await sftp.fastGet(remoteFilePath, localFilePath);
      logger.info(`Successfully downloaded: ${file.name}`);

      // Delete file after successful download
      await sftp.delete(remoteFilePath);
      logger.info(`Deleted from server: ${file.name}`);
    }

  } catch (error) {
    logger.error('Error during SFTP process:', error);
  } finally {
    // Always ensure the connection is closed
    try {
      if (sftp) {
        await sftp.end();
        logger.info('SFTP connection closed successfully');
      }
    } catch (endError) {
      logger.error('Error closing SFTP connection:', endError);
    }
  }
}

module.exports = { checkAndDownloadXML };
