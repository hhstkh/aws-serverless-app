
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../auth/utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE


export async function handler(event) {

  const todoId = event.pathParameters.todoId

  console.log("delete todos, todo id: " + todoId);

  const authorization = event.headers.Authorization
  const userId = getUserId(authorization)

  try {
    const params = {
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
    };

    const result = await dynamoDbDocument.delete(params);
    console.log("Item deleted successfully:", result);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: result
      })
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: error
      })
    }
  }

}
