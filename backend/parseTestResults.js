const fs = require('fs');

// Read the JSON file
const jsonData = fs.readFileSync('test_results_clean.json', 'utf-8');
const results = JSON.parse(jsonData);

console.log('=== TEST RESULTS SUMMARY ===\n');
console.log(`Total Tests: ${results.numTotalTests}`);
console.log(`Passed: ${results.numPassedTests}`);
console.log(`Failed: ${results.numFailedTests}\n`);

console.log('=== PER FILE BREAKDOWN ===\n');

// Parse detailed results
results.testResults.forEach(suite => {
  const fileName = suite.name.split('\\').pop();
  console.log(`\n${fileName}:`);
  console.log(`  Passed: ${suite.numPassingTests}`);
  console.log(`  Failed: ${suite.numFailingTests}`);
  
  if (suite.testResults && suite.testResults.length > 0) {
    suite.testResults.forEach(test => {
      const status = test.status === 'pass' ? '✓' : '✕';
      console.log(`    ${status} ${test.fullName}`);
    });
  }
});

// Create mapping for Excel
const passFailMap = {};

results.testResults.forEach(suite => {
  const fileName = suite.name.split('\\').pop().replace('.test.js', '');
  
  if (suite.testResults && suite.testResults.length > 0) {
    suite.testResults.forEach((test, idx) => {
      const key = `${fileName}_${idx + 1}`;
      passFailMap[key] = test.status === 'pass' ? 'PASS' : 'FAIL';
    });
  }
});

console.log('\n\n=== TEST CASE MAPPING FOR EXCEL ===\n');
console.log(JSON.stringify(passFailMap, null, 2));
