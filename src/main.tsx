import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { IndexPage } from "./pages/index.tsx";
import { DrumMachinePage } from "./pages/drum-machine.tsx";
import { AppContextProvider } from "./app-context.tsx";
import { UserActivationLoader } from "./components/UserActivationLoader.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <IndexPage />,
  },
  {
    path: "/drum-machine",
    element: (
      <UserActivationLoader>
        <DrumMachinePage />
      </UserActivationLoader>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <ChakraProvider>
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </ChakraProvider>
  </AppContextProvider>
);
