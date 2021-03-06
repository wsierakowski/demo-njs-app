import Koa from 'koa';
import pino from 'pino';
import logger from 'koa-pino-logger'
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import healthRoutes from './routes/health.js';
import mainRoutes from './routes/main.js';
import debugRoutes from './routes/debug.js';
import awsRoutes from './routes/aws.js';
import dbRoutes from './routes/db.js';
import config from './utils/config.js';

const app = new Koa();

logger({instance: pino});
// app.use(logger());
// disable logger for health endpoints
app.use(async (ctx, next) => {
  if (ctx.url.startsWith('/health') && !config.get('PROBE_LOGGING_ON')) {
    await next();
  } else {
    await logger()(ctx, next);
  }
});

app.use(bodyParser({enableTypes: ['json', 'text']}));

// app.use(async (ctx, next) => {
//   console.log(
//     JSON.stringify({
//       '@timestamp': new Date().toISOString(),
//       level: 'info',
//       'req-method': ctx.req.method,
//       'req-url': ctx.req.url,
//     })
//   );
//   await next();
// });


const router = new Router();
router.use(mainRoutes.routes());
router.use('/debug', debugRoutes.routes());
router.use('/health', healthRoutes.routes());
if (config.get('AWS_ON')) router.use('/aws', awsRoutes.routes());
router.use('/db', dbRoutes.routes());
app.use(router.routes());

export default app;