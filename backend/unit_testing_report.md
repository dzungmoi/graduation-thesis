# Unit Testing Report

## 1.1 Tools and Libraries
- Testing Framework: Jest (v29.x)
- Libraries: bcryptjs (for password hashing), Sequelize (ORM, mocked), nyc (for coverage, though Jest built-in used)

## 1.2 Scope of Testing
### Tested:
- userService.js: registerService, loginService
- adminService.js: createUserService, updateUserService

### Not Tested:
- Controllers (e.g., userController.js, pestDetectionController.js): These are thin wrappers around services, focus on HTTP req/res. Unit tests should target services for logic.
- Models: Sequelize models are data definitions, no business logic to test.
- Config files (e.g., imagekit.js, connectDB.js): Configuration/setup code, not functional logic.
- Routers: Routing logic, better tested via integration tests.
- Frontend: React components, use React Testing Library instead.
- Model server (Python): Separate, use pytest if needed.

## 1.3 Create unit test cases
See unit_test_report.csv for detailed test cases.

## 1.4 Project Link
GitHub URL: [Not available yet - project is local. Upload to GitHub for sharing.]

## 1.5 Execution Report
- Total Test Suites: 2
- Total Tests: 9
- Passed: 9
- Failed: 0
- Time: ~2.4s

Screenshot: [In real scenario, attach image of Jest output]

## 1.6 Code Coverage Report
- Statements: 36%
- Branches: 9%
- Functions: 51%
- Lines: 37%

Screenshot: [Attach image from Jest coverage HTML report]

## 1.7 References + list of prompts used
- Reference: Section 5.3 of the provided document (adapted for Node.js/Jest instead of Java/JUnit).
- Prompts used: "hãy làm unit test cho 2 chức năng trong dự án này" (initial), then expanded based on teacher requirements.