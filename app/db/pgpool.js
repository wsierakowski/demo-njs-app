import Pool from 'pg-pool';
import config from '../utils/config.js';

const pgPool = new Pool({
  host: config.get('db:host'),
  port: config.get('db:port'),
  database: config.get('db:database'),
  user: config.get('db:user'),
  password: config.get('db:password')
});
export default pgPool;
