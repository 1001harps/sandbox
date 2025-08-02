import { Button, Grid } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../app-context";
import { DrumSynthPrototype } from "../devices/drum-synth-prototype";
import { useStepState } from "../react-utils";

const STEPS = 16;
const CHANNELS = 8;

export const DrumSynthPrototypePage = () => {
  const { scheduler } = useContext(AppContext);
  const [currentStep, setCurrentStep] = useState(0);
  const [drumSynth] = useState(() => new DrumSynthPrototype());
  const [steps, toggleStep] = useStepState(CHANNELS, STEPS);

  useEffect(() => {
    if (!scheduler) return;

    const onStep = (ts: number) => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % STEPS;
        steps.forEach((channelSteps, channelIndex) => {
          if (channelSteps[nextStep]) {
            drumSynth.trigger(channelIndex, ts);
          }
        });
        return nextStep;
      });
    };

    scheduler?.addEventListener(onStep);

    return () => {
      scheduler?.removeEventListener(onStep);
    };
  }, [scheduler]);

  return (
    <>
      <Grid
        w="300px"
        gap="3px"
        templateColumns={`repeat(${STEPS}, 1fr)`}
        templateRows={`repeat(${CHANNELS}, 1fr)`}
      >
        {new Array(CHANNELS)
          .fill(null)
          .map((_, channelIndex) =>
            new Array(STEPS)
              .fill(null)
              .map((_, stepIndex) => (
                <Button
                  key={channelIndex + "_" + stepIndex}
                  className="step-button"
                  onClick={() => toggleStep(channelIndex, stepIndex)}
                  colorScheme={
                    stepIndex === currentStep
                      ? "red"
                      : steps[channelIndex][stepIndex]
                      ? "blue"
                      : "gray"
                  }
                ></Button>
              ))
          )}
      </Grid>
    </>
  );
};
