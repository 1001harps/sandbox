import { Box, Button, Heading, Image } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AppContext } from "../app-context";

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
    <Box>
      <Heading display="flex" bg="#00a4ff" p="16px" color="white">
        <Image src="9h-logo.svg" maxH="50px"></Image>

        {appContext.loaded && (
          <Box ml="auto">
            <Button onClick={togglePlaying}>
              {playing ? "pause" : "play"}
            </Button>
          </Box>
        )}
      </Heading>

      <Box p="16px" as="main">
        {children}
      </Box>
    </Box>
  );
};
