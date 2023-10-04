# Apideck: POC Applicant to Employee Onboarding

This is a sample project that contains a POC application that listens to webhooks from Apideck's Unified APIs and push hired Applicant (ATS) to HRIS systems for Employee Onboarding.

**Prerequisites**: 
 - [Node.js](https://nodejs.org/en/)
 - [Apideck account](https://platform.apideck.com/configuration/api-keys).
 - A consumer that has access to an ATS integration (like "TeamTailor") and a HRIS integration (like humaans-io).

## Getting started

Clone the repository:

```bash
git clone 
```

Install the dependencies:

```bash
npm install
``` 

Copy the .env.example file to .env and fill in the required values:

```bash
cp .env.example .env
```

## Configure the environment variables

Configure the following environment variables in the `.env` file:
- `APIDECK_API_KEY`: Your Apideck API key
- `APIDECK_APP_ID`: Your Apideck App ID
- `APIDECK_CONSUMER_ID`: Your Apideck Consumer ID
- `SERVICE_ID_ATS`: The ID of the ATS service you want to use (e.g. "teamtailor")
- `SERVICE_ID_HRIS`: The ID of the HRIS service you want to use (e.g. "humaans-io")

## Launching the app

Now you can launch the app locally:

```bash
npm start
```

Alternatively, you can run one of the following apps:
    `npm run start`

The app runs by default on port 7777

## Making this app public with ngrok

To make your app public using ngrok, enter:

```bash
npm run start:ngrok
```

## Triggering the webhook

To trigger the webhook, you can use the following command:

```bash
curl --location --request POST '127.0.0.1:7777/start' \
--header 'Content-Type: application/json' \
--data-raw '{
  "payload": {
    "event_type": "ats.application.updated",
    "unified_api": "ats",
    "service_id": "teamtailor",
    "consumer_id": "test-consumer",
    "event_id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
    "entity_id": "67305287",
    "entity_url": "https://unify.apideck.com/ats/applications/67305287",
    "entity_type": "application",
    "occurred_at": "2023-09-22T00:00:00.000Z"
  }
}'
``` 

 > INFO: Be sure to replace the `entity_id` and `entity_url` with an actual Application ID.

or use the Postman collection from the repository.

## More details

More details can be found in the [Apideck docs](https://developers.apideck.com/).