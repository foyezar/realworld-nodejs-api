const bodyParser = require('body-parser'),
  cors = require('cors'),
  errorhandler = require('errorhandler'),
  session = require('express-session');

module.exports = app => {
  app.use(cors());
  app.use(require('morgan')('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(require('method-override')());

  app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
  }

  app.use(require('../routes'));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not found');
    err['status'] = 404;

    next(err);
  });

  // error handlers
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
      },
    });
  });
};