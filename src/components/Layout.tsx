import { useContext, useState } from "react";
import { AppContext } from "../app-context.tsx";
import { Link } from "react-router-dom";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [playing, setPlaying] = useState(false);

  const appContext = useContext(AppContext);

  const togglePlaying = () => {
    if (playing) {
      appContext.scheduler?.stop();
      setPlaying(false);
      return;
    }

    appContext.scheduler?.start();
    setPlaying(true);
  };

  return (
    <div>
      <header className="flex bg-[#00a4ff] p-4 text-white">
        <Link to="/">
          <img src="/9h-logo.svg" alt="Logo" className="h-12" />
        </Link>

        {appContext.loaded && (
          <div className="ml-auto">
            <button
              onClick={togglePlaying}
              className="bg-white text-[#00a4ff] px-4 py-2 rounded hover:bg-gray-100 transition-colors"
            >
              {playing ? "pause" : "play"}
            </button>
          </div>
        )}
      </header>

      <main className="p-4">{children}</main>
    </div>
  );
};
