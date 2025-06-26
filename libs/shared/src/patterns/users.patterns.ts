// Users Service Message Patterns
export const USERS_PATTERNS = {
  // Commands (Message Patterns)
  FIND_ALL_USERS: { cmd: 'users.find_all' },
  FIND_USER_BY_ID: { cmd: 'users.find_by_id' },
  FIND_USER_BY_EMAIL: { cmd: 'users.find_by_email' },
  FIND_USER_BY_USERNAME: { cmd: 'users.find_by_username' },
  GET_USER_PROFILE: { cmd: 'users.get_profile' },
  UPDATE_USER: { cmd: 'users.update' },
  DELETE_USER: { cmd: 'users.delete' },
  SEARCH_USERS: { cmd: 'users.search' },
  TEST: { cmd: 'users.test' },
} as const;

// Users Service Event Patterns
export const USERS_EVENTS = {
  USER_CREATED: 'users.user.created',
  USER_UPDATED: 'users.user.updated',
  USER_DEACTIVATED: 'users.user.deactivated',
  USER_PROFILE_VIEWED: 'users.profile.viewed',
} as const;
