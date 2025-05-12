# Password Strength Checker

A comprehensive password strength checking and generation tool that helps users create and evaluate strong passwords based on multiple security criteria.

## Features

- **Password Strength Analysis**: Evaluates passwords based on multiple criteria
  - Length and character variety
  - Common patterns and dictionary words
  - Entropy calculation
  - Estimated time to crack
  - Personal information detection

- **Password Generation**: Creates strong, random passwords with customizable options
  - Adjustable length (8-50 characters)
  - Include/exclude character types (uppercase, lowercase, numbers, symbols)
  - Copy to clipboard functionality

- **Security Features**
  - Client-side analysis for instant feedback
  - Server-side validation for additional security checks
  - Rate limiting to prevent abuse
  - No password storage or logging

## Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express
- **Libraries**:
  - zxcvbn: For password strength estimation
  - password-validator: For rule-based validation
  - crypto: For secure random number generation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/password-strength-checker.git
   cd password-strength-checker
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

1. Start the development server:
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

2. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## API Endpoints

### Check Password

```
POST /api/check-password
```

**Request Body:**
```json
{
  "password": "your-password-here"
}
```

**Response:**
```json
{
  "score": 4,
  "feedback": {
    "warning": "",
    "suggestions": []
  },
  "suggestions": [],
  "crackTime": "centuries",
  "isCommon": false,
  "isStrong": true,
  "validationDetails": [],
  "entropy": 123.45,
  "strength": "Very Strong"
}
```

### Generate Password

```
GET /api/generate-password?length=16&symbols=true&numbers=true&uppercase=true&lowercase=true
```

**Query Parameters:**
- `length`: Number (8-50, default: 16)
- `symbols`: Boolean (default: true)
- `numbers`: Boolean (default: true)
- `uppercase`: Boolean (default: true)
- `lowercase`: Boolean (default: true)

**Response:**
```json
{
  "password": "dK7#mN9@pQ2$vR5&"
}
```

## Security Considerations

- Passwords are never stored or logged
- All password processing happens in memory
- Rate limiting is implemented to prevent brute force attacks
- HTTPS should be used in production
- Client-side validation is provided for immediate feedback, but server-side validation is the source of truth

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
