const fs = require('fs');
const content = fs.readFileSync('test_results.json', 'utf8');

// Find the JSON part (starts with {)
const jsonStart = content.indexOf('{"numFailedTestSuites"');
if (jsonStart === -1) {
  console.error('JSON not found in file');
  process.exit(1);
}

const jsonContent = content.substring(jsonStart);
const data = JSON.parse(jsonContent);

console.log('Total tests:', data.numTotalTests);
console.log('Passed tests:', data.numPassedTests);
console.log('Failed tests:', data.numFailedTests);
console.log('\nTest results by file:');

data.testResults.forEach((result, index) => {
  console.log(`Result ${index}:`, result);
  if (result.testFilePath) {
    const fileName = result.testFilePath.split('/').pop();
    console.log(fileName, '- PASS:', result.numPassingTests, 'FAIL:', result.numFailingTests);
  } else {
    console.log('No testFilePath found');
  }
});