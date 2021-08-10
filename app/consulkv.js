import fetch from 'node-fetch';
import logger from './utils/logger.js';
import config from './utils/config.js';
import { getVaultToken } from './vault.js';

// TODO: add token renewal support for Consul Token based on lease_duration
// TODO: currently every request to a key also requests a vault and consul tokens
//       even though they are still valid

const appName = config.get('npm_package_name');
const team = 'team_wsi';
const stage = 'dev'; // read from ENV

const getConsulValue = async (key) => {
  if (!key) return null; 
  const vaultToken = await getVaultToken();
  const consulToken = await getConsulToken(vaultToken);
  return await getValue(consulToken, key);
}

// value has to be string (JSON.stringify objects!)
const putConsulValue = async (key, value) => {
  if (!key || !value) return null;
  const vaultToken = await getVaultToken();
  const consulToken = await getConsulToken(vaultToken);
  return await putValue(consulToken, key, value);
}

const vaultRoleForConsulAcl = `${appName}-${stage}-${team}`;
const getConsulToken = async (vaultToken) => {
  if (!vaultToken) return null;
  try {
    const url = `https://vault.wsi.internal/v1/consul-kv/creds/${vaultRoleForConsulAcl}`;
    const response = await fetch(url, {
      headers: { 
        'Content-Type': 'application/json',
        'X-Vault-Namespace': team,
        'X-Vault-Token': vaultToken
      }
    });
    const json = await response.json();
    return json && json.data && json.data.token || null;
  } catch (err) {
    logger.info({ msg: 'Error getting Consul token', err });
    return null;
  }
}

const getValue = async (consulToken, key) => {
  if (!consulToken) return null;
  try {
      const url = `https://consul.hahment.com/v1/kv/${team}/${stage}/${appName}/${key}`;
      const response = await fetch(url, {
        headers: {
          'X-Consul-Token': consulToken
        }
      });
      const json = await response.json();
      const encodedValue = json && json[0] && json[0]['Value'] || null;
      let value = null;
      let decodedValue = null;
      if (encodedValue) {
        try {
          decodedValue = Buffer.from(encodedValue, 'base64').toString('ascii');
        } catch (err) {
          logger.info({ msg: `Error base64 decoding Consul value for key ${key}.`, err });
        }
      }
      if (decodedValue) {
        try {
          value = JSON.parse(decodedValue);
        } catch (err) {
          // logger.info({ msg: `Error json decoding Consul value for key ${key}.`, err });
          value = decodedValue;
        }
      }
      return value;
  } catch (err) {
    logger.info({ msg: `Error getting Consul value for key ${key}.`, err });
    return null;
  }
}

const putValue = async (consulToken, key, value) => {
  if (!consulToken) return null;
  try {
      const url = `https://consul.hahment.com/v1/kv/${team}/${stage}/${appName}/${key}`;
      const response = await fetch(url, {
        method: 'PUT',
        body: value,
        headers: {
          'X-Consul-Token': consulToken
        }
      });
      const res = await response.text();
      logger.info({ 
        msg: `Complete putting Consul value for key ${key} and value ${value}.`, 
        res 
      });
      return res === "true";
  } catch (err) {
    logger.info({ msg: `Error putting Consul value for key ${key}.`, err });
    return null;
  }
}

export { getConsulValue, putConsulValue };