import * as AWS from '@aws-sdk/client-secrets-manager';
import logger from '../utils/logger.js';

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/classes/getsecretvaluecommand.html

const region = 'eu-west-2';
const secretName = 'demo-psql-db';

// Create a Secrets Manager client
const client = new AWS.SecretsManager({ region });

const getDbSecret = async () => {
  try {
    const secret = await client.getSecretValue({SecretId: secretName});

    /* 
    Returned data format:
    {
      '$metadata': {
        httpStatusCode: 200,
        requestId: '7f519a5a-2996-44f1-b171-7e9d348352a0',
        extendedRequestId: undefined,
        cfId: undefined,
        attempts: 1,
        totalRetryDelay: 0
      },
      ARN: 'arn:aws:secretsmanager:eu-west-2:353137927616:secret:wsi-psql-db-Cm1UJd',
      CreatedDate: 2021-08-25T21:11:43.365Z,
      Name: 'wsi-psql-db',
      SecretBinary: undefined,
      SecretString: '{"username":"postgres","password":"____","engine":"postgres","host":"wsi-psql-db.ck10rjmx409c.eu-west-2.rds.amazonaws.com","port":5432,"dbInstanceIdentifier":"wsi-psql-db"}',
      VersionId: 'f9a9df5c-0047-4b8e-813b-77acf84009c6',
      VersionStages: [ 'AWSCURRENT' ]
    }
    */

    // Decrypts secret using the associated KMS CMK.
    // Depending on whether the secret is a string or binary, one of these fields will be populated.
    //   if ('SecretString' in data) {
    //     secret = data.SecretString;
    // } else {
    //     let buff = new Buffer(data.SecretBinary, 'base64');
    //     decodedBinarySecret = buff.toString('ascii');
    // }
    return secret && secret.SecretString || null;

  } catch (err) {
    logger.error({msg: `error obtaining db credentials from AWS`, err});
    if (err.code === 'DecryptionFailureException')
      // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InternalServiceErrorException')
      // An error occurred on the server side.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InvalidParameterException')
      // You provided an invalid value for a parameter.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'InvalidRequestException')
      // You provided a parameter value that is not valid for the current state of the resource.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'ResourceNotFoundException')
      // We can't find the resource that you asked for.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    else if (err.code === 'AccessDeniedException')
      // We can't find the resource that you asked for.
      // Deal with the exception here, and/or rethrow at your discretion.
      throw err;
    
    return null;
  }
}

export { getDbSecret };