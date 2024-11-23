import * as cdk from 'aws-cdk-lib';
import {CfnOutput} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {AttributeType, BillingMode, StreamViewType, Table} from "aws-cdk-lib/aws-dynamodb";
import {LambdaIntegration, RestApi} from "aws-cdk-lib/aws-apigateway";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {FilterCriteria, FilterRule, Runtime, StartingPosition} from "aws-cdk-lib/aws-lambda";
import {Subscription, SubscriptionProtocol, Topic} from "aws-cdk-lib/aws-sns";
import {DynamoEventSource} from "aws-cdk-lib/aws-lambda-event-sources";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class AwsPrepStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const errorTable:cdk.aws_dynamodb.Table= new Table(this,'ErrorTable',{
      partitionKey:{
            name:'id',
            type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      stream:StreamViewType.NEW_AND_OLD_IMAGES
    });


    const errorTopic = new Topic(this, 'ErrorTopic',
        {topicName:'ErrorTopic'});


    const processFunction:cdk.aws_lambda_nodejs.NodejsFunction = new NodejsFunction(this,'processFunction',
        {
                runtime:Runtime.NODEJS_20_X,
                handler: 'handler',
                entry:`${__dirname}/../src/processFunction.ts`,
                environment: {
                    TABLE_NAME: errorTable.tableName,
                    TOPIC_ARN: errorTopic.topicArn,
                }
      });


        const cleanupFunction:cdk.aws_lambda_nodejs.NodejsFunction = new NodejsFunction(this,'cleanupFunction',
        {
                runtime:Runtime.NODEJS_20_X,
                handler: 'handler',
                entry:`${__dirname}/../src/cleanupFunction.ts`,
                environment: {
                    TABLE_NAME: errorTable.tableName,
                    TOPIC_ARN: errorTopic.topicArn,
                }
      });

    errorTable.grantReadWriteData(processFunction);
    errorTable.grantReadWriteData(cleanupFunction);
    errorTopic.grantPublish(processFunction);
    errorTopic.grantPublish(cleanupFunction);


    const api:cdk.aws_apigateway.RestApi=new RestApi(this, 'ProcessorApi');

    const resource: cdk.aws_apigateway.Resource=api.root.addResource('processJSON');
    resource.addMethod('POST',new LambdaIntegration(processFunction));



    new Subscription(this,'ErrorSubscription',{
        topic: errorTopic,
        protocol: SubscriptionProtocol.EMAIL,
        endpoint: 'velmira.cacc@gmail.com'
    });

    cleanupFunction.addEventSource(new DynamoEventSource(errorTable, {
        startingPosition: StartingPosition.LATEST,
        batchSize: 5,
        filters:[
            FilterCriteria.filter({
                eventName: FilterRule.isEqual('REMOVE')
            })
        ]
    }));

    new CfnOutput(this,'RESTApiEndpoint',{
        value:`https://${api.restApiId}.execute-api.eu-central-1.amazonaws.com/prod/processJSON`
    });


  }
}
