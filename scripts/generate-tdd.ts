#!/usr/bin/env ts-node
/**
 * TDD Generation Script with AI Agent Instructions
 *
 * This script helps generate comprehensive Test-Driven Development (TDD) tests
 * for API handlers following best practices.
 *
 * Best Practices Applied:
 * 1. Only generate tests for HTTP methods explicitly handled by the handler (GET, POST, PUT, DELETE, etc.)
 * 2. Mock external dependencies (Firebase, Database, File System, API calls)
 * 3. Use Arrange-Act-Assert (AAA) pattern
 * 4. Test happy paths and error scenarios
 * 5. Keep tests isolated and independent
 * 6. Mock side effects and external services
 */

import fs from 'fs';
import path from 'path';

interface HandlerMethodConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
  description: string;
  pathParams?: string[];
  queryParams?: string[];
  bodySchema?: Record<string, any>;
  successStatusCode: number;
  errorStatusCodes: number[];
  externalDependencies: string[];
}

interface HandlerConfig {
  handlerPath: string;
  handlerName?: string;
  description: string;
  methods: HandlerMethodConfig[];
  mockLibraries: string[];
  baseTestPath?: string;
}

/**
 * CRITICAL RULE: Only generate tests for methods that the handler EXPLICITLY handles.
 * Do NOT assume or generate tests for unimplemented methods.
 */
const AI_AGENT_INSTRUCTIONS = `
=== AI AGENT INSTRUCTIONS FOR TDD GENERATION ===

## Core Principle
Generate Test-Driven Development (TDD) tests ONLY for HTTP methods that are explicitly 
handled in the provided handler code. Do not generate tests for hypothetical, unimplemented, 
or assumed HTTP methods.

## Mocking Rules (CRITICAL)
Mock all external dependencies that:
- Make API calls (fetch, axios, HttpClient)
- Write to or read from databases (PostgreSQL, MongoDB, etc.)
- Access file systems (fs module)
- Access external services (Firebase, AWS S3, etc.)
- Make HTTP requests to external services

Examples of what to mock:
✓ Firebase Authentication (auth.createUser, auth.getUserByEmail, auth.deleteUser)
✓ Database operations (PostgreSQL queries, connection pools)
✓ HTTP requests (fetch, axios calls)
✓ File I/O operations
✗ Do NOT mock: Pure utility functions, validators, business logic transformations

## Test Pattern: AAA (Arrange-Act-Assert)
Each test should follow this structure:

describe('Handler Description', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle [scenario]', async () => {
    // Arrange: Set up mocks, test data, and expectations
    const mockDependency = jest.fn().mockResolvedValue(...);
    const req = new MockVercelRequest({...});
    
    // Act: Call the handler
    await handler(req, res);
    
    // Assert: Verify behavior
    expect(res.statusCode).toBe(200);
    expect(mockDependency).toHaveBeenCalledWith(...);
  });
});

## Test Scenarios to Include
For each implemented HTTP method, test:

1. **Happy Path**: Successful execution with valid input
2. **Validation Errors**: Missing or invalid required fields
3. **Business Logic Errors**: Conflicts (e.g., user already exists)
4. **External Service Failures**: Database down, API unavailable
5. **Unauthorized/Forbidden**: Missing auth, insufficient permissions
6. **CORS/Method Handling**: OPTIONS requests, unsupported methods

## TypeScript/Jest Best Practices
- Use jest.Mock<> for type-safe mocks
- Mock at module boundaries (infrastructure layer)
- Use jest.clearAllMocks() in beforeEach
- Test async/await properly with async/await in tests
- Use explicit return types for mocked functions
- Separate unit tests from integration tests

## Output Format
Generate a complete .test.ts file with:
- Proper imports (use relative paths matching your structure)
- All necessary mocks declared at the top
- Organized describe blocks per HTTP method
- Clear test descriptions using "should" verb
- Proper status codes and response assertions

## Example Structure
\`\`\`typescript
import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler from '../pages/api/...';

jest.mock('../common/infrastructure/firebase', () => ({
  auth: {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
  },
}));

describe('/api/path/to/handler', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST', () => {
    test('should create resource with valid data', async () => {
      // AAA pattern
    });
  });

  describe('GET', () => {
    test('should return resource', async () => {
      // AAA pattern
    });
  });
});
\`\`\`

## Verification Checklist Before Generating
- [ ] Identified all explicitly handled HTTP methods in the handler
- [ ] Listed all external dependencies (database, APIs, file system)
- [ ] Created mocks for all external dependencies
- [ ] Planned test scenarios (happy path + error cases)
- [ ] Ensured tests use AAA pattern
- [ ] Verified mock setup/teardown (beforeEach/afterEach)
`;

