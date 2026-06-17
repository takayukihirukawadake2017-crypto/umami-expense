const Minio = require('minio');
const { v4: uuidv4 } = require('uuid');

let minioClient = null;

function getMinioClient() {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'minio',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ROOT_USER,
      secretKey: process.env.MINIO_ROOT_PASSWORD
    });
  }
  return minioClient;
}

const BUCKET = process.env.MINIO_BUCKET || 'receipts';

// バケットの初期化
async function ensureBucket() {
  const client = getMinioClient();
  const exists = await client.bucketExists(BUCKET);
  if (!exists) {
    await client.makeBucket(BUCKET);
    console.log('MinIO bucket created:', BUCKET);
  }
}

// ファイルをMinIOにアップロード
async function uploadToMinio(buffer, filename, contentType) {
  const client = getMinioClient();
  await ensureBucket();

  const objectName = uuidv4() + '-' + filename;

  await client.putObject(BUCKET, objectName, buffer, buffer.length, {
    'Content-Type': contentType
  });

  const imgDomain = process.env.IMG_WEB_URL || ('http://' + (process.env.MINIO_ENDPOINT || 'minio') + ':9000');
  return imgDomain + '/' + BUCKET + '/' + objectName;
}

// ファイルを取得
async function getFromMinio(objectName) {
  const client = getMinioClient();
  return client.getObject(BUCKET, objectName);
}

// 署名付きURLを生成（一時アクセス用）
async function getPresignedUrl(objectName, expiry = 3600) {
  const client = getMinioClient();
  return client.presignedGetObject(BUCKET, objectName, expiry);
}

module.exports = { uploadToMinio, getFromMinio, getPresignedUrl };
