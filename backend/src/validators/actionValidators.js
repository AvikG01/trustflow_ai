function validateRegistrationInput({ name, email, password }) {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return 'Valid name (at least 2 characters) is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return 'Valid email address is required';
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
}

function validateLoginInput({ email, password }) {
  if (!email || !password) {
    return 'Email and password are required';
  }
  return null;
}

function validateCreateResumeInput({ title }) {
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return 'Resume title is required';
  }
  return null;
}

module.exports = {
  validateRegistrationInput,
  validateLoginInput,
  validateCreateResumeInput,
};
