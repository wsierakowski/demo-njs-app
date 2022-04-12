import Router from 'koa-router';
import { randomBytes } from 'crypto';
import fetch from 'node-fetch';
import config from '../utils/config.js';
import * as infos from '../info/index.js';

const router = new Router();
let counter = 0;

router.get('/', async ctx => {
  ctx.status = 200;
  ctx.body = {
    message: `hello world! ${config.get('app:helloMessage')}`,
  };
});

router.get('/info', async ctx => {
  const message = `Received request from "` + 
                    `${ctx.request.ip} + "."`;

  const info = await infos.getInfo();

  ctx.status = 200;
  ctx.body = {
    info,
    message
  }
});

router.get('/counter', async ctx => {
  counter++;
  if (counter >= Number.MAX_SAFE_INTEGER) counter = 0;
  ctx.body = {
    counter
  };
  ctx.status = 200;
});

router.get('/info/vault', async ctx => {
  const message = `Received request from "` + 
                    `${ctx.request.ip} + "."`;

  let info;

  if (config.get('VAULT_CONSUL_ON'))
    info = await infos.getVaultConsul();
  else
    info = "Vault and Consul disabled.";

  ctx.status = 200;
  ctx.body = {
    info,
    message
  }
});

router.get('/info/consul', async ctx => {
  const message = `Received request from "` + 
                    `${ctx.request.ip} + "."`;

  let info;

  if (config.get('VAULT_CONSUL_ON'))
    info = await infos.getVaultConsul();
  else
    info = "Vault and Consul disabled.";

  ctx.status = 200;
  ctx.body = {
    info,
    message
  }
});

// delay=12 [ms]
// size=10 [Bytes]
// example: http://localhost:3000/ping?size=50&delay=5000
router.get('/ping', async ctx => {
  const { delay, size } = ctx.request.query;

  if (size) {
    ctx.body = randomBytes(Math.ceil(size / 2))
      .toString('hex')
      .slice(0, size);
  }

  if (delay) {
    await new Promise(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }
  ctx.status = 200;
});

// service=team_wsi_demo-upstream-app
// endpoint=counter/demo-njs-app
// example: http://localhost:3000/upstream?service=team_wsi_demo-upstream-app&endpoint=counter/demo-njs-app
router.get('/upstream', async (ctx, next) => {

  const {service, endpoint} = ctx.request.query;

  if (!service) {
    ctx.status = 501;
    ctx.body = { internalError: `Incorrect query` };
    return next();
  }

  // convert from team_wsi_demo-upstream-app to this format: team_wsi_DEMO_UPSTREAM_APP
  const consulService = service.toUpperCase().replace(/-/g, '_');

  const host = config.get(consulService + '_CONNECT_SERVICE_HOST');
  const port = config.get(consulService + '_CONNECT_SERVICE_PORT');

  if (!host || !port) {
    ctx.status = 501;
    ctx.body = { internalError: `Service not configured in Consul: ${consulService + '_CONNECT_SERVICE_HOST'}` };
    return next();
  }

  const serviceEndpoint = endpoint || "";

  try {
    const data = await fetch(
        `http://${host}:${port}/${serviceEndpoint}`, 
        { method: 'POST' }
      )
      .then(r => r.text());

    ctx.status = 200;
    ctx.body = {
      upstreamResponse: data
    };
  } catch (error) {
    ctx.status = 502;
    ctx.body = {
      internalError: `Received error response from upstream server`,
      upstreamErrorResponse: error
    };
  }
});

router.get('/info/hostip', async ctx => {
  ctx.status = 200;
  ctx.body = infos.hostIp;
});

router.get('/info/hostname', async ctx => {
  ctx.status = 200;
  ctx.body = infos.hostName;
});

export default router;