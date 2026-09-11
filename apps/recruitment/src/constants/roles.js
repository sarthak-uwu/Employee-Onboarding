export const ROLES = {
  CANDIDATE: 'candidate',
  TA: 'ta',
  HR: 'hr', // HR accounts live in the separate HR application; never granted here
};

export const ROLE_META = {
  [ROLES.CANDIDATE]: {
    label: 'Candidate',
    description: 'Browse jobs, apply, track your application and manage your offer.',
    home: '/candidate',
  },
  [ROLES.TA]: {
    label: 'Talent Acquisition',
    description: 'Review applications and manage the recruitment pipeline.',
    home: '/ta',
  },
};
