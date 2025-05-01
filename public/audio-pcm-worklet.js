export class PcmProcessor extends AudioWorkletProcessor {
  // You can add a constructor or static getter for parameters if needed
  // static get parameterDescriptors() { return [{ name: 'myParam', defaultValue: 0 }]; }

  constructor() {
    super();
    // You can get processorOptions passed from the main thread here
    // e.g., options.processorOptions.someValue
  }

  process(inputs, outputs, parameters) {
    // inputs contains an array of inputs connected to the node.
    // Each input contains an array of channels.
    // Each channel contains a Float32Array with the PCM audio samples.
    const input = inputs[0]; // Get the first input

    if (input && input.length > 0) {
      // Assuming mono input, get the first channel
      const channelData = input[0];

      // channelData is a Float32Array containing the raw PCM samples
      // for this processing block (typically 128 samples).
      // Values range from -1.0 to 1.0.

      // Send the PCM data back to the main thread.
      // Cloning is necessary as the underlying buffer can change.
      // Choose only the data you need to minimize copying.
      this.port.postMessage({
        eventType: 'data',
        audioBuffer: channelData.slice(0) // Send a clone
      });

    } else {
      // No input available or input disconnected
      // console.log('No input available for PcmProcessor');
    }

    // Return true to keep the processor alive.
    // Return false will terminate it.
    return true;
  }
}

registerProcessor('PcmProcessor', PcmProcessor);