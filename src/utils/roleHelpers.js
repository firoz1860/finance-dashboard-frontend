export const canManageUsers = (role) => role === 'ADMIN';
export const canCreateRecord = (role) => ['ADMIN', 'ANALYST'].includes(role);
export const canEditRecord = (role) => role === 'ADMIN';
export const canDeleteRecord = (role) => role === 'ADMIN';
