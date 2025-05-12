require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const zxcvbn = require('zxcvbn');
const passwordValidator = require('password-validator');
const { randomBytes } = require('crypto');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Password schema
const schema = new passwordValidator();
schema
  .is().min(12) // Minimum length 12
  .is().max(100) // Maximum length 100
  .has().uppercase() // Must have uppercase letters
  .has().lowercase() // Must have lowercase letters
  .has().digits() // Must have digits
  .has().symbols() // Must have symbols
  .has().not().spaces(); // Should not have spaces

// Password strength check endpoint
app.post('/api/check-password', (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Check against common passwords and patterns
    const result = zxcvbn(password);
    
    // Get detailed validation results
    const validation = schema.validate(password, { details: true });
    const isStrong = validation.length === 0;
    
    // Calculate entropy
    const entropy = calculateEntropy(password);
    
    // Prepare response
    const response = {
      score: result.score, // 0-4 score
      feedback: result.feedback,
      suggestions: result.feedback.suggestions,
      crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
      isCommon: result.score < 2, // If score is less than 2, consider it common
      isStrong,
      validationDetails: validation,
      entropy,
      strength: getStrengthDescription(result.score, entropy)
    };

    res.json(response);
  } catch (error) {
    console.error('Error checking password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate strong password
app.get('/api/generate-password', (req, res) => {
  try {
    const length = parseInt(req.query.length) || 16;
    const includeSymbols = req.query.symbols !== 'false';
    const includeNumbers = req.query.numbers !== 'false';
    const includeUppercase = req.query.uppercase !== 'false';
    const includeLowercase = req.query.lowercase !== 'false';
    
    const password = generatePassword(length, {
      includeSymbols,
      includeNumbers,
      includeUppercase,
      includeLowercase
    });
    
    res.json({ password });
  } catch (error) {
    console.error('Error generating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate password entropy
function calculateEntropy(password) {
  if (!password) return 0;
  
  // Character sets
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Determine character set based on password content
  let charsetSize = 0;
  
  if (password.match(/[a-z]/)) charsetSize += lowercase.length;
  if (password.match(/[A-Z]/)) charsetSize += uppercase.length;
  if (password.match(/[0-9]/)) charsetSize += numbers.length;
  if (password.match(/[^a-zA-Z0-9]/)) charsetSize += symbols.length;
  
  // Calculate entropy
  const entropy = Math.log2(Math.pow(charsetSize, password.length));
  
  return Math.round(entropy * 100) / 100; // Round to 2 decimal places
}

// Helper function to generate a strong password
function generatePassword(length = 16, options = {}) {
  const {
    includeSymbols = true,
    includeNumbers = true,
    includeUppercase = true,
    includeLowercase = true
  } = options;
  
  let charset = '';
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  // Ensure at least one character from each selected character set
  let password = '';
  if (includeLowercase) password += getRandomChar('abcdefghijklmnopqrstuvwxyz');
  if (includeUppercase) password += getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (includeNumbers) password += getRandomChar('0123456789');
  if (includeSymbols) password += getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?');
  
  // Fill the rest of the password with random characters
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += getRandomChar(charset);
  }
  
  // Shuffle the password to ensure randomness
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Helper function to get a random character from a string
function getRandomChar(charset) {
  const randomBytes = require('crypto').randomBytes(1);
  const randomIndex = randomBytes[0] % charset.length;
  return charset[randomIndex];
}

// Helper function to get strength description
function getStrengthDescription(score, entropy) {
  if (score === 4) return 'Very Strong';
  if (score === 3) return 'Strong';
  if (score === 2) return 'Moderate';
  if (score === 1) return 'Weak';
  return 'Very Weak';
}

// Function to start the server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', error);
      process.exit(1);
    }
  });
};

// Start the server with the specified port or default to 5000
startServer(parseInt(process.env.PORT) || 5000);

module.exports = app;
