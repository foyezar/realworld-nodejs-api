const bodyParser = require('body-parser'),
  cors = require('cors'),
  errorhandler = require('errorhandler'),
  session = require('express-session'),
  helmet = require('helmet'),
  compression = require('compression');

const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerPath = path.resolve(__dirname, '../swagger.yml');
const YAML = require('yamljs');
const swaggerDocument = YAML.load(swaggerPath);

module.exports = (app) => {
  app.use(cors());
  app.use(require('morgan')('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(require('method-override')());
  app.use(helmet());
  app.use(compression());

  app.use(session({ secret: 'conduit', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

  if (process.env.NODE_ENV === 'development') {
    app.use(errorhandler());
  }

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use(require('../routes'));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not found');
    err['status'] = 404;

    next(err);
  });

  // error handlers
  app.use((err, req, res, next) => {
    // if (err.name === 'UnauthorizedError') {
    //   return res
    //     .status(err.status)
    //     .send({ message: err.message })
    //     .end();
    // }

    if (err.name === 'ValidationError') {
      return res.status(err.status || 422).json({
        errors: err.details
          ? // Joi error handling
            err.details.reduce((errors, error) => {
              errors[error.path[0]] = error.message;

              return errors;
            }, {})
          : // Mongoose error handling
            Object.keys(err.errors).reduce(function (errors, key) {
              errors[key] = err.errors[key].message;

              return errors;
            }, {}),
      });
    }

    return next(err);
  });

  app.use((err, req, res, next) => {
    const errors = { message: err.message };

    if (require('../config').nodeEnv === 'development') {
      console.log(err.stack);
      errors.error = err;
    }

    res.status(err.status || 500);
    res.json({ errors });
  });
};
