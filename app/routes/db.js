import Router from 'koa-router';
import logger from '../utils/logger.js';
import { getPool } from '../utils/pgpool.js';

const router = new Router();

router.get('/list', async ctx => {
  try {
    const pgPool = await getPool();
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

router.post('/insert', async ctx => {
  try {
    const { title, description } = ctx.request.body;
    if (!title || !description) {
      ctx.status = 400;
      ctx.body = {msg: `'title' and 'description' are required`};
      return;
    }
    const pgPool = await getPool();
    const results = await pgPool.query('INSERT INTO books (title, description) VALUES ($1, $2) RETURNING id', [title, description]);
    ctx.status = 201;
    ctx.body = {
      id: results.rows && results.rows[0] && results.rows[0].id || null
    }
  } catch (err) {
    logger.error({msg: `DB insert didn't work`, err});
    ctx.status = 500;
    ctx.body = {
      msg: 'this didn\'t work',
      // for testing on dev only ;-)
      err: err.toString()
    };
  }
});

export default router;
