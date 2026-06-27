import { getMailingListWelcomeTemplate } from '../mails/mailing-list.mail';
import assert from 'assert';

function testMailingListTemplate() {
  console.log('--- Running Mailing List Welcome Template Verification Tests ---');

  const testEmail = 'subscriber@example.com';
  const template = getMailingListWelcomeTemplate(testEmail);

  // Assertions
  assert.ok(template.header, 'Header should exist');
  assert.ok(template.body, 'Body should exist');
  assert.ok(template.header.includes('Mailing List'), 'Header should state mailing list context');
  assert.ok(template.body.includes(testEmail), 'Body HTML should include subscriber email address');
  assert.ok(template.body.includes('https://res.cloudinary.com/dd1damszz/image/upload/v1782435869/logo_rd2i4q.svg'), 'Body HTML should include the SVG logo URL');

  console.log('✓ All Mailing List Welcome Template tests passed successfully!');
}

testMailingListTemplate();
