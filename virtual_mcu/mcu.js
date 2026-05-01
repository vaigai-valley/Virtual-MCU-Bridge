/**
 * euantix Virtual MCU - Arduino API
 * Provides high-level digitalWrite, digitalRead, analogRead.
 */

const state = require('./state');
const bridge = require('./bridge');

class VirtualMCU {
    constructor() {
        this.isRunning = false;
        this.loopInterval = null;
    }

    begin() {
        console.log("🚀 Initializing Virtual MCU...");
        if (bridge.connect()) {
            // Initialize MCP23017: all pins as output for now or as requested
            // IODIRA: 0x00, IODIRB: 0x01. 0 = Output, 1 = Input
            bridge.i2cWrite(0x20, [0x00, 0x00]); // GPA all outputs
            bridge.i2cWrite(0x20, [0x01, 0x00]); // GPB all outputs
            this.isRunning = true;
            return true;
        }
        return false;
    }

    digitalWrite(pin, value) {
        state.setDigital(pin, value);
    }

    digitalRead(pin) {
        return state.getDigital(pin);
    }

    analogRead(channel) {
        return state.getAnalog(channel);
    }

    // Main sync loop
    sync() {
        if (!this.isRunning) return;

        // 1. Sync Outputs to MCP23017
        if (state.isDirty()) {
            const gpa = this._packPins(state.gpio.output.slice(0, 8));
            const gpb = this._packPins(state.gpio.output.slice(8, 16));
            bridge.writeGPIO('A', gpa);
            bridge.writeGPIO('B', gpb);
            state.clearDirty();
        }

        // 2. Sync Inputs from MCP23017 (Optional: only if needed for performance)
        // const inA = bridge.readGPIO('A');
        // this._unpackPins(inA, 0);

        // 3. Sync Analog from ADS1115 (Sample one channel per sync to be efficient)
        this.currentAnalogChannel = (this.currentAnalogChannel || 0) % 4;
        const val = bridge.readADC(this.currentAnalogChannel);
        state.setAnalog(this.currentAnalogChannel, val);
        this.currentAnalogChannel++;
    }

    _packPins(pins) {
        let res = 0;
        for (let i = 0; i < 8; i++) {
            if (pins[i]) res |= (1 << i);
        }
        return res;
    }

    _unpackPins(byte, offset) {
        for (let i = 0; i < 8; i++) {
            state.updateInput(offset + i, (byte >> i) & 0x01);
        }
    }

    startLoop(ms = 10) {
        this.loopInterval = setInterval(() => {
            this.sync();
        }, ms);
    }

    stopLoop() {
        if (this.loopInterval) clearInterval(this.loopInterval);
    }
}

module.exports = new VirtualMCU();
