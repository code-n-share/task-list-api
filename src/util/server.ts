import express from 'express';
import bodyParser from 'body-parser';

import logger from '../logger/logger';
import HealthCheckController from '../controller/healthcheck.controller';
import TasksController from '../controller/tasks.controller';
import TaskListController from '../controller/tasklist.controller';

const NAMESPACE = 'Server'

function createServer() {
    const app = express();

    app.use((req, res, next) => {
        logger.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${req.socket.remoteAddress}]`);
      
        res.on('finish', () => {
          logger.info(NAMESPACE, `METHOD - [${req.method}], URL - [${req.url}], IP - [${
            req.socket.remoteAddress}], STATUS - [${res.statusCode}]`);
        });
      
        next();
      })
      
      // parse request 
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    // routes
    app.use('/', new HealthCheckController().router);
    app.use('/', new TasksController().router);
    app.use('/', new TaskListController().router);

    // error handling for invalid routes
    app.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    })
    });

    // OpenAPI UI
    // app.use(
    //   "/api-documentation",
    //   swaggerUi.serve,
    //   swaggerUi.setup({
    //     swaggerOptions: {
    //       url: "http://localhost:5001/api-docs",
    //     },
    //   })
    // );

    return app;
}

export default createServer