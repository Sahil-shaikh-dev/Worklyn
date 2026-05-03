import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadDisplayName, saveDisplayName } from './displayNameStorage';

type UserProfileContextValue = Readonly<{
  /** Trimmed display name from storage; empty if unset. */
  displayName: string;
  /** True after the first load attempt (success or failure). */
  hydrated: boolean;
  setDisplayName: (name: string) => Promise<void>;
}>;

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [displayName, setDisplayName] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDisplayName()
      .then(name => {
        if (!cancelled) {
          setDisplayName(name.trim());
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayName('');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistDisplayName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    setDisplayName(trimmed);
    await saveDisplayName(trimmed);
  }, []);

  const value = useMemo(
    () => ({ displayName, hydrated, setDisplayName: persistDisplayName }),
    [displayName, hydrated, persistDisplayName],
  );

  return (
    <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileContextValue {
  const ctx = useContext(UserProfileContext);
  if (ctx == null) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return ctx;
}
