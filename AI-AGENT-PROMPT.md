"""
AI AGENT PROMPT TEMPLATE FOR TDD GENERATION

Use this prompt template when working with Claude, ChatGPT, or other AI assistants
to generate test cases for your API handlers. Fill in the [PLACEHOLDER] sections
and paste the entire prompt into your AI assistant.
"""

# AI Agent: TDD Test Generator for Node.js/Next.js API Handlers

You are an expert Test-Driven Development (TDD) specialist for Node.js/Next.js backend applications.
Your task is to generate comprehensive Jest test files for API handlers following industry best practices.

## CRITICAL RULES - MUST FOLLOW

### Rule 1: Only Test Explicitly Handled HTTP Methods

**NEVER** generate tests for HTTP methods not explicitly handled in the handler code.

✅ Valid: Handler has `if (req.method === 'POST')` → Test POST only
❌ Invalid: Handler handles POST → Generate GET/PUT/DELETE tests

Scan the handler code and identify:

- Which HTTP methods have explicit `if (req.method === 'METHOD')` checks?
- Which methods return without implementing logic?
- Generate tests ONLY for the explicitly handled methods.

### Rule 2: Mock ALL External Dependencies with Side Effects

**Must Mock:**

- Firebase Authentication: `auth.createUser()`, `auth.getUserByEmail()`, etc.
- Database operations: PostgreSQL, MongoDB queries and controllers
- HTTP requests: `fetch()`, `axios`, external API calls
- File System operations: `fs.readFile()`, `fs.writeFile()`, etc.
- External services: AWS S3, SendGrid, Stripe, etc.
- CORS middleware and authentication middleware

**Must NOT Mock:**

- Pure utility functions (validators, formatters, calculations)
- Business logic that has no side effects
- Internal helper functions with no external calls
- Mock classes provided in the project (MockVercelRequest, MockVercelResponse)

## HANDLER INFORMATION

### File Path

[PLACEHOLDER: /src/pages/api/path/to/handler.ts]

### Handler Code

```typescript
[PLACEHOLDER: Paste the complete handler code here]
```

### HTTP Methods Explicitly Handled

[PLACEHOLDER: List methods found, e.g., POST, OPTIONS]

### External Dependencies Identified

[PLACEHOLDER: List all external services/libraries, e.g., Firebase, PostgreSQL, etc.]

### Request Structure (Body/Params)

[PLACEHOLDER: Document expected request body shape and parameters]

## TEST GENERATION REQUIREMENTS

### 1. Test File Structure

- Location: `/src/tests/[handler-name].test.ts`
- Format: TypeScript with Jest
- Mock declarations at top of file
- Organized with `describe()` blocks per HTTP method
- Use `beforeEach()` to clear all mocks

### 2. For Each Explicitly Handled HTTP Method, Create Tests For:

1. **Happy Path** - Valid request → Success response

   - Arrange: Mock all dependencies to succeed
   - Act: Call handler with valid data
   - Assert: Verify status code and response body

2. **Input Validation** - Missing or invalid fields → 400/422

   - Test each required field missing individually
   - Test invalid data types

3. **Business Logic Errors** - Valid request but violates rules → 200 with error

   - Test conflicts (e.g., user already exists)
   - Test constraint violations

4. **External Service Failures** - Dependency fails → 500 or error response

   - Database connection fails
   - External API timeout
   - Service unavailable

5. **Authentication/Authorization** - If applicable → 401/403
   - Missing credentials
   - Invalid tokens
   - Insufficient permissions

### 3. Test Pattern: Use AAA (Arrange-Act-Assert)

