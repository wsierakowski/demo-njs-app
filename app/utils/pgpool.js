import Pool from 'pg-pool';
import config from '../utils/config.js';

let pool;

const getPool = () => {
  if (!pool) {
    const params = {
      host: config.get('db:host'),
      port: config.get('db:port'),
      database: config.get('db:database'),
      user: config.get('db:user'),
      password: config.get('db:password')
    };
    pool = new Pool(params);
    console.log('---> SETTING UP PGPOOL');
  }
  return pool;
}

export { getPool };
