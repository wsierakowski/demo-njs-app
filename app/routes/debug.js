import Router from 'koa-router';
import logger from '../utils/logger.js';
import config from '../utils/config.js';

const router = new Router();

router.get('/shutdown/:exitCode', async ctx => {
  const exitCode = ctx.params.exitCode || 0;
  logger.info({msg: `Exiting with exit code ${exitCode}`});
  process.exit(exitCode);
});

router.get('/health/live', async ctx => {
  ctx.status = 200;
  ctx.body = {
    LIVE_ON: config.get('LIVE_ON')
  }
});

router.post('/health/live/:isOn', async ctx => {
  if (ctx.params.isOn === "true" || ctx.params.isOn === "1") {
    config.set('LIVE_ON', true);
  } else {
    config.set('LIVE_ON', false);
  }
  ctx.status = 200;
  ctx.body = {
    LIVE_ON: config.get('LIVE_ON')
  }
});

router.get('/health/ready', async ctx => {
  ctx.status = 200;
  ctx.body = {
    READY_ON: config.get('READY_ON')
  }
});

router.post('/health/ready/:isOn', async ctx => {
  if (ctx.params.isOn === "true" || ctx.params.isOn === "1") {
    config.set('READY_ON', true);
  } else {
    config.set('READY_ON', false); 
  }
  ctx.status = 200;
  ctx.body = {
    READY_ON: config.get('READY_ON')
  }
});

router.get('/health/startup', async ctx => {
  ctx.status = 200;
  ctx.body = {
    STARTUP_ON: config.get('STARTUP_ON')
  }
});

router.post('/health/startup/:isOn', async ctx => {
  if (ctx.params.isOn === "true" || ctx.params.isOn === "1") {
    config.set('STARTUP_ON', true);
  } else {
    config.set('STARTUP_ON', false); 
  }
  ctx.status = 200;
  ctx.body = {
    STARTUP_ON: config.get('STARTUP_ON')
  }
});

// PROBE_LOGGING_ON

router.get('/health/probelogging', async ctx => {
  ctx.status = 200;
  ctx.body = {
    PROBE_LOGGING_ON: config.get('PROBE_LOGGING_ON')
  }
});

router.post('/health/probelogging/:isOn', async ctx => {
  if (ctx.params.isOn === "true" || ctx.params.isOn === "1") {
    config.set('PROBE_LOGGING_ON', true);
  } else {
    config.set('PROBE_LOGGING_ON', false); 
  }
  ctx.status = 200;
  ctx.body = {
    PROBE_LOGGING_ON: config.get('PROBE_LOGGING_ON')
  }
});

// SHUTDOWN_DELAY

router.get('/shutdowndelay', async ctx => {
  ctx.status = 200;
  ctx.body = {
    SHUTDOWN_DELAY: config.get('SHUTDOWN_DELAY')
  }
});

router.post('/shutdowndelay/:value', async ctx => {
  config.set('SHUTDOWN_DELAY', parseInt(ctx.params.value)); 
  ctx.status = 200;
  ctx.body = {
    SHUTDOWN_DELAY: config.get('SHUTDOWN_DELAY')
  }
});

// HIGH CPU INTENSIVE TASK

// 10 seconds: curl -X POST localhost:4000/debug/cputask/10000

// todo: also try workerpool to create heavy threads
// https://levelup.gitconnected.com/handling-nodejs-c-p-u-extensive-task-aa559452eca8
router.post('/cputask/:delayMs', async ctx => {
  const delayMs = parseInt(ctx.params.delayMs)
  const start = Date.now();
  const end = new Date(start + delayMs);
  let count = 0;

  while (new Date() < end) {
    count++;
  }

  ctx.status = 200;
  ctx.body = {
    requestedDelay: delayMs,
    actualDelay: new Date() - start,
    count
  }
});

// MEMORY ALLOCATION

// allocated 0.5 GB: curl -X POST localhost:3000/debug/memalloc/512

let buffers = [];

router.post('/memalloc/:memMB', async ctx => {
  const memMB = parseInt(ctx.params.memMB);
  const buf = Buffer.alloc(memMB * 1024 * 1024);
  buffers.push(buf);
  buf.fill(0);

  const memoryUsage = process.memoryUsage();
  const gb = memoryUsage['heapUsed'] / 1024 / 1024 / 1024;
  // const gbUsed = `${Math.round(gb * 100) / 100} GB`;

  ctx.status = 200;
  ctx.body = {
    bufferLengthBytes: buf.length,
    bufferLengthMb: buf.length / 1024 / 1024,
    bufferLengthGb: buf.length / 1024 / 1024 / 1024,
    // gbUsed,
    memoryUsage
  }
});

router.post('/memclear/', async ctx => {
  for (var key in buffers) {
    if (buffers.hasOwnProperty(key)) {
      delete buffers[key];
    }
  }
  buffers = [];
  if (global.gc) {
    logger.info({msg: `gc clear`});
    global.gc();
  }
  ctx.status = 200;
});


export default router;