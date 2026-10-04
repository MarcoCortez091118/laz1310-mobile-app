import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { ContentVersion, getContentVersion } from './api';

const POLL_INTERVAL_MS = 10_000;

interface ContentVersionContextValue {
  version: ContentVersion | null;
  releaseId: string | null;
  revision: number;
  error: string | null;
  refresh: () => Promise<ContentVersion | null>;
}

const ContentVersionContext = createContext<ContentVersionContextValue | null>(null);

export function ContentVersionProvider({ children }: PropsWithChildren) {
  const [version, setVersion] = useState<ContentVersion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshing = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshing.current) {
      return null;
    }

    refreshing.current = true;
    try {
      const next = await getContentVersion();
      setVersion((current) => {
        if (
          current?.revision === next.revision &&
          current.releaseId === next.releaseId &&
          current.updatedAt === next.updatedAt
        ) {
          return current;
        }
        return next;
      });
      setError(null);
      return next;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'No pudimos comprobar la versión de contenido.',
      );
      return null;
    } finally {
      refreshing.current = false;
    }
  }, []);

  useEffect(() => {
    void refresh();

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void refresh();
      }
    }, POLL_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refresh]);

  const value = useMemo<ContentVersionContextValue>(
    () => ({
      version,
      releaseId: version?.releaseId ?? null,
      revision: version?.revision ?? 0,
      error,
      refresh,
    }),
    [error, refresh, version],
  );

  return (
    <ContentVersionContext.Provider value={value}>
      {children}
    </ContentVersionContext.Provider>
  );
}

export function useContentVersion() {
  const value = useContext(ContentVersionContext);
  if (!value) {
    throw new Error('useContentVersion must be used within ContentVersionProvider');
  }
  return value;
}
