import json
import boto3
import os
import botocore
import uuid

print('Loading function')

#Create a connection with DynamoDB Service
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    print("Received event: " + json.dumps(event, indent=2))

    var_tableName = os.environ['DYNAMODB_TABLE']

    try:
        date = event['date'].split('T')[0]
        time = event['date'].split('T')[1][:5]


        #Inserting item in DynamoDB
        response = dynamodb.put_item(
            Item={
                'id': {'S': uuid.uuid4().hex},
                'date': {'S': date },
                'time': {'S': time}
            },
            TableName = var_tableName,
        )

        if (response):
            print("Success! Below the result of what has been inserted in your DynamoDB table " + var_tableName)
            print(response)

    except botocore.exceptions.ClientError as e:
        print (e)
