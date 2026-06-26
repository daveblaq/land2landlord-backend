import { AssertionError } from 'assert';
import { getEpcCertificateEmailTemplate } from '../mails/epc.mail';

function runTests() {
  console.log('--- Running EPC Email Template Renderer Verification Tests ---');

  const firstName = 'Alice';
  const propertyTitle = 'Flat 5, 23 Baker St, London';
  const documentUrl = 'https://government-energy-register.gov.uk/cert/12345';

  // Test Case 1: Standard EPC template generation
  const payload1 = getEpcCertificateEmailTemplate(firstName, propertyTitle, documentUrl);
  if (!payload1.header.includes('Energy Performance Certificate (EPC)')) {
    throw new AssertionError({ message: 'Test 1 failed: Header should include default document name' });
  }
  if (!payload1.body.includes('Hello Alice,')) {
    throw new AssertionError({ message: 'Test 1 failed: Body should greet the user by first name' });
  }
  if (!payload1.body.includes(propertyTitle)) {
    throw new AssertionError({ message: 'Test 1 failed: Body should list the property title' });
  }
  if (!payload1.body.includes('href="' + documentUrl + '"')) {
    throw new AssertionError({ message: 'Test 1 failed: Body should contain the correct download URL' });
  }
  if (!payload1.body.includes('Download EPC Certificate')) {
    throw new AssertionError({ message: 'Test 1 failed: Body button should say Download EPC Certificate' });
  }
  console.log('✓ Test 1 Passed: Standard EPC template checks');

  // Test Case 2: Custom Document Template generation
  const docName = 'Property Brochure';
  const payload2 = getEpcCertificateEmailTemplate(firstName, propertyTitle, documentUrl, docName);
  if (!payload2.header.includes(docName)) {
    throw new AssertionError({ message: 'Test 2 failed: Header should include custom document name' });
  }
  if (!payload2.body.includes('Download Property Brochure')) {
    throw new AssertionError({ message: 'Test 2 failed: Body button should reflect custom document name' });
  }
  console.log('✓ Test 2 Passed: Custom document template checks');

  console.log('All verification tests completed successfully!');
}

runTests();
