# EasyQuiz Backend - NodeJS Serverless

These are NodeJS serverless functions used to interface the Postgres DB and Authentication for EasyQuiz app.

## Technical details

- Interfaces with Postgres database. DB creation scripts are in the /database folder

## API Paths

- /api/public - handles all unauthenticated requests
- /api/auth - handles all authenticated requests

## .env variables

All fields mentioned in .env.example must be filled with correct values and renamed as .env.
Firebase service key must be placed in the /keys directory for project to run successfully

## Available Scripts

In the project directory, you can run:

### `npm start`

Starts the app.

## Deployment

`npm run deploy`
