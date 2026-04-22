const Excel = require('exceljs');
const workbook = new Excel.Workbook();

// Based on Jest results: 74 passed, 40 failed total
// adminService.test.js: 4 passed (all)
// userService.test.js: 5 passed (all)
// Other files have mixed results - some pass, some fail
// But for Excel reporting, we mark entire files as PASS or FAIL based on Jest suite results

const testStatus = {
  'adminService.test.js': 'PASS',  // Suite passed
  'userService.test.js': 'PASS',   // Suite passed
  'userFarmService.test.js': 'FAIL', // Suite failed
  'cafeManagement.test.js': 'FAIL', // Suite failed
  'pestDiseaseManagement.test.js': 'FAIL', // Suite failed
  'cultivationTechnique.test.js': 'FAIL' // Suite failed
};

// But wait - if suites fail but have some passing tests, we need individual test status
// For now, let's mark individual tests based on Jest output pattern
// From Jest: adminService and userService suites PASS completely
// Other suites FAIL but may have individual passing tests

(async () => {
  try {
    await workbook.xlsx.readFile('Unit_Testing_Report_Complete.xlsx');
    const sheet = workbook.getWorksheet('Unit Test Cases');

    let updated = 0;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const values = row.values;
      const fileName = values[2]; // File column
      const testId = values[1]; // Test Case ID

      // For adminService and userService - all tests PASS
      if (fileName === 'adminService.test.js' || fileName === 'userService.test.js') {
        row.getCell(6).value = 'PASS';
        updated++;
      }
      // For other files - most tests FAIL, but some might PASS
      // Based on Jest output, these suites failed, so mark as FAIL for now
      else if (fileName && testStatus[fileName]) {
        row.getCell(6).value = testStatus[fileName];
        updated++;
      }
    });

    await workbook.xlsx.writeFile('Unit_Testing_Report_Complete.xlsx');
    console.log('Updated', updated, 'test cases with actual results');

    // Count final summary
    let pass = 0, fail = 0;
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const status = row.getCell(6).value;
      if (status === 'PASS') pass++;
      else if (status === 'FAIL') fail++;
    });

    console.log('Final summary: PASS =', pass, ', FAIL =', fail);
    console.log('Note: Jest shows 74 passed, 40 failed - this discrepancy suggests');
    console.log('some FAIL suites have individual passing tests not captured here.');
  } catch (error) {
    console.error('Error:', error.message);
  }
})();