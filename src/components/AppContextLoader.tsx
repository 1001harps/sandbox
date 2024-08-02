import { Box, Button } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AppContext } from "../app-context";

interface AppContextLoaderProps {
  children?: React.ReactNode;
}

export const AppContextLoader = ({ children }: AppContextLoaderProps) => {
  const appContext = useContext(AppContext);

  const [hasInteractedWithPage, setHasInteractedWithPage] = useState(
    (window.navigator as any).userActivation.hasBeenActive
  );

  const handleLoadClick = () => {
    appContext.load();
    setHasInteractedWithPage(true);
  };

  if (!hasInteractedWithPage) {
    return (
      <Box w="100%" h="100%">
        <Button onClick={handleLoadClick}>load</Button>
      </Box>
    );
  }

  if (!appContext.loaded) {
    return <>loading</>;
  }

  return children;
};
