// Auth utilities backed by Supabase Auth, with a small localStorage bridge for currentUser email.
import { supabase } from '@/lib/supabaseClient'
// Keys
const USERS_KEY = 'users'; // map email -> user record
const CURRENT_USER_KEY = 'currentUser'; // email string
const VERIFY_TOKENS_KEY = 'verifyTokens'; // map token -> email
const RESET_TOKENS_KEY = 'resetTokens'; // map token -> email

export type UserRecord = {
  email: string;
  password: string;
  verified: boolean;
  role?: 'Parent' | 'Provider';
  profile?: any;
  children?: any[];
  providerProfile?: any;
};

type UsersMap = Record<string, UserRecord>;

type TokensMap = Record<string, string>;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getUsers(): UsersMap {
  return readJSON<UsersMap>(USERS_KEY, {});
}

export function saveUsers(users: UsersMap) {
  writeJSON(USERS_KEY, users);
}

export async function createUser(email: string, password: string): Promise<UserRecord> {
  // Supabase sends email verification links back to our app
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  })
  if (error) throw new Error(error.message)
  const user = data.user
  // verified depends on provider/email confirmation settings
  const rec: UserRecord = { email, password, verified: !!user?.email_confirmed_at }
  // Note: legacy local map retained only for compatibility where needed
  const users = getUsers(); users[email] = rec; saveUsers(users)
  return rec
}

export function getUser(email: string): UserRecord | undefined {
  return getUsers()[email];
}

export function setVerified(email: string, verified = true) {
  const users = getUsers();
  if (!users[email]) {
    users[email] = { email, password: '', verified };
  } else {
    users[email].verified = verified;
  }
  saveUsers(users);
}

export function setRole(email: string, role: 'Parent' | 'Provider') {
  const users = getUsers();
  if (users[email]) {
    users[email].role = role;
    saveUsers(users);
  }
}

export function setProfile(email: string, profile: any) {
  const users = getUsers();
  if (users[email]) {
    users[email].profile = profile;
    saveUsers(users);
  }
}

export function setChildren(email: string, children: any[]) {
  const users = getUsers();
  if (users[email]) {
    users[email].children = children;
    saveUsers(users);
  }
}

export function setProviderProfile(email: string, providerProfile: any) {
  const users = getUsers();
  if (users[email]) {
    users[email].providerProfile = providerProfile;
    saveUsers(users);
  }
}

export function mergeProviderProfile(email: string, partial: any) {
  const users = getUsers();
  if (users[email]) {
    users[email].providerProfile = { ...(users[email].providerProfile || {}), ...(partial || {}) };
    saveUsers(users);
  }
}

export function setCurrentUser(email: string | null) {
  if (typeof window === 'undefined') return;
  if (email) window.localStorage.setItem(CURRENT_USER_KEY, email);
  else window.localStorage.removeItem(CURRENT_USER_KEY);
  // backwards-compat for existing pages
  if (email) window.localStorage.setItem('user', JSON.stringify({ email }));
  else window.localStorage.removeItem('user');
}

export function getCurrentUserEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(CURRENT_USER_KEY);
}

export async function login(email: string, password: string): Promise<UserRecord> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message || 'Invalid credentials')
  setCurrentUser(email)
  // derive verified from session's user
  const verified = !!data.session?.user?.email_confirmed_at
  const rec: UserRecord = { email, password, verified }
  const users = getUsers(); users[email] = { ...(users[email]||{}), ...rec }; saveUsers(users)
  return rec
}

export async function logout() {
  await supabase.auth.signOut()
  setCurrentUser(null)
}

export function isAuthenticated(): boolean {
  // Prefer Supabase session; fallback to local bridge
  // Note: in client, supabase.auth.getSession() is async; keep simple bridge for gating UI
  return !!getCurrentUserEmail();
}

function genToken(): string {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

// Email verification is handled by Supabase; keep stubs for route compatibility
export function createVerifyToken(email: string): string {
  return 'supabase-email-verification';
}

export function consumeVerifyToken(token: string): string | null {
  return null;
}

export function createResetToken(email: string): string {
  return 'supabase-password-reset';
}

export function consumeResetToken(token: string): string | null {
  return null;
}
