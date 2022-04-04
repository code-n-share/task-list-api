import http from 'http';

import config from './config/config'
import logger from './logger/logger';
import createServer from './util/server';


const app = createServer();
const NAMESPACE = 'Index'

// create server
const httpServer = http.createServer(app);
httpServer.listen(config.port, () =>
  logger.info(NAMESPACE, `Server running on ${config.host}:${config.port}`)
);