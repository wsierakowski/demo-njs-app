import process from 'process';
import os from 'os';
import Pino from 'pino';
import app from './app.js';
import config from './utils/config.js';
import { getInfo } from './info/index.js';

const pino = Pino();
const PORT = config.get('PORT') || 3000;

const initialize = async () => {

  const info = await getInfo();

  // Launch server
  const initialInfo = {
    ...info,
    status: "Just started..."
  };

  let server;

  const startServer = () => {
    server = app.listen(PORT, () => pino.info(initialInfo));
  }

  if (config.get('STARTUP_DELAY')) {
    pino.info(`Starting server with boot delay STARTUP_DELAY=${config.get('STARTUP_DELAY')} [ms].`);
    setTimeout(() => {
      startServer();
    }, config.get('STARTUP_DELAY'));
  } else {
    startServer();
  }


  // Handle shutdowns
  process.on('SIGINT', () => {
    pino.info('Received SIGINT');
    setTimeout(shutdown, config.get('SHUTDOWN_DELAY'));
  });

  process.on('SIGTERM', () => {
    pino.info('Received SIGTERM');
    setTimeout(shutdown, config.get('SHUTDOWN_DELAY'));
  });

  process.on('SIGCONT', () => {
    pino.info('Received SIGCONT');
    if (!server) {
      startServer();
    }
  });

  const shutdown = () => {
    // clear up your resources and exit
    pino.info('Shutting down...');
    
    if (server) {
      server.close((err) => {
        pino.error(err);
        process.exitCode = 1;
      });
    }

    process.exit();
  }
}

initialize();
