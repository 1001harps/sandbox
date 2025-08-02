import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { IndexPage } from "./pages/index.tsx";
import { AppContextProvider } from "./app-context.tsx";
import { DrumSynthPrototypePage } from "./pages/drum-synth-prototype.tsx";
import { UserActivationLoader } from "./components/UserActivationLoader.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route
            path="/drum-synth-prototype"
            element={
              <UserActivationLoader>
                <DrumSynthPrototypePage />
              </UserActivationLoader>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  </AppContextProvider>
);
