// Shared input rules for admin accounts

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Returns an error message, or null if the password is acceptable
export const passwordProblem = (password, email = '') => {
  const name = email.split('@')[0]
  if (typeof password !== 'string' || password.length < 8) return 'Password must be at least 8 characters'
  if (password.length > 128) return 'Password is too long'
  if (!/[a-z]/i.test(password) || !/\d/.test(password)) return 'Password must contain letters and numbers'
  if (name.length >= 3 && password.toLowerCase().includes(name.toLowerCase())) return 'Password must not contain your email name'
  return null
}
