import fs from 'fs';
import fetch from 'node-fetch';
import logger from './utils/logger.js';
import config from './utils/config.js';

// TODO: this should probably be executed only once in the app's lifetime
// TODO: add token renewal support

const appName = config.get('npm_package_name');
const team = 'team_wsi';
const stage = 'dev';

let jwt;

if (config.get('VAULT_CONSUL_ON')) {
  try {
    jwt = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
  } catch (err) {
    logger.info({ msg: 'Error getting JWT token', err });
  }
}

const getVaultSecret = async (key) => {
  key = key || '3rd-party-service-api-key';
  const token = await getVaultToken();
  return await getSecret(token, key);
}

// TODO: parametrize namespace and cluster env
const getVaultToken = async () => {
  if (!jwt) return null;
  try {
    const data = {
      jwt,
      role: appName
    };
    const url = `https://vault.wsi.internal/v1/${team}/auth/k8s-wsi-dev-eks-cluster/login`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await response.json();
    return json && json.auth && json.auth.client_token || null;
  } catch (err) {
    logger.info({ msg: 'Error getting Vault token', err });
    return null;
  }
}

const getSecret = async (token, key) => {
  if (!token) return null;
  try {
      const url = `https://vault.wsi.internal/v1/${stage}/${appName}/${key}`;
      const response = await fetch(url, {
        headers: {
          'X-Vault-Namespace': team,
          'X-Vault-Token': token
        }
      });
      const json = await response.json();
      return json && json.data || null;
  } catch (err) {
    logger.info({ msg: 'Error getting Vault secret', err });
    return null;
  }
}

export { getVaultSecret, getVaultToken };
