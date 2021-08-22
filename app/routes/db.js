import Router from 'koa-router';
import logger from '../utils/logger.js';
import pgPool from '../db/pgpool.js';

const router = new Router();

router.get('/list', async ctx => {
  try {
    const results = await pgPool.query('SELECT * FROM books ORDER BY id ASC');
    ctx.body = results.rows;
  } catch (err) {
    logger.error({msg: `DB query didn't work`, err});
    ctx.status = 500;
    ctx.body = {
      msg: 'this didn\'t work',
      // for testing on dev only ;-)
      err: err.toString()
    };
  }
});

export default router;
