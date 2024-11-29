import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { getUserId } from '../auth/utils.mjs'

const dynamoDbDocument = DynamoDBDocument.from(new DynamoDB())

const todosTable = process.env.TODOS_TABLE


export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const authorization = event.headers.Authorization
  const userId = getUserId(authorization)
  const updatedTodo = JSON.parse(event.body)

  let updateExpression = '';
  let expressionAttributeValues = {};
  let expressionAttributeNames = {}
  if (updatedTodo.name) {
    console.log("update todo name: " + updatedTodo.name);
    updateExpression = updateExpression + ',#name = :name ';
    expressionAttributeValues[':name'] = updatedTodo.name;
    expressionAttributeNames['#name'] = 'name';

  }

  if (updatedTodo.dueDate) {
    console.log("update todo due date: " + updatedTodo.dueDate);
    updateExpression = updateExpression + ',dueDate= :dueDate ';
    expressionAttributeValues[':dueDate'] = updatedTodo.dueDate;
  }

  if (updatedTodo.done) {
    console.log("update todo status: " + updatedTodo.done);
    updateExpression = updateExpression + ',done= :done ';
    expressionAttributeValues[':done'] = updatedTodo.done;
  }

  if (updateExpression) {

    console.log("process to update todo");
    // remove first comma
    updateExpression = updateExpression.substring(1);
    
    try {
      const params = {
        TableName: todosTable,
        Key: {
          todoId: todoId,
          userId: userId
        },
        UpdateExpression: 'set ' + updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW", // Return the updated item
      };
  
      const result = await dynamoDbDocument.update(params);
      console.log("Updated item:", result.Attributes);

      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          items: result.Attributes
        })
      }
    } catch (error) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: error
        })
      }
    }

  } else {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Request is empty'
      })
    }

  }

}
