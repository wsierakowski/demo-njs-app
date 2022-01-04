import Pool from 'pg-pool';
import config from '../utils/config.js';
import logger from '../utils/logger.js';

let pool;

const getPool = async () => {
  if (!pool) {
    const params = {
      host: config.get('db:host'),
      port: config.get('db:port'),
      database: config.get('db:database'),
      user: config.get('db:user'),
      password: config.get('db:password')
    };
    pool = new Pool(params);
    
    console.log('---> SETTING UP PGPOOL for params:', params);

    // check if table exists, if not create it (hacky way to create schema if not exists instead of using migration)
    try {
      const results = await pool.query(`CREATE TABLE IF NOT EXISTS books(
        ID SERIAL PRIMARY KEY,
        title VARCHAR(30),
        description VARCHAR(200)
      );`);
      logger.info({msg: `Table created`, results});
    } catch (err) {
      logger.error({msg: `Create table didn't work`, err});
    }

    try {
      const results = await pool.query(`INSERT INTO books (title, description)
      VALUES ('Rework', 'A better, faster, easier way to succeed in business.'), 
      ('Deep Work', 'Rules for Focused Success in a Distracted World.'), 
      ('Thinking Fast and Slow', 'Learn about your system 1 and system 2');`);
      logger.info({msg: `Seed records inserted`, results});
    } catch (err) {
      logger.error({msg: `Inserting seed records didn't work`, err});
    }

  }
  return pool;
}

export { getPool };
