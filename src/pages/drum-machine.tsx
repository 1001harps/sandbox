import { Box, Flex, Grid, HStack, Image, Stack } from "@chakra-ui/react";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../app-context";
import { DrumName, Drums } from "../components/Drums";
import { DrumMachine } from "../devices/drum-machine";
import "./bbbeat.css";

const CHANNELS = 4;
const STEPS = 16;

const getDefaultSteps = (): boolean[][] => {
  return new Array(CHANNELS)
    .fill(null)
    .map(() => new Array(STEPS).fill(null).map(() => false));
};

export const DrumMachinePage = () => {
  const appContext = useContext(AppContext);

  const [currentStep, setCurrentStep] = useState(0);

  const [stepData, setStepData] = useState(getDefaultSteps());

  const toggleStep = (channel: number, step: number) => {
    setStepData((prevState) => {
      const newState = [...prevState];
      newState[channel][step] = !newState[channel][step];
      return newState;
    });
  };

  const drumMachineRef = useRef<DrumMachine>();

  useEffect(() => {
    if (!appContext.loaded) return;

    const drumMachine = new DrumMachine();
    drumMachineRef.current = drumMachine;
    drumMachine.init(appContext.audioContext as AudioContext);

    appContext.scheduler?.addEventListener((timestamp) => {
      setCurrentStep((s) => {
        const nextStep = s === STEPS - 1 ? 0 : s + 1;

        stepData.forEach((channel, channelIndex) => {
          if (channel[nextStep]) {
            drumMachine?.trigger(channelIndex, timestamp);
          }
        });

        return nextStep;
      });
    });
  }, [appContext.loaded]);

  const handleDrumClick = (name: DrumName) => {
    switch (name) {
      case "bd":
        drumMachineRef.current?.trigger(0, 0);

        setStepData((stepData) => {
          stepData[0][currentStep] = true;
          return stepData;
        });
        break;
      case "sd":
        drumMachineRef.current?.trigger(1, 0);

        setStepData((stepData) => {
          stepData[1][currentStep] = true;
          return stepData;
        });
        break;
      case "tom":
        drumMachineRef.current?.trigger(2, 0);

        setStepData((stepData) => {
          stepData[2][currentStep] = true;
          return stepData;
        });
        break;
      case "hh":
        drumMachineRef.current?.trigger(3, 0);

        setStepData((stepData) => {
          stepData[3][currentStep] = true;
          return stepData;
        });
        break;
    }
  };

  return (
    <Stack bg="#ff97f0" h="400px" spacing={0}>
      <HStack h="60px" w="100%" bg="#ff43b7" p="16px">
        <Image src="/9h-logo-white.svg" maxH="100%" />
        <Image src="/bbbeat/bbbeat-logo.svg" maxH="100%" ml="auto" />
      </HStack>

      <Flex h="100%">
        <Box m="auto">
          <Drums
            currentStep={currentStep}
            stepData={stepData}
            onClick={handleDrumClick}
          />
        </Box>
      </Flex>

      <Grid
        templateRows="repeat(4,1fr)6px"
        templateColumns={`repeat(16,1fr)`}
        gap="4px"
        p="4px"
      >
        {stepData.map((steps, channelIndex) => (
          <>
            {steps.map((active, stepIndex) => (
              <Box
                role="button"
                onClick={() => toggleStep(channelIndex, stepIndex)}
                bg={active ? "#ff43b7" : "white"}
                h="16px"
                borderRadius={0}
              ></Box>
            ))}
          </>
        ))}
        <>
          {new Array(STEPS).fill(null).map((_, i) => (
            <Box bg={currentStep === i ? "#ff43b7" : "white"}></Box>
          ))}
        </>
      </Grid>
    </Stack>
  );
};
