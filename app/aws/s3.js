import { S3 } from "@aws-sdk/client-s3";
import config from '../utils/config.js';

const REGION = config.get('AWS_REGION') || "eu-west-2";
const s3 = new S3({region: REGION});
export { s3 };
