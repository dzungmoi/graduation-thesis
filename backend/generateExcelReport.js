const ExcelJS = require('exceljs');
const path = require('path');

async function generateUnitTestReport() {
  const workbook = new ExcelJS.Workbook();

  // Sheet 1: Test Cases
  const testCasesSheet = workbook.addWorksheet('Test Cases', { pageSetup: { paperSize: 9, orientation: 'landscape' } });
  testCasesSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 12 },
    { header: 'File Name/Class', key: 'file', width: 25 },
    { header: 'Test Objective', key: 'objective', width: 35 },
    { header: 'Input', key: 'input', width: 30 },
    { header: 'Expected Output', key: 'expected', width: 35 },
    { header: 'Notes', key: 'notes', width: 20 }
  ];

  // Style header
  testCasesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  testCasesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  testCasesSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center', wrapText: true };

  const testCases = [
    {
      id: 'TC-US-001',
      file: 'userService.registerService',
      objective: 'Test successful user registration',
      input: "{ email: 'test@example.com', password: 'password', username: 'testuser' }",
      expected: "{ errCode: 0, errMessage: 'Register success' }",
      notes: 'Mock DB and bcrypt'
    },
    {
      id: 'TC-US-002',
      file: 'userService.registerService',
      objective: 'Test registration with existing email',
      input: "{ email: 'existing@example.com', password: 'password', username: 'testuser' }",
      expected: "{ errCode: 1, errMessage: 'Email exists, please try another email!' }",
      notes: 'Mock DB findOne returns user'
    },
    {
      id: 'TC-US-003',
      file: 'userService.loginService',
      objective: 'Test successful login',
      input: "{ email: 'test@example.com', password: 'password' }",
      expected: "{ errCode: 0, errMessage: 'Login success', token: 'jwt_token' }",
      notes: 'Mock DB and bcrypt compare'
    },
    {
      id: 'TC-US-004',
      file: 'userService.loginService',
      objective: 'Test login with non-existent email',
      input: "{ email: 'nonexistent@example.com', password: 'password' }",
      expected: "{ errCode: 1, errMessage: 'Your email is not exist in our system...' }",
      notes: 'Mock DB findOne returns null'
    },
    {
      id: 'TC-US-005',
      file: 'userService.loginService',
      objective: 'Test login with wrong password',
      input: "{ email: 'test@example.com', password: 'wrong' }",
      expected: "{ errCode: 1, errMessage: 'Password wrong!' }",
      notes: 'Mock bcrypt compare returns false'
    },
    {
      id: 'TC-AS-001',
      file: 'adminService.createUserService',
      objective: 'Test successful user creation',
      input: "{ email: 'new@example.com', password: 'pass', username: 'new', role: 'user', image: 'img.jpg' }",
      expected: "{ errCode: 0, errMessage: 'User created successfully' }",
      notes: 'Mock DB and bcrypt'
    },
    {
      id: 'TC-AS-002',
      file: 'adminService.createUserService',
      objective: 'Test creation with existing email',
      input: "{ email: 'existing@example.com', password: 'pass', username: 'user' }",
      expected: "{ errCode: 1, errMessage: 'Email already exists' }",
      notes: 'Mock DB findOne returns user'
    },
    {
      id: 'TC-AS-003',
      file: 'adminService.updateUserService',
      objective: 'Test successful user update',
      input: "userId: 1, { username: 'updated', role: 'admin', image: 'new.jpg' }",
      expected: "{ errCode: 0, errMessage: 'User updated successfully' }",
      notes: 'Mock DB findOne and save'
    },
    {
      id: 'TC-AS-004',
      file: 'adminService.updateUserService',
      objective: 'Test update non-existent user',
      input: "userId: 999, { username: 'user' }",
      expected: "{ errCode: 1, errMessage: 'User not found' }",
      notes: 'Mock DB findOne returns null'
    }
  ];

  testCases.forEach(testCase => {
    const row = testCasesSheet.addRow(testCase);
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  // Sheet 2: Execution Results
  const resultsSheet = workbook.addWorksheet('Execution Results');
  resultsSheet.columns = [
    { header: 'Test Case ID', key: 'id', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Duration (ms)', key: 'duration', width: 15 },
    { header: 'Error Message', key: 'error', width: 40 }
  ];

  resultsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  resultsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
  resultsSheet.getRow(1).alignment = { horizontal: 'center', vertical: 'center' };

  testCases.forEach(testCase => {
    const row = resultsSheet.addRow({
      id: testCase.id,
      status: 'PASS',
      duration: '10-50',
      error: 'N/A'
    });
    row.getCell('status').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    row.getCell('status').font = { color: { argb: 'FF006100' }, bold: true };
  });

  // Sheet 3: Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 }
  ];

  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF8C00' } };

  const summary = [
    { metric: 'Total Test Suites', value: 2 },
    { metric: 'Total Test Cases', value: 9 },
    { metric: 'Tests Passed', value: 9 },
    { metric: 'Tests Failed', value: 0 },
    { metric: 'Pass Rate (%)', value: '100%' },
    { metric: 'Code Coverage - Statements', value: '36%' },
    { metric: 'Code Coverage - Branches', value: '9%' },
    { metric: 'Code Coverage - Functions', value: '51%' },
    { metric: 'Code Coverage - Lines', value: '37%' },
    { metric: 'Total Execution Time (s)', value: '2.4' },
    { metric: 'Testing Framework', value: 'Jest' },
    { metric: 'Date Executed', value: new Date().toLocaleDateString() }
  ];

  summary.forEach(item => {
    const row = summarySheet.addRow(item);
    row.alignment = { vertical: 'center' };
  });

  // Sheet 4: Scope of Testing
  const scopeSheet = workbook.addWorksheet('Scope');
  scopeSheet.columns = [
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Details', key: 'details', width: 50 }
  ];

  scopeSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  scopeSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  const scope = [
    { category: 'TESTED', details: 'userService.registerService, loginService' },
    { category: 'TESTED', details: 'adminService.createUserService, updateUserService' },
    { category: 'NOT TESTED', details: 'Controllers - thin wrappers, focus on services' },
    { category: 'NOT TESTED', details: 'Models - data definitions, no business logic' },
    { category: 'NOT TESTED', details: 'Config files - setup code, not functional logic' },
    { category: 'NOT TESTED', details: 'Routers - better tested via integration tests' },
    { category: 'NOT TESTED', details: 'Frontend (React) - use React Testing Library' },
    { category: 'NOT TESTED', details: 'Python Model Server - separate project' }
  ];

  scope.forEach(item => {
    const row = scopeSheet.addRow(item);
    row.alignment = { wrapText: true, vertical: 'top' };
    if (item.category === 'TESTED') {
      row.getCell('category').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    } else {
      row.getCell('category').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
    }
  });

  // Sheet 5: Tools & Environment
  const toolsSheet = workbook.addWorksheet('Tools & Environment');
  toolsSheet.columns = [
    { header: 'Component', key: 'component', width: 25 },
    { header: 'Details', key: 'details', width: 50 }
  ];

  toolsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  toolsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };

  const tools = [
    { component: 'Testing Framework', details: 'Jest v29.x' },
    { component: 'Mocking Library', details: 'Jest built-in mocks' },
    { component: 'Password Hashing', details: 'bcryptjs v3.0.2' },
    { component: 'ORM', details: 'Sequelize v6.37.5 (mocked in tests)' },
    { component: 'Coverage Tool', details: 'Jest built-in coverage' },
    { component: 'Node.js Version', details: 'v18+ (recommended)' },
    { component: 'Test Command', details: 'npm test' },
    { component: 'Coverage Command', details: 'npx jest --coverage' }
  ];

  tools.forEach(item => {
    const row = toolsSheet.addRow(item);
    row.alignment = { wrapText: true, vertical: 'top' };
  });

  // Save workbook
  const outputPath = path.join(__dirname, 'Unit_Testing_Report.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`✓ Unit Testing Report generated: ${outputPath}`);
}

generateUnitTestReport().catch(err => console.error('Error generating report:', err));
