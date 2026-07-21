import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, 'payment_settings.json');

export const getPaymentConfig = () => {
  try {
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        keyId: data.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_TG9RXb0cmHExLb',
        keySecret: data.keySecret || process.env.RAZORPAY_KEY_SECRET || 't25JeH50NYQN4iZRGvkQGB0X'
      };
    }
  } catch (err) {
    console.error('Error reading payment config:', err.message);
  }
  return {
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_TG9RXb0cmHExLb',
    keySecret: process.env.RAZORPAY_KEY_SECRET || 't25JeH50NYQN4iZRGvkQGB0X'
  };
};

export const savePaymentConfig = (keyId, keySecret) => {
  try {
    const data = { keyId, keySecret };
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), 'utf8');
    // Update active env variables
    process.env.RAZORPAY_KEY_ID = keyId;
    process.env.RAZORPAY_KEY_SECRET = keySecret;
    return true;
  } catch (err) {
    console.error('Error saving payment config:', err.message);
    return false;
  }
};
