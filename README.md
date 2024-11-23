
# JSON Processor and Email Notifier

This repository contains a serverless application for processing JSON objects via a public endpoint. The application verifies the JSON payload, sends its content via email if valid, and handles errors by adding items to a DynamoDB table. Items in the table are automatically deleted after 30 minutes, and a notification email is sent upon deletion.

## Features
1. **Public JSON Endpoint**: Accepts JSON via `POST` requests (e.g., via `curl` or Postman).
2. **Email Notification**: Sends the JSON content to a `@yahoo.com` email address if the payload is valid.
3. **Error Handling**: Invalid JSON triggers an entry in a DynamoDB table with a timestamp.
4. **Auto-Deletion**: Items in the DynamoDB table are automatically deleted after 30 minutes.
5. **Post-Deletion Notification**: An email is sent with the details of the deleted item.
6. **CI/CD Pipeline**: Integrated pipeline for testing, linting, and deployment.
7. **Comprehensive Logging**: Meaningful logs at all stages for ease of debugging.

---

## Table of Contents
1. [Architecture](#architecture)
2. [Setup and Deployment](#setup-and-deployment)
3. [API Usage](#api-usage)
4. [Local Development](#local-development)
5. [Testing](#testing)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Logs and Debugging](#logs-and-debugging)


---

## Architecture

- **API Gateway**: Serves as the public endpoint to receive JSON payloads.
- **Lambda Functions**:
  - Validate JSON and send email if valid.
  - Log errors and add invalid JSON entries to DynamoDB.
  - Handle DynamoDB item expiration and send deletion notification email.
- **DynamoDB**: Stores invalid JSON entries with TTL (Time to Live) configured for 30 minutes.
- **Amazon SES**: Sends emails for valid JSON and deletion notifications.
- **CloudWatch Logs**: Tracks all logs for debugging and monitoring.

---

## Setup and Deployment

### Prerequisites
1. AWS CLI and an active AWS account.
2. Node.js and npm installed.
3. An Amazon SES-verified email address for sending emails.

### Deployment
1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/json-email-processor.git
   cd json-email-processor
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy the application using the AWS SAM CLI:
   ```bash
   sam deploy --guided
   ```
   Follow the prompts to set up resources and environment variables.

---

## API Usage

### Endpoint
The application exposes a single endpoint for `POST` requests. Replace `your-api-url` with the deployed API Gateway URL:

```
POST https://your-api-url/submit-json
```

### Example Request
Using `curl`:
```bash
curl -X POST https://your-api-url/submit-json \
-H "Content-Type: application/json" \
-d '{"text": "Hello, Yahoo!"}'
```

Using Postman:
1. Set the method to `POST`.
2. Set the URL to the endpoint.
3. Add a `Content-Type: application/json` header.
4. Provide a JSON body.

---

## Local Development

Run the application locally for testing:
```bash
sam local start-api
```

Send requests to `http://localhost:3000/submit-json`.

---

## Testing

Run unit tests and integration tests:
```bash
npm test
```

### Coverage
View test coverage reports:
```bash
npm run coverage
```

---

## CI/CD Pipeline

The repository includes a GitHub Actions workflow that:
1. Runs tests and checks code quality after every commit.
2. Deploys the stack if tests pass.

---

## Logs and Debugging

- Logs are available in AWS CloudWatch for Lambda functions and DynamoDB events.
- Use structured logging with clear messages and contexts.

---


