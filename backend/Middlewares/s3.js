const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3") 
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

const dotenv = require('dotenv')

dotenv.config()

const bucketName = process.env.BUCKET_NAME
const region = process.env.BUCKET_REGION
const accessKeyId = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  region: region
})


module.exports.uploadFile=(fileBuffer, fileName, mimetype)=>{
  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype,

  }

  return s3Client.send(new PutObjectCommand(uploadParams));
}

module.exports.deleteFile=(fileName)=>{
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  }

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}

module.exports.getObjectSignedUrl =(key) =>{
  const params = {
    Bucket: bucketName,
    Key: key
  }

  // https://aws.amazon.com/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  const command = new GetObjectCommand(params);
  const seconds = 6000
  const url = getSignedUrl(s3Client, command, { expiresIn: seconds });

  return url
}