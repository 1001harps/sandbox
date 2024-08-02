import { SampleBankDevice } from "@9h/lib";

export class DrumMachine extends SampleBankDevice {
  constructor() {
    const files = [
      "/samples/drums/bd.wav",
      "/samples/drums/sd.wav",
      "/samples/drums/cp.wav",
      "/samples/drums/hh.wav",
    ];

    super(files);
  }
}
