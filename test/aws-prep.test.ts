import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { AwsPrepStack } from '../lib/aws-prep-stack'; // Adjust the path to your stack file

describe('AwsPrepStack', () => {
  let app: cdk.App;
  let stack: AwsPrepStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new AwsPrepStack(app, 'TestAwsPrepStack');
    template = Template.fromStack(stack);
  });

  test('DynamoDB Table Created with TTL and Stream Enabled', () => {
    template.hasResourceProperties('AWS::DynamoDB::Table', {
      BillingMode: 'PAY_PER_REQUEST',
      TimeToLiveSpecification: {
        AttributeName: 'ttl',
        Enabled: true,
      },
      StreamSpecification: {
        StreamViewType: 'NEW_AND_OLD_IMAGES',
      },
      KeySchema: [
        {
          AttributeName: 'id',
          KeyType: 'HASH',
        },
      ],
    });
  });

  test('SNS Topic Created', () => {
    template.hasResourceProperties('AWS::SNS::Topic', {
      TopicName: 'ErrorTopic',
    });
  });

  test('Lambda Functions Created with Environment Variables', () => {
    template.hasResourceProperties('AWS::Lambda::Function', Match.objectLike({
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          TABLE_NAME: Match.anyValue(),
          TOPIC_ARN: Match.anyValue(),
        },
      },
    }));
  });

test('Lambda Functions Have Correct DynamoDB Permissions', () => {
  // Validate that the generated IAM policies for Lambda functions include DynamoDB permissions
  template.hasResourceProperties('AWS::IAM::Policy', Match.objectLike({
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Effect: 'Allow',
          Action: Match.arrayWith([
            'dynamodb:BatchGetItem',
            'dynamodb:GetRecords',
            'dynamodb:GetShardIterator',
            'dynamodb:Query',
            'dynamodb:GetItem',
            'dynamodb:Scan',
            'dynamodb:BatchWriteItem',
            'dynamodb:PutItem',
            'dynamodb:UpdateItem',
            'dynamodb:DeleteItem',
          ]),
          Resource: Match.anyValue(),
        }),
      ]),
    },
  }));
});



  test('API Gateway Created with POST Method Integrated with Lambda', () => {
    template.hasResourceProperties('AWS::ApiGateway::Method', {
      HttpMethod: 'POST',
      ResourceId: Match.anyValue(),
      RestApiId: Match.anyValue(),
      Integration: {
        IntegrationHttpMethod: 'POST',
        Type: 'AWS_PROXY',
        Uri: Match.anyValue(),
      },
    });
  });

  test('SNS Subscription Created', () => {
    template.hasResourceProperties('AWS::SNS::Subscription', {
      Protocol: 'email',
      Endpoint: 'velmira.cacc@gmail.com',
    });
  });

test('DynamoDB Event Source Added to Cleanup Lambda', () => {
  template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
    EventSourceArn: Match.objectLike({ 'Fn::GetAtt': ['ErrorTableA27F7F12', 'StreamArn'] }),
    StartingPosition: 'LATEST',
    BatchSize: 5,
    FilterCriteria: {
      Filters: [
        {
          Pattern: JSON.stringify({
            eventName: ['REMOVE'], // Match the actual pattern in the template
          }),
        },
      ],
    },
  });
});


test('API Gateway URL Output Created', () => {
  template.hasOutput('RESTApiEndpoint', {
    Value: Match.objectLike({
      'Fn::Join': Match.arrayWith([
        '',
        Match.arrayWith([
          'https://',
          Match.objectLike({ Ref: 'ProcessorApiEE88D53F' }),
          '.execute-api.eu-central-1.amazonaws.com/prod/processJSON',
        ]),
      ]),
    }),
  });
});

});
