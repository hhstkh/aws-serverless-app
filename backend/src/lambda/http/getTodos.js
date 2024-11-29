
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../auth/utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE


export async function handler(event) {
  const authorization = event.headers.Authorization
  const userId = getUserId(authorization)

  console.log("get todos, user id: " + userId);

  const result = await dynamoDbDocument.query({
    TableName: todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false
  })

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: result.Items
    })
  }

}
