# Password Strength Checker

A comprehensive password strength checking and generation tool that helps users create and evaluate strong passwords based on multiple security criteria.

## Features

- **Password Strength Analysis**: Evaluates passwords based on multiple criteria
  - Length and character variety
  - Common patterns and dictionary words
  - Entropy calculation

## Tech Stack

- **Frontend**:
  - React 18
  - Material-UI 5
  - Axios for API calls
  - zxcvbn for client-side password strength estimation

- **Backend**:
  - Node.js
  - Express.js
  - zxcvbn for password strength analysis
  - password-validator for rule-based validation
  - crypto for secure random number generation
  - Helmet for security headers
  - CORS for cross-origin requests

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/doruksucuka/secure-password-meter.git
   cd secure-password-meter
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd client
   npm install
   cd ..
   ```

### Running the Application

1. Start the development server (from the root directory):
   ```bash
   npm run dev
   ```
   This will start:
   - Backend server (default: http://localhost:5000, will find next available port if needed)
   - Frontend development server (http://localhost:3000)

2. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## API Endpoints

### Check Password

```
POST /api/check-password
```

**Request body:**
```json
{
  "password": "your-password-here"
}
```

**Response:**
```json
{
  "score": 3,
  "feedback": {
    "suggestions": ["Add another word or two. Uncommon words are better."],
    "warning": ""
  },
  "crackTime": 3600000,
  "crackTimeDisplay": "months",
  "entropy": 65.4
}
```

### Generate Password

```
GET /api/generate-password?length=16&uppercase=true&lowercase=true&numbers=true&symbols=true
```

**Query parameters:**
- `length`: Length of the password (default: 16, min: 8, max: 128)
- `uppercase`: Include uppercase letters (A-Z)
- `lowercase`: Include lowercase letters (a-z)
- `numbers`: Include numbers (0-9)
- `symbols`: Include symbols (!@#$%^&*()_+{}[]|:;"'<>,.?/~`)

**Response:**
```json
{
  "password": "xQ7#k9!pL2$vR5&"
}
```

## Password Strength Criteria

The application checks passwords against these criteria:

- At least 12 characters long
- Includes both uppercase and lowercase letters
- Includes numbers and symbols
- Not based on common words or patterns
- High entropy for better security

## Security Considerations

- Passwords are never stored or logged
- All API requests are rate-limited
- Secure headers are enabled
- Client-side validation is supplemented with server-side validation

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
