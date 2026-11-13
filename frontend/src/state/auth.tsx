import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * Simulated accounts for the prototype. Accounts and the current session live in
 * AsyncStorage (localStorage on web, a local file on device), so sign-in survives
 * a reload but nothing ever leaves the device.
 *
 * Passwords are only lightly scrambled, NOT securely hashed. Fine for a demo,
 * never for real credentials.
 */

export type Account = {
  id: string;
  name: string;
  email: string;
  petName: string;
  passwordHash: string;
  createdAt: number;
};

export type User = Omit<Account, 'passwordHash'>;

const ACCOUNTS_KEY = 'mimo:accounts';
const SESSION_KEY = 'mimo:session';

export const DEMO_ACCOUNT = { email: 'demo@mimo.app', password: 'mimo123' };

/** Not cryptographic: just keeps plain passwords out of storage in the prototype. */
function scramble(password: string) {
  let h = 5381;
  for (let i = 0; i < password.length; i++) h = ((h << 5) + h + password.charCodeAt(i)) | 0;
  return `djb2:${(h >>> 0).toString(16)}`;
}

const demoAccount: Account = {
  id: 'demo',
  name: 'Alex',
  email: DEMO_ACCOUNT.email,
  petName: 'Mimo',
  passwordHash: scramble(DEMO_ACCOUNT.password),
  createdAt: Date.UTC(2026, 9, 1),
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : 'Enter a valid email address.';
}

export function validatePassword(password: string) {
  return password.length >= 6 ? null : 'Password needs at least 6 characters.';
}

const toUser = ({ passwordHash: _hash, ...user }: Account): User => user;

/** Returns an error message, or null on success. */
type Result = Promise<string | null>;

type AuthContextValue = {
  /** False until stored accounts and session have loaded. */
  ready: boolean;
  user: User | null;
  signUp: (input: { name: string; email: string; password: string; petName: string }) => Result;
  logIn: (email: string, password: string) => Result;
  logOut: () => Promise<void>;
  updateProfile: (input: { name: string; email: string; petName: string }) => Result;
  changePassword: (current: string, next: string) => Result;
  deleteAccount: (password: string) => Result;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedAccounts, session] = await Promise.all([
          AsyncStorage.getItem(ACCOUNTS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        const list: Account[] = storedAccounts ? JSON.parse(storedAccounts) : [];
        // The demo account is always available for presentations.
        if (!list.some((a) => a.id === demoAccount.id)) list.unshift(demoAccount);
        setAccounts(list);
        const id = session ? (JSON.parse(session) as { userId: string }).userId : null;
        setUserId(id && list.some((a) => a.id === id) ? id : null);
      } catch {
        setAccounts([demoAccount]);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const saveAccounts = useCallback(async (next: Account[]) => {
    setAccounts(next);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(next));
  }, []);

  const startSession = useCallback(async (id: string) => {
    setUserId(id);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ userId: id, signedInAt: Date.now() }));
  }, []);

  const current = accounts.find((a) => a.id === userId) ?? null;

  const signUp = useCallback<AuthContextValue['signUp']>(
    async ({ name, email, password, petName }) => {
      if (!name.trim()) return 'Tell us your name.';
      const emailError = validateEmail(email);
      if (emailError) return emailError;
      const passwordError = validatePassword(password);
      if (passwordError) return passwordError;
      if (accounts.some((a) => a.email === normalizeEmail(email))) {
        return 'An account with that email already exists. Try logging in.';
      }
      const account: Account = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        email: normalizeEmail(email),
        petName: petName.trim() || 'Mimo',
        passwordHash: scramble(password),
        createdAt: Date.now(),
      };
      await saveAccounts([...accounts, account]);
      await startSession(account.id);
      return null;
    },
    [accounts, saveAccounts, startSession],
  );

  const logIn = useCallback<AuthContextValue['logIn']>(
    async (email, password) => {
      const account = accounts.find((a) => a.email === normalizeEmail(email));
      if (!account || account.passwordHash !== scramble(password)) return 'That email and password don’t match.';
      await startSession(account.id);
      return null;
    },
    [accounts, startSession],
  );

  const logOut = useCallback(async () => {
    setUserId(null);
    await AsyncStorage.removeItem(SESSION_KEY);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async ({ name, email, petName }) => {
      if (!current) return 'You’re not logged in.';
      if (!name.trim()) return 'Name can’t be empty.';
      const emailError = validateEmail(email);
      if (emailError) return emailError;
      if (accounts.some((a) => a.id !== current.id && a.email === normalizeEmail(email))) {
        return 'Another account already uses that email.';
      }
      await saveAccounts(
        accounts.map((a) =>
          a.id === current.id
            ? { ...a, name: name.trim(), email: normalizeEmail(email), petName: petName.trim() || 'Mimo' }
            : a,
        ),
      );
      return null;
    },
    [accounts, current, saveAccounts],
  );

  const changePassword = useCallback<AuthContextValue['changePassword']>(
    async (currentPassword, next) => {
      if (!current) return 'You’re not logged in.';
      if (current.passwordHash !== scramble(currentPassword)) return 'Current password is incorrect.';
      const passwordError = validatePassword(next);
      if (passwordError) return passwordError;
      await saveAccounts(accounts.map((a) => (a.id === current.id ? { ...a, passwordHash: scramble(next) } : a)));
      return null;
    },
    [accounts, current, saveAccounts],
  );

  const deleteAccount = useCallback<AuthContextValue['deleteAccount']>(
    async (password) => {
      if (!current) return 'You’re not logged in.';
      if (current.passwordHash !== scramble(password)) return 'Password is incorrect.';
      if (current.id === demoAccount.id) return 'The demo account can’t be deleted. Create your own to try this.';
      await saveAccounts(accounts.filter((a) => a.id !== current.id));
      await AsyncStorage.removeItem(petStorageKey(current.id));
      await logOut();
      return null;
    },
    [accounts, current, logOut, saveAccounts],
  );

  const value = useMemo(
    () => ({
      ready,
      user: current ? toUser(current) : null,
      signUp,
      logIn,
      logOut,
      updateProfile,
      changePassword,
      deleteAccount,
    }),
    [ready, current, signUp, logIn, logOut, updateProfile, changePassword, deleteAccount],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>');
  return value;
}

/** Where a user's pet, goals and sparks are saved. */
export const petStorageKey = (userId: string) => `mimo:pet:${userId}`;
