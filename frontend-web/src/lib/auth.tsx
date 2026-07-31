import { md5 } from 'js-md5';
import type { User } from './types';

export type { User };

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function getUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isLoggedIn(): boolean {
  return !!getToken() && !!getUser();
}

export function encryptPassword(password: string): string {
  return md5(password);
}

export function getUserTypeLabel(userType: number): string {
  switch (userType) {
    case 1: return '学生';
    case 2: return '企业';
    case 3: return '管理员';
    default: return '未知';
  }
}