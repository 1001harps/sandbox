import { useContext, useEffect, useState } from "react";
import { AppContext } from "../app-context.tsx";

const userActivationEvents = [
  "keydown",
  "mousedown",
  "pointerdown",
  "pointerup",
  "touchend",
];

const testUserActivationEvent = (eventName: string, e: Event) => {
  if (!e.isTrusted) return false;
  if (!userActivationEvents.includes(eventName)) return false;

  if (eventName === "keydown" && (e as KeyboardEvent).key === "escape") {
    return false;
  }

  if (
    eventName === "pointerdown" &&
    (e as PointerEvent).pointerType !== "mouse"
  ) {
    return false;
  }

  if (
    eventName === "pointerup" &&
    (e as PointerEvent).pointerType === "mouse"
  ) {
    return false;
  }

  return true;
};

interface UserActivationLoaderProps {
  children?: React.ReactNode;
}

export const UserActivationLoader = ({
  children,
}: UserActivationLoaderProps) => {
  const [hasBeenActive, setHasBeenActive] = useState(
    !!globalThis?.navigator.userActivation.hasBeenActive
  );

  const appContext = useContext(AppContext);

  useEffect(() => {
    if (hasBeenActive) return;

    const listeners = userActivationEvents.map((eventName) => ({
      name: eventName,
      listener: (e: Event) => {
        if (testUserActivationEvent(eventName, e)) setHasBeenActive(true);
      },
    }));

    listeners.forEach(({ name, listener }) =>
      document.addEventListener(name, listener)
    );

    return () => {
      listeners.forEach(({ name, listener }) =>
        document.removeEventListener(name, listener)
      );
    };
  }, [hasBeenActive]);

  useEffect(() => {
    if (hasBeenActive && !appContext.loaded) {
      appContext.load();
    }
  }, [hasBeenActive]);

  const handleLoadClick = () => {
    setHasBeenActive(true);
  };

  if (!hasBeenActive) {
    return (
      <div className="w-full h-full flex">
        <button
          className="m-auto bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
          onClick={handleLoadClick}
        >
          load
        </button>
      </div>
    );
  }

  return children;
};
