import mongoose from 'mongoose';
import dotenv from 'dotenv';
import leadService from '../services/lead.service';
import { Lead } from '../models/lead.model';

dotenv.config();

async function runSubscriptionTest() {
  console.log('--- Running Mailing List Subscription Integration Test ---');
  
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/l2landlords';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB');

  const testEmail = `newsletter-${Date.now()}@example.com`;
  console.log(`Subscribing test email: ${testEmail}`);

  try {
    const lead = await leadService.createLead({
      name: 'Mailing List Subscriber',
      email: testEmail,
      type: 'General Enquiry',
      message: 'Mailing List Subscription',
      metadata: {
        requestType: 'mailing-list-subscription'
      }
    });

    console.log('✓ Lead created successfully:');
    console.log(`ID: ${lead._id}`);
    console.log(`Email: ${lead.email}`);
    console.log(`Type: ${lead.type}`);
    console.log(`Metadata: ${JSON.stringify(lead.metadata)}`);

    // Clean up test data
    await Lead.deleteOne({ _id: lead._id });
    console.log('✓ Test lead record cleaned up successfully');
    
  } catch (err) {
    console.error('✗ Subscription integration test failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    console.log('--- Test Completed ---');
  }
}

runSubscriptionTest();
