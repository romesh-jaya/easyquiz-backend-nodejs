/**
 * Handler TDD Configuration Examples
 *
 * Use these configuration templates to define which HTTP methods should be tested
 * and which dependencies should be mocked for each of your API handlers.
 */

import { HandlerConfig } from './scripts/generate-tdd';

/**
 * EXAMPLE 1: User Registration Handler
 * File: /src/pages/api/public/users/register-user.ts
 */
export const registerUserHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/public/users/register-user.ts',
  handlerName: 'registerUser',
  description: '/api/public/users/register-user - User Registration Endpoint',

  methods: [
    {
      method: 'POST',
      description: 'register a new user',
      bodySchema: {
        email: 'string (required)',
        password: 'string (required)',
        firstName: 'string (required)',
        lastName: 'string (required)',
      },
      successStatusCode: 200,
      errorStatusCodes: [400, 422, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-user-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * EXAMPLE 2: Get User Quizzes Handler
 * File: /src/pages/api/auth/my-quizzes/index.ts
 */
export const getMyQuizzesHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/auth/my-quizzes/index.ts',
  handlerName: 'getMyQuizzes',
  description: "/api/auth/my-quizzes - Retrieve User's Quizzes",

  methods: [
    {
      method: 'GET',
      description: 'retrieve all quizzes for authenticated user',
      queryParams: ['page', 'limit'],
      successStatusCode: 200,
      errorStatusCodes: [401, 403, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-quiz-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * EXAMPLE 3: Create Quiz Handler
 * File: /src/pages/api/auth/my-quizzes/index.ts (POST)
 */
export const createQuizHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/auth/my-quizzes/index.ts',
  handlerName: 'createQuiz',
  description: '/api/auth/my-quizzes - Create New Quiz',

  methods: [
    {
      method: 'POST',
      description: 'create a new quiz',
      bodySchema: {
        title: 'string (required)',
        description: 'string (optional)',
        timeLimit: 'number (optional)',
        isPublic: 'boolean (optional)',
      },
      successStatusCode: 200,
      errorStatusCodes: [400, 401, 403, 422, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-quiz-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * EXAMPLE 4: Update Quiz Handler
 * File: /src/pages/api/auth/my-quizzes/[quizId].ts
 */
export const updateQuizHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/auth/my-quizzes/[quizId].ts',
  handlerName: 'updateQuiz',
  description: '/api/auth/my-quizzes/[quizId] - Update Quiz Details',

  methods: [
    {
      method: 'GET',
      description: 'retrieve quiz by ID',
      pathParams: ['quizId'],
      successStatusCode: 200,
      errorStatusCodes: [400, 401, 403, 404, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'PUT',
      description: 'update quiz details',
      pathParams: ['quizId'],
      bodySchema: {
        title: 'string (optional)',
        description: 'string (optional)',
        timeLimit: 'number (optional)',
      },
      successStatusCode: 200,
      errorStatusCodes: [400, 401, 403, 404, 422, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-quiz-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * EXAMPLE 5: Quiz Question CRUD Handler
 * File: /src/pages/api/auth/my-quizzes/[quizId]/questions/index.ts
 */
export const quizQuestionsHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/auth/my-quizzes/[quizId]/questions/index.ts',
  handlerName: 'quizQuestions',
  description: '/api/auth/my-quizzes/[quizId]/questions - Quiz Questions CRUD',

  methods: [
    {
      method: 'GET',
      description: 'retrieve all questions for a quiz',
      pathParams: ['quizId'],
      successStatusCode: 200,
      errorStatusCodes: [400, 401, 403, 404, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'POST',
      description: 'create a new question in quiz',
      pathParams: ['quizId'],
      bodySchema: {
        questionText: 'string (required)',
        questionType: 'string (required)',
        answers: 'IAnswer[] (required)',
        correctAnswerIndex: 'number (required)',
      },
      successStatusCode: 200,
      errorStatusCodes: [400, 401, 403, 404, 422, 500],
      externalDependencies: ['Firebase Authentication', 'PostgreSQL'],
    },
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-question-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * TEMPLATE: Create your own handler configuration
 *
 * Steps:
 * 1. Copy this template
 * 2. Find your handler file (e.g., src/pages/api/your-handler.ts)
 * 3. Identify which HTTP methods are explicitly handled (GET, POST, PUT, DELETE, PATCH)
 * 4. List all external dependencies (Firebase, PostgreSQL, etc.)
 * 5. Define request schema (path params, query params, body)
 * 6. Fill in this configuration
 * 7. Use TDDTestGenerator.generateTestTemplate(config) to generate tests
 */
export const yourHandlerConfig: HandlerConfig = {
  handlerPath: './src/pages/api/path/to/your-handler.ts',
  handlerName: 'yourHandler',
  description: '/api/path/to/your-handler - Your Handler Description',

  methods: [
    {
      method: 'POST', // Only include methods explicitly handled
      description: 'what this POST does',
      bodySchema: {
        field1: 'string (required)',
        field2: 'number (optional)',
      },
      successStatusCode: 200,
      errorStatusCodes: [400, 422, 500],
      externalDependencies: ['External Service 1', 'External Service 2'],
    },
    // Add more methods as needed
    {
      method: 'OPTIONS',
      description: 'handle CORS preflight',
      successStatusCode: 200,
      errorStatusCodes: [],
      externalDependencies: [],
    },
  ],

  mockLibraries: [
    // List the exact paths to mock in jest.mock()
    '../common/infrastructure/firebase',
    '../common/infrastructure/postgres/controllers/postgres-xxx-controller',
    '../common/infrastructure/express/middleware/cors',
  ],
};

/**
 * CHECKLIST: Before using a handler configuration
 *
 * - [ ] Handler file path is correct
 * - [ ] HTTP methods listed are explicitly handled in the handler code
 * - [ ] External dependencies are complete (no untracked services)
 * - [ ] Body schema matches the handler's req.body structure
 * - [ ] Path params and query params are accurate
 * - [ ] Success status code matches handler's actual response
 * - [ ] Error status codes cover all error scenarios
 * - [ ] Mock library paths match actual import paths
 * - [ ] No hypothetical methods (only explicitly handled ones)
 *
 * Run verification:
 * - Open the handler file
 * - Search for: if (req.method === 'XXX')
 * - Only those methods should be in your configuration
 */

export default {
  registerUserHandlerConfig,
  getMyQuizzesHandlerConfig,
  createQuizHandlerConfig,
  updateQuizHandlerConfig,
  quizQuestionsHandlerConfig,
};
