const fs = require('fs');
const content = fs.readFileSync('test_results.json', 'utf8');
const jsonStart = content.indexOf('{"numFailedTestSuites"');
const jsonEnd = content.lastIndexOf('}');
const jsonContent = content.substring(jsonStart, jsonEnd + 1);

try {
  const data = JSON.parse(jsonContent);

  console.log('=== JEST TEST RESULTS ANALYSIS ===');
  console.log('Total tests:', data.numTotalTests);
  console.log('Passed tests:', data.numPassedTests);
  console.log('Failed tests:', data.numFailedTests);
  console.log('Test suites:', data.numTotalTestSuites);
  console.log('Passed suites:', data.numPassedTestSuites);
  console.log('Failed suites:', data.numFailedTestSuites);
  console.log('');

  console.log('=== DETAILED RESULTS BY FILE ===');
  data.testResults.forEach((result, index) => {
    const filePath = result.testFilePath || 'unknown';
    const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
    console.log(`${index + 1}. ${fileName}:`);
    console.log(`   - Total tests: ${result.numFailingTests + result.numPassingTests}`);
    console.log(`   - Passed: ${result.numPassingTests}`);
    console.log(`   - Failed: ${result.numFailingTests}`);
    console.log(`   - Suite status: ${result.status}`);
    console.log('');
  });

  // Summary for Excel mapping
  console.log('=== SUMMARY FOR EXCEL MAPPING ===');
  const fileResults = {};
  data.testResults.forEach(result => {
    const filePath = result.testFilePath || 'unknown';
    const fileName = filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
    fileResults[fileName] = {
      total: result.numFailingTests + result.numPassingTests,
      passed: result.numPassingTests,
      failed: result.numFailingTests,
      suiteStatus: result.status
    };
  });

  console.log('File mapping for Excel:');
  Object.entries(fileResults).forEach(([file, stats]) => {
    console.log(`${file}: ${stats.passed} PASS, ${stats.failed} FAIL (Suite: ${stats.suiteStatus})`);
  });

} catch (error) {
  console.error('Error parsing JSON:', error.message);
  console.log('JSON content preview:', jsonContent.substring(0, 200));
}