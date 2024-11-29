import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { getUserId } from '../auth/utils.mjs'

const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE



export async function handler(event) {
  console.log('Processing todo: ', event)
  const itemId = uuidv4()

  const createdAt = new Date().toISOString();

  const authorization = event.headers.Authorization
  const userId = getUserId(authorization)

  const parsedBody = JSON.parse(event.body)

  const newItem = {
    todoId: itemId,
    userId: userId,
    createdAt: createdAt,
    done:false,
    attachmentUrl: '',
    ...parsedBody
  }

  await dynamoDbClient.put({
    TableName: todosTable,
    Item: newItem
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}

