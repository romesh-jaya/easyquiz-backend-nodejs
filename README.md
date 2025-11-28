# EasyQuiz Backend - NodeJS Serverless

These are NodeJS serverless functions hosted on NextJS SDK, used to interface the Postgres DB and Authentication for EasyQuiz app available [here](https://github.com/romesh-jaya/easyquiz-quasar).

## Architecture Overview

This project implements **Clean Architecture** principles to maintain separation of concerns and improve maintainability:

- **Use Cases** - Business logic layer containing domain-specific operations (e.g., creating quizzes, managing user accounts)
- **Infrastructure** - Data access layer with database adapters and external service integrations
- **Interfaces & Types** - Contract definitions (DAOs, request/response types) ensuring loose coupling between layers
- **Controllers** - Bridge between use cases and infrastructure, orchestrating operations
- **Utils** - Cross-cutting concerns and helper functions

This layered approach allows features to be developed, tested, and modified independently while maintaining clear dependencies.

## Folder Structure

```
src/
├── common/
│   ├── use-cases/         # Business logic organized by domain (quiz, user, quiz-attempt, quiz-question)
│   ├── infrastructure/    # Data access layer with external service integrations
│   │   ├── firebase/      # Firebase authentication client initialization
│   │   ├── postgres/      # Database models, repositories, and controllers
│   │   ├── logger/        # Logging utilities
│   │   └── express/       # Express framework configuration
│   ├── controllers/       # Domain controllers coordinating use cases
│   ├── interfaces/        # DAO and data transfer object contracts
│   ├── types/            # TypeScript type definitions for requests/responses
│   ├── enums/            # Shared enumerations (QuizStatus, CRUDActionType)
│   ├── constants/        # Application constants and messages
│   ├── utils/            # Helper utilities for business logic
└── pages/
    └── api/              # NextJS API routes
        ├── public/       # Unauthenticated endpoints
        └── auth/         # Authenticated endpoints
```

## Other Technical details

- Interfaces with Postgres database. DB creation scripts are in the /database folder
- Firebase Authentication for user management and authorization

## API Paths

- /api - checks if server is up.
- /api/public - handles all unauthenticated requests.
- /api/auth - handles all authenticated requests

## .env variables

All fields mentioned in .env.example must be filled with correct values and renamed as .env.
Firebase service key must be placed in the /keys directory for project to run successfully

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Starts the app.

## Deployment

`npm run deploy`

- need to use Vercel CLI to deploy as there are firebase keys to go with the deployment. Remember to promote a particular build into production once verified.

## Note

April 2023, had to switch from Vercel Backend Functions to NextJS Backend Functions, as the deployed version on the cloud wasn't working correctly. Make sure framework preset is set to NextJS.
