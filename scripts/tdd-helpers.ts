/**
 * TDD Helper Utilities
 *
 * Utility functions to help analyze handlers and generate test configurations
 */

import fs from 'fs';
import path from 'path';

/**
 * Analyzes a handler file to extract:
 * - HTTP methods handled
 * - External dependencies
 * - Request structure
 */
export class HandlerAnalyzer {
  /**
   * Extract all HTTP methods explicitly handled in the handler
   */
  static extractHandledMethods(handlerCode: string): string[] {
    const methodPattern =
      /if\s*\(\s*req\.method\s*===\s*['"]([A-Z]+)['"]\s*\)/g;
    const methods = new Set<string>();

    let match;
    while ((match = methodPattern.exec(handlerCode)) !== null) {
      methods.add(match[1]);
    }

    // Also check switch statements
    const switchPattern = /case\s+['"]([A-Z]+)['"]\s*:/g;
    while ((match = switchPattern.exec(handlerCode)) !== null) {
      methods.add(match[1]);
    }

    return Array.from(methods).sort();
  }

  /**
   * Extract Firebase dependencies
   */
  static extractFirebaseDependencies(handlerCode: string): string[] {
    const firebaseMethods = [
      'createUser',
      'getUserByEmail',
      'deleteUser',
      'updateUser',
      'getUser',
      'verifyIdToken',
      'revokeRefreshToken',
    ];

    const deps = new Set<string>();
    firebaseMethods.forEach((method) => {
      if (
        handlerCode.includes(`auth.${method}`) ||
        handlerCode.includes(`firebase.${method}`)
      ) {
        deps.add(`auth.${method}`);
      }
    });

    return Array.from(deps).sort();
  }

  /**
   * Extract PostgreSQL/Database dependencies
   */
  static extractDatabaseDependencies(handlerCode: string): string[] {
    const dbControllers = [
      'postgres-user-controller',
      'postgres-quiz-controller',
      'postgres-question-controller',
      'postgres-attempt-controller',
    ];

    const deps = new Set<string>();
    dbControllers.forEach((controller) => {
      if (handlerCode.includes(controller)) {
        deps.add(controller);
      }
    });

    return Array.from(deps).sort();
  }

  /**
   * Extract external API calls
   */
  static extractApiDependencies(handlerCode: string): string[] {
    const patterns = [
      /fetch\s*\(/g,
      /axios\.(get|post|put|delete|patch)\s*\(/g,
      /http\.(get|post|put|delete|patch)\s*\(/g,
    ];

    const hasApiCalls = patterns.some((pattern) => pattern.test(handlerCode));
    return hasApiCalls ? ['External API'] : [];
  }

  /**
   * Extract file system dependencies
   */
  static extractFileSystemDependencies(handlerCode: string): string[] {
    const patterns = [
      /fs\.readFile/g,
      /fs\.writeFile/g,
      /fs\.readdir/g,
      /readFileSync/g,
      /writeFileSync/g,
    ];

    const hasFileOps = patterns.some((pattern) => pattern.test(handlerCode));
    return hasFileOps ? ['File System'] : [];
  }

  /**
   * Extract required body fields from handler validation
   */
  static extractRequiredBodyFields(handlerCode: string): string[] {
    const fields = new Set<string>();

    // Look for destructuring patterns
    const destructPattern = /const\s*{\s*([^}]+)\s*}\s*=\s*req\.body/g;
    let match = destructPattern.exec(handlerCode);
    if (match) {
      match[1].split(',').forEach((field) => {
        fields.add(field.trim());
      });
    }

    // Look for explicit field access checks
    const fieldCheckPattern = /req\.body\.([a-zA-Z_]\w*)/g;
    while ((match = fieldCheckPattern.exec(handlerCode)) !== null) {
      fields.add(match[1]);
    }

    return Array.from(fields).sort();
  }

  /**
   * Extract path parameters from route
   */
  static extractPathParams(routePath: string): string[] {
    const paramPattern = /\[([^\]]+)\]/g;
    const params = new Set<string>();

    let match;
    while ((match = paramPattern.exec(routePath)) !== null) {
      params.add(match[1]);
    }

    return Array.from(params).sort();
  }

  /**
   * Analyze complete handler and return summary
   */
  static analyzeHandler(handlerFilePath: string): HandlerAnalysisSummary {
    const handlerCode = fs.readFileSync(handlerFilePath, 'utf-8');
    const routePath = this.getRoutePathFromFile(handlerFilePath);

    return {
      filePath: handlerFilePath,
      routePath,
      handledMethods: this.extractHandledMethods(handlerCode),
      firebaseDependencies: this.extractFirebaseDependencies(handlerCode),
      databaseDependencies: this.extractDatabaseDependencies(handlerCode),
      apiDependencies: this.extractApiDependencies(handlerCode),
      fileSystemDependencies: this.extractFileSystemDependencies(handlerCode),
      requiredBodyFields: this.extractRequiredBodyFields(handlerCode),
      pathParameters: this.extractPathParams(routePath),
    };
  }

  /**
   * Convert route path (e.g., [quizId].ts) to route pattern
   */
  private static getRoutePathFromFile(filePath: string): string {
    const parts = filePath.split(path.sep);
    const apiIndex = parts.findIndex((p) => p === 'api');

    if (apiIndex === -1) return '/api/unknown';

    return (
      '/' +
      parts
        .slice(apiIndex)
        .join('/')
        .replace(/\.ts$/, '')
        .replace(/\[([^\]]+)\]/g, ':$1')
        .replace(/index/g, '')
    );
  }

  /**
   * Generate mock declarations from analysis
   */
  static generateMockDeclarations(analysis: HandlerAnalysisSummary): string[] {
    const mocks: string[] = [];

    if (analysis.firebaseDependencies.length > 0) {
      mocks.push(
        "jest.mock('../common/infrastructure/firebase', () => ({\n" +
          '  auth: {\n' +
          '    createUser: jest.fn(),\n' +
          '    getUserByEmail: jest.fn(),\n' +
          '    deleteUser: jest.fn(),\n' +
          '    updateUser: jest.fn(),\n' +
          '    getUser: jest.fn(),\n' +
          '  },\n' +
          '}));'
      );
    }

    if (analysis.databaseDependencies.length > 0) {
      analysis.databaseDependencies.forEach((controller) => {
        mocks.push(
          `jest.mock('../common/infrastructure/postgres/controllers/${controller}');`
        );
      });
    }

    if (analysis.apiDependencies.length > 0) {
      mocks.push("jest.mock('axios');");
    }

    if (analysis.fileSystemDependencies.length > 0) {
      mocks.push("jest.mock('fs');");
    }

    return mocks;
  }

  /**
   * Generate CORS mock if needed
   */
  static getCORSMockDeclaration(): string {
    return (
      "jest.mock('../common/infrastructure/express/middleware/cors', () => ({\n" +
      '  runCorsMiddleware: jest.fn((req, res) => Promise.resolve()),\n' +
      '}));'
    );
  }
}

/**
 * Test scenario generator based on handler analysis
 */
export class TestScenarioGenerator {
  /**
   * Generate test scenario suggestions for a handler
   */
  static generateScenarios(analysis: HandlerAnalysisSummary): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // Happy path tests
    analysis.handledMethods.forEach((method) => {
      if (method !== 'OPTIONS') {
        scenarios.push({
          name: `should ${method.toLowerCase()} successfully`,
          type: 'happy-path',
          method,
          description: `Valid ${method} request with all required fields`,
        });
      }
    });

    // Validation tests
    if (
      analysis.requiredBodyFields.length > 0 &&
      (analysis.handledMethods.includes('POST') ||
        analysis.handledMethods.includes('PUT'))
    ) {
      analysis.requiredBodyFields.forEach((field) => {
        scenarios.push({
          name: `should return 400 when ${field} is missing`,
          type: 'validation',
          method: 'POST',
          description: `Missing required field: ${field}`,
        });
      });
    }

    // External service failure tests
    if (analysis.firebaseDependencies.length > 0) {
      scenarios.push({
        name: 'should handle Firebase authentication error',
        type: 'external-error',
        method: analysis.handledMethods[0],
        description: 'Firebase service returns error',
      });
    }

    if (analysis.databaseDependencies.length > 0) {
      scenarios.push({
        name: 'should handle database connection failure',
        type: 'external-error',
        method: analysis.handledMethods[0],
        description: 'Database query fails',
      });
    }

    // Authorization tests
    if (analysis.filePath.includes('/auth/')) {
      scenarios.push({
        name: 'should return 401 for unauthenticated request',
        type: 'auth',
        method: analysis.handledMethods[0],
        description: 'Missing or invalid authentication',
      });
    }

    // OPTIONS and 405 tests
    if (!analysis.handledMethods.includes('OPTIONS')) {
      scenarios.push({
        name: 'should handle OPTIONS request for CORS',
        type: 'cors',
        method: 'OPTIONS',
        description: 'CORS preflight request',
      });
    }

    scenarios.push({
      name: 'should return 405 for unsupported HTTP method',
      type: 'method-not-allowed',
      method: 'DELETE',
      description: 'Unsupported HTTP method',
    });

    return scenarios;
  }
}

/**
 * Generate a report of handler analysis
 */
export class HandlerAnalysisReporter {
  static generateReport(analysis: HandlerAnalysisSummary): string {
    const lines: string[] = [
      `# Handler Analysis Report`,
      ``,
      `## File: ${analysis.filePath}`,
      `## Route: ${analysis.routePath}`,
      ``,
      `### Handled HTTP Methods`,
      ...analysis.handledMethods.map((m) => `- ${m}`),
      ``,
      `### External Dependencies`,
    ];

    if (analysis.firebaseDependencies.length > 0) {
      lines.push(`**Firebase:**`);
      lines.push(...analysis.firebaseDependencies.map((d) => `- ${d}`));
    }

    if (analysis.databaseDependencies.length > 0) {
      lines.push(`**Database:**`);
      lines.push(...analysis.databaseDependencies.map((d) => `- ${d}`));
    }

    if (analysis.apiDependencies.length > 0) {
      lines.push(`**External APIs:**`);
      lines.push(...analysis.apiDependencies.map((d) => `- ${d}`));
    }

    if (analysis.fileSystemDependencies.length > 0) {
      lines.push(`**File System:**`);
      lines.push(...analysis.fileSystemDependencies.map((d) => `- ${d}`));
    }

    lines.push(``);
    lines.push(`### Request Structure`);

    if (analysis.pathParameters.length > 0) {
      lines.push(`**Path Parameters:**`);
      lines.push(...analysis.pathParameters.map((p) => `- ${p}`));
    }

    if (analysis.requiredBodyFields.length > 0) {
      lines.push(`**Required Body Fields:**`);
      lines.push(...analysis.requiredBodyFields.map((f) => `- ${f}`));
    }

    lines.push(``);
    lines.push(`### Recommended Tests`);
    const scenarios = TestScenarioGenerator.generateScenarios(analysis);
    lines.push(...scenarios.map((s) => `- ${s.name}`));

    return lines.join('\n');
  }
}

/**
 * Type definitions
 */
export interface HandlerAnalysisSummary {
  filePath: string;
  routePath: string;
  handledMethods: string[];
  firebaseDependencies: string[];
  databaseDependencies: string[];
  apiDependencies: string[];
  fileSystemDependencies: string[];
  requiredBodyFields: string[];
  pathParameters: string[];
}

export interface TestScenario {
  name: string;
  type:
    | 'happy-path'
    | 'validation'
    | 'external-error'
    | 'auth'
    | 'cors'
    | 'method-not-allowed';
  method: string;
  description: string;
}

/**
 * Main execution - analyze a handler if run as script
 */
if (require.main === module) {
  const handlerPath = process.argv[2];

  if (!handlerPath) {
    console.error('Usage: npx ts-node tdd-helpers.ts <handler-file-path>');
    process.exit(1);
  }

  const analysis = HandlerAnalyzer.analyzeHandler(handlerPath);
  const report = HandlerAnalysisReporter.generateReport(analysis);

  console.log(report);
  console.log('');
  console.log('='.repeat(60));
  console.log('');
  console.log('Mock Declarations:');
  console.log('');
  HandlerAnalyzer.generateMockDeclarations(analysis).forEach((mock) => {
    console.log(mock);
    console.log('');
  });
  console.log(HandlerAnalyzer.getCORSMockDeclaration());
}

export default {
  HandlerAnalyzer,
  TestScenarioGenerator,
  HandlerAnalysisReporter,
};
