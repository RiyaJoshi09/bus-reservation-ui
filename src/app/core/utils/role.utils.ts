import { Role } from '../models/auth.models';

export function stripRolePrefix(role: string): Role {
  return role.replace(/^ROLE_/, '') as Role;
}

/** 'ROLE_TRIP_MANAGER' → 'Trip Manager' */
export function roleLabel(role: string): string {
  return stripRolePrefix(role)
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

export function addRolePrefix<T extends string>(role: T): `ROLE_${T}`{
  return `ROLE_${role}`;
}