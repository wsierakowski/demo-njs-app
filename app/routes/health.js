import Router from 'koa-router';
import health from '@cloudnative/health-connect';
import config from '../utils/config.js';

const healthcheck = new health.HealthChecker();


// configure health probes

const livePromise = () => new Promise(function (resolve, _reject) {
  setTimeout(function () {
    // console.log('ALIVE!');
    if (config.get('LIVE_ON')) 
      resolve();
    else
      _reject('Manually triggered fail');
  }, 10);
});
let liveCheck = new health.LivenessCheck("liveCheck", livePromise);
healthcheck.registerLivenessCheck(liveCheck);

const readyPromise = () => new Promise(function (resolve, _reject) {
  setTimeout(function () {
    // console.log('STARTED!');
    if (config.get('READY_ON')) 
      resolve();
    else
      _reject('Manually triggered fail');
  }, 10);
});
let readyCheck = new health.ReadinessCheck("readyCheck", readyPromise);
healthcheck.registerReadinessCheck(readyCheck);

// const startupPromise = () => new Promise(function (resolve, _reject) {
//   setTimeout(function () {
//     // console.log('STARTED!');
//     if (config.get('STARTUP_ON')) 
//       resolve();
//     else
//       _reject('Manually triggered fail');
//   }, 10);
// });
// let startupCheck = new health.StartupCheck("startupCheck", startupPromise);
// healthcheck.registerStartupCheck(startupCheck);


// router

const router = new Router(/*{prefix: '/health'}*/);

router.get('/', async ctx => {
  ctx.status = 200;
});

router.get('/live', async ctx => {
  ctx.respond = false;
  await health.LivenessEndpoint(healthcheck)(ctx.req, ctx.res);
});

router.get('/ready', async ctx => {
  ctx.respond = false;
  await health.ReadinessEndpoint(healthcheck)(ctx.req, ctx.res);
});

router.get('/startup', async ctx => {
  // ctx.respond = false;
  // await health.HealthEndpoint(healthcheck)(ctx.req, ctx.res);
  if (config.get('STARTUP_ON')) {
    ctx.status = 200;
  } else {
    ctx.status = 500;
  }
});

export default router;