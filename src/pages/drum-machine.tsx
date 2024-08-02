import { Box, Button, HStack } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../app-context";
import { DrumMachine } from "../devices/drum-machine";

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

  useEffect(() => {
    if (!appContext.loaded) return;

    const drumMachine = new DrumMachine();
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

  return (
    <>
      <Box>
        {stepData.map((steps, channelIndex) => (
          <HStack w="100%" p="16px">
            {steps.map((step, stepIndex) => (
              <Button
                onClick={() => toggleStep(channelIndex, stepIndex)}
                bg={
                  stepIndex === currentStep ? "blue" : step ? "red" : "orange"
                }
                w="50px"
              ></Button>
            ))}
          </HStack>
        ))}
      </Box>
    </>
  );
};
