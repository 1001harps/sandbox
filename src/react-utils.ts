import { useState } from "react";

export const useStepState = (nChannels: number, nSteps: number) => {
  const initialStepState: boolean[][] = Array.from({ length: nChannels }, () =>
    Array(nSteps).fill(false)
  );
  const [steps, setSteps] = useState(initialStepState);

  const toggleStep = (channelIndex: number, stepIndex: number) => {
    setSteps((prevSteps) => {
      const newSteps = [...prevSteps];
      newSteps[channelIndex][stepIndex] = !newSteps[channelIndex][stepIndex];
      return newSteps;
    });
  };

  return [steps, toggleStep] as const;
};
