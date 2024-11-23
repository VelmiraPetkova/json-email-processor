import {PublishCommand, SNSClient} from "@aws-sdk/client-sns";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

const snsClient: SNSClient = new SNSClient({});
const dynamoDBClient: DynamoDBClient = new DynamoDBClient({});

export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    const topicARN = process.env.TOPIC_ARN;

    console.log(event);
    const body= event.body;
    JSON.parse(event.body);

    console.log(body);


    if(!body || !body.text){
        //Invalid JSON

        const ttl= Math.floor(Date.now()/ 1000) + 30 * 60;

        await dynamoDBClient.send(new PutItemCommand(
            {
                TableName:tableName,
                Item: {
                    id: {
                        S: Math.random().toString(),
                    },
                    errorMessage: {
                        S: 'Something is wrong!',
                    },
                    ttl: {
                        N: ttl.toString(),
                    }
                }
            }
        ))

    }else{
        //Publish to SNS
        await snsClient.send(new PublishCommand({
            TopicArn: topicARN,
            Message: `Valid JSON received: ${event.text}`
        }));
        console.log('Notification sent!')
    }

    return {
        statusCode: 200,
        body:'Hi from Lambda!'
    }
}