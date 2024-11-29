import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getUserId } from '../auth/utils.mjs'


const s3Client = new S3Client()
const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

export async function handler(event) {
  console.log('Get upload url', event)
  const todoId = event.pathParameters.todoId;

  const authorization = event.headers.Authorization
  const userId = getUserId(authorization);


  await updateTodoAttachUrl(userId, todoId)

  const url = await getUploadUrl(todoId)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}

async function updateTodoAttachUrl(userId, todoId) {

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  console.log('Todo attachment url: ', attachmentUrl)

  const params = {
    TableName: todosTable,
    Key: {
      todoId: todoId,
      userId: userId
    },
    UpdateExpression: 'set attachmentUrl= :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    },
    ReturnValues: "ALL_NEW", // Return the updated item
  };

  const result = await dynamoDbDocument.update(params);
  console.log("Updated item:", result.Attributes);

  return result
}

async function getUploadUrl(todoId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: todoId
  })
  const url = await getSignedUrl(s3Client, command, {
    expiresIn: urlExpiration
  })
  return url
}