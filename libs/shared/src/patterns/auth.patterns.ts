// Auth Service Message Patterns
export const AUTH_PATTERNS = {
  // Commands (Message Patterns)
  REGISTER: { cmd: 'auth.register' },
  LOGIN: { cmd: 'auth.login' },
  REFRESH_TOKEN: { cmd: 'auth.refresh_token' },
  LOGOUT: { cmd: 'auth.logout' },
  CHANGE_PASSWORD: { cmd: 'auth.change_password' },
  VALIDATE_TOKEN: { cmd: 'auth.validate_token' },
  TEST: { cmd: 'auth.test' },
} as const;

// Auth Service Event Patterns
export const AUTH_EVENTS = {
  USER_REGISTERED: 'auth.user.registered',
  USER_LOGGED_IN: 'auth.user.logged_in',
  USER_LOGGED_OUT: 'auth.user.logged_out',
  PASSWORD_CHANGED: 'auth.password.changed',
  TOKEN_REFRESHED: 'auth.token.refreshed',
} as const;
