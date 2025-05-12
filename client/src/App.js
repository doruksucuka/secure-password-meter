import React, { useState, useEffect } from 'react';
import { 
  Container, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Grid, 
  Box, 
  LinearProgress, 
  FormControlLabel, 
  Checkbox,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Error as ErrorIcon, 
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import axios from 'axios';
import zxcvbn from 'zxcvbn';

function App() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true
  });

  // Check password strength locally for instant feedback
  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordStrength({
        score: result.score,
        feedback: result.feedback,
        suggestions: result.feedback.suggestions,
        crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
        isCommon: result.score < 2
      });
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const checkPassword = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/check-password`, { password });
      setPasswordStrength(response.data);
    } catch (err) {
      console.error('Error checking password:', err);
      setError('Failed to check password. Using local analysis only.');
    } finally {
      setIsChecking(false);
    }
  };

  const generatePassword = async () => {
    try {
      const params = new URLSearchParams({
        length: passwordOptions.length,
        symbols: passwordOptions.includeSymbols,
        numbers: passwordOptions.includeNumbers,
        uppercase: passwordOptions.includeUppercase,
        lowercase: passwordOptions.includeLowercase
      });

      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/generate-password?${params}`);
      setGeneratedPassword(response.data.password);
      setPassword(response.data.password);
    } catch (err) {
      console.error('Error generating password:', err);
      setError('Failed to generate password. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Copied to clipboard!');
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const getStrengthColor = (score) => {
    switch (score) {
      case 4: return 'success';
      case 3: return 'info';
      case 2: return 'warning';
      case 1: return 'error';
      default: return 'error';
    }
  };

  const getStrengthLabel = (score) => {
    switch (score) {
      case 4: return 'Very Strong';
      case 3: return 'Strong';
      case 2: return 'Moderate';
      case 1: return 'Weak';
      default: return 'Very Weak';
    }
  };

  // Check if password meets length requirement (at least 12 characters)
  const meetsLengthRequirement = password.length >= 12;
  
  // Check if password has both uppercase and lowercase letters
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasMixedCase = hasUppercase && hasLowercase;
  
  // Check if password has numbers and symbols
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^A-Za-z0-9]/.test(password);
  const hasNumbersAndSymbols = hasNumbers && hasSymbols;
  
  // Check if password is not based on common patterns (using zxcvbn score)
  const isNotCommon = passwordStrength?.score >= 2; // Score 2 or higher is considered not common
  
  // Check if password has high entropy (using length and character variety as proxy)
  const hasHighEntropy = (hasUppercase + hasLowercase + hasNumbers + hasSymbols) >= 3 && password.length >= 12;
  
  // Get icon color based on condition
  const getCheckIcon = (condition) => (
    <CheckCircleIcon 
      color={condition ? 'success' : 'disabled'} 
      fontSize="small" 
      sx={{ mr: 1 }} 
    />
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Password Strength Checker
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph align="center">
          Check the strength of your password and get suggestions to improve it
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                  <IconButton 
                    onClick={() => copyToClipboard(password)} 
                    disabled={!password}
                    edge="end"
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={checkPassword}
            disabled={isChecking || !password}
            sx={{ mb: 2 }}
          >
            {isChecking ? 'Checking...' : 'Check Password'}
          </Button>

          {passwordStrength && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  Strength: {getStrengthLabel(passwordStrength.score)}
                </Typography>
                <Box sx={{ flexGrow: 1, ml: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={passwordStrength.score * 25} 
                    color={getStrengthColor(passwordStrength.score)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>

              {passwordStrength.feedback.warning && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ErrorIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {passwordStrength.feedback.warning}
                  </Typography>
                </Box>
              )}

              {passwordStrength.suggestions && passwordStrength.suggestions.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Suggestions:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {passwordStrength.suggestions.map((suggestion, index) => (
                      <li key={index}>
                        <Typography variant="body2">{suggestion}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Time to crack:</strong> {passwordStrength.crackTime}
                </Typography>
                {passwordStrength.entropy && (
                  <Typography variant="body2">
                    <strong>Entropy:</strong> {passwordStrength.entropy} bits
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 2, color: 'error.main' }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}
        </Box>


        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h5" gutterBottom>Generate a Strong Password</Typography>
          
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password Length"
                type="number"
                value={passwordOptions.length}
                onChange={(e) => setPasswordOptions({...passwordOptions, length: Math.max(8, parseInt(e.target.value) || 12)})}
                inputProps={{ min: 8, max: 50 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={generatePassword}
              >
                Generate Password
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordOptions.includeUppercase}
                    onChange={(e) => setPasswordOptions({...passwordOptions, includeUppercase: e.target.checked})}
                  />
                }
                label="A-Z"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordOptions.includeLowercase}
                    onChange={(e) => setPasswordOptions({...passwordOptions, includeLowercase: e.target.checked})}
                  />
                }
                label="a-z"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordOptions.includeNumbers}
                    onChange={(e) => setPasswordOptions({...passwordOptions, includeNumbers: e.target.checked})}
                  />
                }
                label="0-9"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={passwordOptions.includeSymbols}
                    onChange={(e) => setPasswordOptions({...passwordOptions, includeSymbols: e.target.checked})}
                  />
                }
                label="!@#$"
              />
            </Grid>
          </Grid>

          {generatedPassword && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ flexGrow: 1, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {generatedPassword}
              </Box>
              <Tooltip title="Copy to clipboard">
                <IconButton 
                  onClick={() => copyToClipboard(generatedPassword)}
                  size="small"
                  sx={{ ml: 1 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Paper>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Password Strength Criteria</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getCheckIcon(meetsLengthRequirement)}
                <Typography variant="body2" color={meetsLengthRequirement ? 'text.primary' : 'text.secondary'}>
                  At least 12 characters long {meetsLengthRequirement ? '' : `(${password.length}/12)`}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getCheckIcon(hasMixedCase)}
                <Typography variant="body2" color={hasMixedCase ? 'text.primary' : 'text.secondary'}>
                  Includes uppercase and lowercase letters
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getCheckIcon(hasNumbersAndSymbols)}
                <Typography variant="body2" color={hasNumbersAndSymbols ? 'text.primary' : 'text.secondary'}>
                  Includes numbers and symbols
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {getCheckIcon(isNotCommon)}
                <Typography variant="body2" color={isNotCommon ? 'text.primary' : 'text.secondary'}>
                  Not based on common words or patterns
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircleIcon color="disabled" fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Not based on personal information
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getCheckIcon(hasHighEntropy)}
                <Typography variant="body2" color={hasHighEntropy ? 'text.primary' : 'text.secondary'}>
                  High entropy for better security
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
