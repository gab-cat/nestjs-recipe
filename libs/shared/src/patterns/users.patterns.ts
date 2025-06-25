// Users Service Message Patterns
export const USERS_PATTERNS = {
  // Commands (Message Patterns)
  CREATE_USER: { cmd: 'users.create' },
  FIND_ALL_USERS: { cmd: 'users.find_all' },
  FIND_USER_BY_ID: { cmd: 'users.find_by_id' },
  FIND_USER_BY_EMAIL: { cmd: 'users.find_by_email' },
  FIND_USER_BY_USERNAME: { cmd: 'users.find_by_username' },
  UPDATE_USER: { cmd: 'users.update' },
  DEACTIVATE_USER: { cmd: 'users.deactivate' },
  SEARCH_USERS: { cmd: 'users.search' },
  GET_USER_PROFILE: { cmd: 'users.get_profile' },
  TEST: { cmd: 'users.test' },
} as const;

// Users Service Event Patterns
export const USERS_EVENTS = {
  USER_CREATED: 'users.user.created',
  USER_UPDATED: 'users.user.updated',
  USER_DEACTIVATED: 'users.user.deactivated',
  USER_PROFILE_VIEWED: 'users.profile.viewed',
} as const;
