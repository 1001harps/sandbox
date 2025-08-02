import { useContext, useEffect, useState } from "react";
import { AppContext } from "../app-context.tsx";
import { DrumSynthPrototype } from "../devices/drum-synth-prototype.ts";
import { useStepState } from "../react-utils.ts";

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
      setCurrentStep((prev: number) => {
        const nextStep = (prev + 1) % STEPS;
        steps.forEach((channelSteps: boolean[], channelIndex: number) => {
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

  const getButtonClasses = (channelIndex: number, stepIndex: number) => {
    const baseClasses =
      "w-4 h-4 border border-gray-300 transition-colors duration-150";

    if (stepIndex === currentStep) {
      return `${baseClasses} bg-red-500 hover:bg-red-600`;
    }

    if (steps[channelIndex][stepIndex]) {
      return `${baseClasses} bg-blue-500 hover:bg-blue-600`;
    }

    return `${baseClasses} bg-gray-200 hover:bg-gray-300`;
  };

  return (
    <>
      <div
        className="inline-grid gap-1 w-80"
        style={{
          gridTemplateColumns: `repeat(${STEPS}, 1fr)`,
          gridTemplateRows: `repeat(${CHANNELS}, 1fr)`,
        }}
      >
        {new Array(CHANNELS)
          .fill(null)
          .map((_, channelIndex) =>
            new Array(STEPS)
              .fill(null)
              .map((_, stepIndex) => (
                <button
                  key={channelIndex + "_" + stepIndex}
                  className={getButtonClasses(channelIndex, stepIndex)}
                  onClick={() => toggleStep(channelIndex, stepIndex)}
                ></button>
              ))
          )}
      </div>
    </>
  );
};
