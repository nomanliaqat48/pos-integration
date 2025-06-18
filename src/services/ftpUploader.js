const Client = require('ssh2-sftp-client');
const sftp = new Client();
const logger = require('../utils/logger');

async function uploadToFTP(xmlContent, fileName) {
  try {
    logger.info(`Connecting to SFTP server: ${process.env.FTP_HOST}`);
    
    // Connect to SFTP server
    await sftp.connect({
      host: process.env.FTP_HOST,
      port: process.env.FTP_PORT,
      username: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      readyTimeout: 30000
    });

    logger.info('Connected to SFTP server successfully');

    // Check if remote directory exists
    try {
      await sftp.list(process.env.FTP_REMOTE_PATH);
    } catch (dirError) {
      logger.error(`Remote directory error: ${dirError.message}`);
      throw new Error(`Remote directory ${process.env.FTP_REMOTE_PATH} not accessible`);
    }

    // Upload the file
    const remotePath = `${process.env.FTP_REMOTE_PATH}/${fileName}`;
    logger.info(`Uploading file to: ${remotePath}`);
    
    await sftp.put(Buffer.from(xmlContent), remotePath);
    logger.info('File uploaded successfully');

    // Close the connection
    await sftp.end();
    logger.info('SFTP connection closed');
    
    return true;
  } catch (error) {
    logger.error('SFTP Upload Error:', error);
    // Make sure to close the connection on error
    try {
      await sftp.end();
    } catch (closeError) {
      logger.error('Error closing SFTP connection:', closeError);
    }
    throw error;
  }
}

module.exports = { uploadToFTP };
