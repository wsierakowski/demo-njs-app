import Router from 'koa-router';
import logger from '../utils/logger.js';
// import config from '../utils/config.js';
import { s3 } from '../aws/index.js';

const router = new Router();
const params = {
  Bucket: 'demo-njs-app-bucket',
  MaxKeys: 10
}

router.get('/s3/list', async ctx => {
  try {
    const data = await s3.listObjects(params);
    ctx.body = data;
  } catch (err) {
    logger.error({msg: `S3 list object didn't work`, err});
    ctx.status = 500;
    ctx.body = {
      msg: 'this didn\'t work',
      // for testing on dev only ;-)
      err: err.toString()
    };
  }
});

export default router;
