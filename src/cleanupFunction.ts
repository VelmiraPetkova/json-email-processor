import {PutItemCommand} from "@aws-sdk/client-dynamodb";
import {PublishCommand} from "@aws-sdk/client-sns";

export const handler = async (event: any) => {
    const tableName = process.env.TABLE_NAME;
    const topicARN = process.env.TOPIC_ARN;


    return {
        statusCode: 200,
        body:'Hi from Lambda!'
    }
}