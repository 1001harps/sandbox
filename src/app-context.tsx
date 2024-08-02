import { Scheduler } from "@9h/lib";
import { createContext, useRef, useState } from "react";

interface AppContextValue {
  loaded: boolean;
  load: () => void;
  audioContext?: AudioContext;
  scheduler?: Scheduler;
}

const defaultAppContextValue: AppContextValue = {
  loaded: false,
  load: () => {},
  audioContext: undefined,
  scheduler: undefined,
};

export const AppContext = createContext(defaultAppContextValue);

interface AppContextProviderProps {
  children: React.ReactNode;
}

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [loaded, setLoaded] = useState(false);

  const audioContextRef = useRef<AudioContext>();
  const schedulerRef = useRef<Scheduler>();

  const load = () => {
    if (loaded) return;

    audioContextRef.current = new AudioContext();
    schedulerRef.current = new Scheduler(audioContextRef.current, 120);

    setLoaded(true);
  };

  return (
    <AppContext.Provider
      value={{
        loaded,
        load,
        audioContext: audioContextRef.current,
        scheduler: schedulerRef.current,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