/**
 * Template for generating test files
 */
class TDDTestGenerator {
  /**
   * Analyze handler code to extract HTTP methods
   */
  static extractHandlerMethods(handlerCode: string): string[] {
    const methodPattern = /req\.method\s*===\s*['"]([A-Z]+)['"]/g;
    const methods = new Set<string>();

    let match;
    while ((match = methodPattern.exec(handlerCode)) !== null) {
      methods.add(match[1]);
    }

    return Array.from(methods);
  }

  /**
   * Extract external dependencies from imports and code
   */
  static extractDependencies(handlerCode: string): string[] {
    const dependencies = new Set<string>();

    // Look for common external libraries
    const patterns = [
      /firebase[/-][^;]*/gi,
      /postgres|database|db\./gi,
      /fetch|axios|http(Client)?/gi,
      /fs\.|readFile|writeFile/gi,
      /aws-sdk|@aws-sdk/gi,
    ];

    patterns.forEach((pattern) => {
      const matches = handlerCode.match(pattern);
      if (matches) {
        matches.forEach((m) => dependencies.add(m.split(/[,;\s]/)[0]));
      }
    });

    return Array.from(dependencies);
  }

  /**
   * Generate test template for a handler
   */
  static generateTestTemplate(config: HandlerConfig): string {
    const { handlerPath, handlerName, description, methods, mockLibraries } =
      config;
    const handlerFileName = path.basename(handlerPath, '.ts');
    const testFileName = `${handlerFileName}.test.ts`;
    const relativePath = this.getRelativePath(handlerPath);

    // Generate mock declarations
    const mockDeclarations = this.generateMockDeclarations(mockLibraries);

    // Generate describe blocks for each method
    const methodDescribes = methods
      .map((m) => this.generateMethodDescribe(m))
      .join('\n\n');

    const template = `import { MockVercelRequest } from '../common/classes/MockVercelRequest';
import { MockVercelResponse } from '../common/classes/MockVercelResponse';
import handler from '${relativePath}';

${mockDeclarations}

describe('${description}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

${methodDescribes}

  describe('Method Not Allowed', () => {
    test('should return 405 for unsupported HTTP method', async () => {
      // Arrange
      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'PATCH', // Unsupported method
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(405);
    });
  });

  describe('CORS Handling', () => {
    test('should handle OPTIONS request with CORS headers', async () => {
      // Arrange
      const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: 'OPTIONS',
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
    });
  });
});
`;

    return template;
  }

  /**
   * Generate mock declarations for external dependencies
   */
  private static generateMockDeclarations(mockLibraries: string[]): string {
    if (mockLibraries.length === 0) {
      return '// No external dependencies to mock';
    }

    const mockDeclarations = mockLibraries
      .map((lib) => {
        if (lib.includes('firebase')) {
          return `// Mock Firebase
jest.mock('../common/infrastructure/firebase', () => ({
  auth: {
    createUser: jest.fn(),
    getUserByEmail: jest.fn(),
    deleteUser: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
  },
}));`;
        }

        if (lib.includes('postgres') || lib.includes('database')) {
          return `// Mock PostgreSQL/Database
jest.mock('../common/infrastructure/postgres', () => ({
  query: jest.fn(),
  queryOne: jest.fn(),
}));`;
        }

        if (lib.includes('controller')) {
          return `// Mock Data Controller
jest.mock('../common/infrastructure/postgres/controllers/postgres-user-controller');
jest.mock('../common/infrastructure/postgres/controllers/postgres-quiz-controller');
jest.mock('../common/infrastructure/postgres/controllers/postgres-question-controller');`;
        }

        if (lib.includes('cors')) {
          return `// Mock CORS middleware
jest.mock('../common/infrastructure/express/middleware/cors', () => ({
  runCorsMiddleware: jest.fn((req, res) => Promise.resolve()),
}));`;
        }

        return `// Mock ${lib}
jest.mock('${lib}');`;
      })
      .join('\n\n');

    return mockDeclarations;
  }

  /**
   * Generate describe block for a specific HTTP method
   */
  private static generateMethodDescribe(method: HandlerMethodConfig): string {
    const tests = [
      this.generateHappyPathTest(method),
      ...this.generateErrorScenarioTests(method),
    ].join('\n\n  ');

    return `  describe('${method.method}', () => {
    ${tests}
  });`;
  }

  /**
   * Generate happy path test
   */
  private static generateHappyPathTest(method: HandlerMethodConfig): string {
    const mockSetup =
      method.externalDependencies.length > 0
        ? `    // Setup mocks for successful execution\n    // (customize based on actual dependencies)\n`
        : '';

    return `test('should ${method.description} with valid input', async () => {
      // Arrange
      ${mockSetup}const res = new MockVercelResponse();
      const req = new MockVercelRequest({
        method: '${method.method}',
        ${
          method.pathParams
            ? `params: { ${method.pathParams
                .map((p) => `${p}: 'test-value'`)
                .join(', ')} },`
            : ''
        }
        ${
          method.queryParams
            ? `query: { ${method.queryParams
                .map((q) => `${q}: 'test-value'`)
                .join(', ')} },`
            : ''
        }
        ${
          method.bodySchema
            ? `body: {\n        ${Object.keys(method.bodySchema)
                .map((k) => `${k}: 'test-value'`)
                .join(',\n        ')},\n      },`
            : ''
        }
      });

      // Act
      await handler(req, res);

      // Assert
      expect(res.statusCode).toBe(${method.successStatusCode});
      // Add more specific assertions based on response structure
    });`;
  }

  /**
   * Generate error scenario tests
   */
  private static generateErrorScenarioTests(
    method: HandlerMethodConfig
  ): string[] {
    const tests = [];

    // Test for missing required fields
    if (method.bodySchema && Object.keys(method.bodySchema).length > 0) {
      tests.push(`test('should return error when required field is missing', async () => {
        // Arrange
        const res = new MockVercelResponse();
        const req = new MockVercelRequest({
          method: '${method.method}',
          body: {
            // Intentionally missing required field
          },
        });

        // Act
        await handler(req, res);

        // Assert
        expect([400, 422]).toContain(res.statusCode);
      });`);
    }

    // Test for external service failure
    if (method.externalDependencies.length > 0) {
      tests.push(`test('should handle external service failure gracefully', async () => {
        // Arrange
        // Mock external dependency to fail
        // const mockService = require('../path/to/service');
        // mockService.operation.mockRejectedValue(new Error('Service unavailable'));
        
        const res = new MockVercelResponse();
        const req = new MockVercelRequest({
          method: '${method.method}',
        });

        // Act
        await handler(req, res);

        // Assert
        expect([500, 502, 503]).toContain(res.statusCode);
      });`);
    }

    return tests;
  }

  /**
   * Calculate relative path from test directory to handler
   */
  private static getRelativePath(handlerPath: string): string {
    // This is a simplified version - adjust based on your project structure
    const parts = handlerPath.split(/[\\/]/);
    const testsIndex = parts.indexOf('tests');
    const apiIndex = parts.indexOf('api');

    if (testsIndex !== -1 && apiIndex !== -1) {
      const depth = parts.length - testsIndex - 1;
      const relativeFromTests = parts.slice(apiIndex).join('/');
      return `../${relativeFromTests}`;
    }

    return handlerPath;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║    TDD Test Generator - Best Practices & Rules     ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');

  console.log(AI_AGENT_INSTRUCTIONS);
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Create instructions file
  const instructionsPath = path.join(__dirname, '../TDD-INSTRUCTIONS.md');
  fs.writeFileSync(instructionsPath, AI_AGENT_INSTRUCTIONS);
  console.log(`✓ Instructions saved to: ${instructionsPath}`);
  console.log('');

  // Example usage
  const exampleConfig: HandlerConfig = {
    handlerPath: './src/pages/api/public/users/register-user.ts',
    description: '/api/public/users/register-user',
    mockLibraries: ['firebase', 'postgres-user-controller', 'cors'],
    methods: [
      {
        method: 'POST',
        description: 'register a new user',
        bodySchema: {
          email: 'string',
          password: 'string',
          firstName: 'string',
          lastName: 'string',
        },
        successStatusCode: 200,
        errorStatusCodes: [400, 422, 500],
        externalDependencies: ['Firebase', 'PostgreSQL'],
      },
      {
        method: 'OPTIONS',
        description: 'handle CORS preflight request',
        successStatusCode: 200,
        errorStatusCodes: [],
        externalDependencies: [],
      },
    ],
  };

  console.log('Example Handler Configuration:');
  console.log(JSON.stringify(exampleConfig, null, 2));
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Generate example test
  const generatedTest = TDDTestGenerator.generateTestTemplate(exampleConfig);
  console.log('Generated Test Template (Preview):');
  console.log(generatedTest.substring(0, 500) + '...');
  console.log('');

  console.log('✓ TDD Generator Ready');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Create a handler config for your API endpoint');
  console.log('2. Identify HTTP methods explicitly handled in the handler');
  console.log('3. List all external dependencies to mock');
  console.log(
    '4. Use TDDTestGenerator.generateTestTemplate(config) to generate tests'
  );
  console.log('5. Run: npm test');
  console.log('');
}

main();

export { TDDTestGenerator, AI_AGENT_INSTRUCTIONS };
export type { HandlerConfig, HandlerMethodConfig };
