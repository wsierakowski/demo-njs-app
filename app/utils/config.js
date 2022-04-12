import nconf from 'nconf';
import bool from './bool.js';
import { getDbSecret } from '../aws/secrets.js'

nconf
  .use('memory') // https://github.com/indexzero/nconf/issues/197
  .env()
  .file(`${process.cwd()}/config/config.${nconf.get('ENV')}.json`)
  .file('common', `${process.cwd()}/config/config.json`);

// defaults

// readiness and liveness healthchecks are on by default
nconf.get('READY_ON') === undefined ? 
  nconf.set('READY_ON', true) :
  nconf.set('READY_ON', bool.parse(nconf.get('READY_ON')));

nconf.get('LIVE_ON') === undefined ?
  nconf.set('LIVE_ON', true) :
  nconf.set('LIVE_ON', bool.parse(nconf.get('LIVE_ON')));

nconf.get('STARTUP_ON') === undefined ?
  nconf.set('STARTUP_ON', true) :
  nconf.set('STARTUP_ON', bool.parse(nconf.get('STARTUP_ON')));

// logging of requests for health probes is off by default
nconf.get('PROBE_LOGGING_ON') === undefined ?
  nconf.set('PROBE_LOGGING_ON', false) :
  nconf.set('PROBE_LOGGING_ON', bool.parse(nconf.get('PROBE_LOGGING_ON')));

// shutdown delay when receiving SIGTERM or SIGINT
nconf.get('SHUTDOWN_DELAY') === undefined ? 
  nconf.set('SHUTDOWN_DELAY', 0) :
  nconf.set('SHUTDOWN_DELAY', parseInt(nconf.get('SHUTDOWN_DELAY')));

// halt the start of the server until received SIGCONT
nconf.get('STARTUP_DELAY') === undefined ? 
  nconf.set('STARTUP_DELAY', 0) :
  nconf.set('STARTUP_DELAY', parseInt(nconf.get('STARTUP_DELAY')));

// AWS support disabled by default
if (nconf.get('AWS_ON') === undefined) nconf.set('AWS_ON', false);

// Vault and Consul support disabled by default
if (nconf.get('VAULT_CONSUL_ON') === undefined) nconf.set('VAULT_CONSUL_ON', false);

const getAsyncConfigs = async () => {
  // if env aws
  /* 
    {
      "username":"postgres",
      "password":"____",
      "engine":"postgres",
      "host":"wsi-psql-db.ck10rjmx409c.eu-west-2.rds.amazonaws.com",
      "port":5432,
      "dbInstanceIdentifier":"wsi-psql-db"
    }
  */
  const dbSecretPayload = await getDbSecret();
  const dbSecretPayloadObj = JSON.parse(dbSecretPayload);
  if (nconf.get('ENV') !== 'local' && dbSecretPayloadObj) {
    nconf.set('db:host', dbSecretPayloadObj.host);
    nconf.set('db:port', dbSecretPayloadObj.port);
    nconf.set('db:database', 'demo_njs_app');
    nconf.set('db:user', dbSecretPayloadObj.username);
    nconf.set('db:password', dbSecretPayloadObj.password);
  }
}

// getAsyncConfigs();

export default nconf;
export { getAsyncConfigs };