import os from 'os';
import config from '../utils/config.js';
import { getVaultSecret } from '../vault.js';
import { getConsulValue, putConsulValue } from '../consulkv.js';
const PORT = config.get('PORT') || 3000;
const HOST_IP = config.get('HOST_IP') || "";

const getInfo = async() => {
  return {
    serviceName: config.get('npm_package_name'),
    serviceVersion: config.get('npm_package_version'),
    description: config.get('npm_package_description'),
    host: `${os.hostname()}:${PORT}`,
    hostIP: HOST_IP,
    environment: config.get('ENV'),
  };
}

const getVaultConsul = async() => {
  return {
    secret: await getVaultSecret(),
    consulKv: {
      get: {
        config: await getConsulValue('config'),
        mixedList: await getConsulValue('mixedList'),
        numberValue: await getConsulValue('numberValue'),
        textValue: await getConsulValue('textValue')
      },
      put: {
        deployedAppVersion: await putConsulValue(
          'deployedAppVersion', 
          JSON.stringify({
            serviceName: config.get('npm_package_name'),
            serviceVersion: config.get('npm_package_version')
          })
        )
      }
    }
  };
}

const hostIp = `${HOST_IP}:${PORT}`;
const hostName = `${os.hostname()}:${PORT}`

export {getInfo, getVaultConsul, hostIp, hostName};