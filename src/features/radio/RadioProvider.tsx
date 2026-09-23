import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { RADIO_CONFIG } from '../../config/radio';
import type {
  RadioContextValue,
  RadioPlaybackState,
} from './types';

const MAX_RECONNECT_ATTEMPTS = 4;
const RECONNECT_DELAYS_MS = [1_000, 2_000, 4_000, 8_000] as const;

export const RadioContext = createContext<RadioContextValue | null>(null);

export function RadioProvider({ children }: PropsWithChildren) {
  const player = useAudioPlayer(null, {
    updateInterval: 500,
    downloadFirst: false,
    preferredForwardBufferDuration: 6,
  });
  const status = useAudioPlayerStatus(player);

  const [desiredPlayback, setDesiredPlayback] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [manualState, setManualState] =
    useState<RadioPlaybackState>('idle');

  const preparedRef = useRef(false);
  const hasPlayedRef = useRef(false);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      player.clearLockScreenControls();
    };
  }, [player]);

  const activateLockScreen = useCallback(() => {
    player.setActiveForLockScreen(
      true,
      {
        title: RADIO_CONFIG.name,
        artist: RADIO_CONFIG.city,
        albumTitle: RADIO_CONFIG.slogan,
      },
      {
        isLiveStream: true,
        showSeekBackward: false,
        showSeekForward: false,
      },
    );
  }, [player]);

  const loadStream = useCallback(() => {
    player.replace(RADIO_CONFIG.streamUrl);
    preparedRef.current = true;
  }, [player]);

  const play = useCallback(() => {
    setDesiredPlayback(true);
    setHasStarted(true);
    setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');

    if (!preparedRef.current) {
      loadStream();
    }

    activateLockScreen();
    player.play();
  }, [activateLockScreen, loadStream, player]);

  const pause = useCallback(() => {
    setDesiredPlayback(false);
    retryAttemptRef.current = 0;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    player.pause();
    setManualState(preparedRef.current ? 'paused' : 'idle');
  }, [player]);

  const retry = useCallback(() => {
    retryAttemptRef.current = 0;
    setDesiredPlayback(true);
    setHasStarted(true);
    setManualState('reconnecting');
    loadStream();
    activateLockScreen();
    player.play();
  }, [activateLockScreen, loadStream, player]);

  const toggle = useCallback(() => {
    if (status.playing || desiredPlayback) {
      pause();
      return;
    }
    play();
  }, [desiredPlayback, pause, play, status.playing]);

  useEffect(() => {
    if (status.playing) {
      hasPlayedRef.current = true;
      retryAttemptRef.current = 0;
      setManualState('playing');
      return;
    }

    if (!desiredPlayback) {
      setManualState(preparedRef.current ? 'paused' : 'idle');
      return;
    }

    if (status.error) {
      if (retryTimerRef.current) {
        return;
      }

      const attempt = retryAttemptRef.current;
      if (attempt >= MAX_RECONNECT_ATTEMPTS) {
        setManualState('error');
        return;
      }

      setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');

      const delay =
        RECONNECT_DELAYS_MS[
          Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)
        ] ?? 8_000;

      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        retryAttemptRef.current += 1;
        loadStream();
        activateLockScreen();
        player.play();
      }, delay);
      return;
    }

    if (status.isBuffering || !status.isLoaded) {
      setManualState(hasPlayedRef.current ? 'reconnecting' : 'connecting');
    }
  }, [
    activateLockScreen,
    desiredPlayback,
    loadStream,
    player,
    status.error,
    status.isBuffering,
    status.isLoaded,
    status.playing,
  ]);

  const value = useMemo<RadioContextValue>(
    () => ({
      state: manualState,
      error: status.error,
      isPlaying: manualState === 'playing',
      hasStarted,
      play,
      pause,
      toggle,
      retry,
    }),
    [
      hasStarted,
      manualState,
      pause,
      play,
      retry,
      status.error,
      toggle,
    ],
  );

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}