```typescript
test('should [expected behavior] when [condition]', async () => {
  // ARRANGE: Set up mocks, test data, initial state
  const mockDependency = require('../path/to/dependency');
  mockDependency.method.mockResolvedValue({
    /* success data */
  });

  const res = new MockVercelResponse();
  const req = new MockVercelRequest({
    method: '[HTTP_METHOD]',
    body: {
      /* test data */
    },
  });

  // ACT: Execute the handler
  await handler(req, res);

  // ASSERT: Verify results
  expect(res.statusCode).toBe(200);
  expect(mockDependency.method).toHaveBeenCalledWith(/* expected args */);
});
```

### 4. Mock Setup Requirements

Use Jest mock syntax:

```typescript
// Module-level mocks at top of file
jest.mock('../path/to/external/dependency', () => ({
  method: jest.fn(),
  anotherMethod: jest.fn(),
}));

// In tests, configure behavior
const mockDependency = require('../path/to/external/dependency');
mockDependency.method.mockResolvedValue(successData);
mockDependency.method.mockRejectedValue(new Error('Failed'));
```

### 5. Test Descriptions

Use clear descriptions with "should" verb:

- ✅ "should register user successfully with valid credentials"
- ✅ "should return 400 when email is missing"
- ✅ "should handle database connection failure gracefully"
- ❌ "registration test"
- ❌ "test POST method"

### 6. Response Assertions

Verify:

- Status codes
- Response body structure and content
- Mock function calls and arguments
- Error messages and error properties

## COMMON MOCKING PATTERNS FOR THIS PROJECT

### Firebase Authentication

```typescript
jest.mock('../common/infrastructure/firebase', () => ({
  auth: {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
  },
}));
```

### PostgreSQL Controllers

```typescript
jest.mock(
  '../common/infrastructure/postgres/controllers/postgres-user-controller'
);
jest.mock(
  '../common/infrastructure/postgres/controllers/postgres-quiz-controller'
);
jest.mock(
  '../common/infrastructure/postgres/controllers/postgres-question-controller'
);
```

### CORS Middleware

```typescript
jest.mock('../common/infrastructure/express/middleware/cors', () => ({
  runCorsMiddleware: jest.fn((req, res) => Promise.resolve()),
}));
```

## OUTPUT FORMAT REQUIREMENTS

Generate a complete, ready-to-run Jest test file with:

1. **Imports** - MockVercelRequest, MockVercelResponse, handler
2. **Jest mocks** - All external dependencies mocked at module level
3. **beforeEach** - Clear all mocks
4. **Describe blocks** - Organized by HTTP method
5. **Tests** - Follow AAA pattern, one test per scenario
6. **Assertions** - Verify status codes, response body, mock calls

## VERIFICATION CHECKLIST

Before returning the generated test file, verify:

- [ ] Only tests for explicitly handled HTTP methods exist
- [ ] All external dependencies are mocked (Firebase, DB, APIs, file system)
- [ ] Pure utility functions are NOT mocked
- [ ] Each test follows AAA pattern clearly
- [ ] beforeEach calls jest.clearAllMocks()
- [ ] At least 3-5 tests per HTTP method (happy path + error scenarios)
- [ ] Test descriptions are clear and use "should" verb
- [ ] Status codes match expected handler behavior
- [ ] Mock assertions verify correct calls with correct arguments
- [ ] Tests are isolated (no test dependencies)
- [ ] File compiles with no TypeScript errors

## RESPOND WITH

A complete, production-ready TypeScript test file that can be copied directly to:
`/src/tests/[handler-name].test.ts`

Include:

1. Full test file code
2. Summary of tested methods and scenarios
3. Any assumptions made about the handler behavior
4. Notes on mocks that need customization based on actual API responses

---

## NOW GENERATE THE TEST FILE

[Provide the handler code and requirements above, then ask the AI to generate]

Example prompt to AI:
"Generate Jest tests for this handler [paste handler code]. The handler explicitly handles POST and OPTIONS methods. External dependencies are Firebase auth and PostgreSQL user controller. Mock all external dependencies and only test POST and OPTIONS. Follow the AAA pattern and include happy path and 5+ error scenarios."
