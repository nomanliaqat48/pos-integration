const getTimestamp = () => new Date().toISOString();

const formatMessage = (level, message, error = null) => {
    const timestamp = getTimestamp();
    const baseMessage = `[${timestamp}] ${level}: ${message}`;
    return error ? `${baseMessage}\n${error.stack || error}` : baseMessage;
};

const logger = {
    info: (message) => {
        console.log(formatMessage('INFO', message));
    },
    
    error: (message, error) => {
        console.error(formatMessage('ERROR', message, error));
    },
    
    warn: (message) => {
        console.warn(formatMessage('WARN', message));
    },
    
    debug: (message) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatMessage('DEBUG', message));
        }
    }
};

module.exports = logger;
  