const expressLoader = require('./express');
const mongooseLoader = require('./mongoose');
const Logger = require('./logger');

module.exports = async app => {
  try {
    await mongooseLoader();
    Logger.info('DB loaded and connected!');

    // Load Models
    require('../models/User');
    require('../models/Article');

    // Load passport Middleware
    require('../config/passport');

    await expressLoader(app);
    Logger.info('Express loaded');
  } catch (err) {
    Logger.error(err.message);
  }
};
