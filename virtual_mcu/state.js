/**
 * euantix Virtual MCU - State Manager
 * Tracks GPIO and Analog states to minimize I2C traffic.
 */

class StateManager {
    constructor() {
        this.gpio = {
            // MCP23017 has 16 pins (GPA0-7, GPB0-7)
            output: new Array(16).fill(0),
            input: new Array(16).fill(0),
            mode: new Array(16).fill(1) // 1 = Input, 0 = Output (MCP23017 convention)
        };
        this.analog = new Array(4).fill(0); // ADS1115 has 4 channels
        this.dirty = false;
        this.lastUpdate = Date.now();
    }

    setDigital(pin, value) {
        if (pin < 0 || pin >= 16) return;
        const val = value ? 1 : 0;
        if (this.gpio.output[pin] !== val) {
            this.gpio.output[pin] = val;
            this.dirty = true;
        }
    }

    getDigital(pin) {
        if (pin < 0 || pin >= 16) return 0;
        return this.gpio.input[pin];
    }

    updateInput(pin, value) {
        if (pin < 0 || pin >= 16) return;
        this.gpio.input[pin] = value ? 1 : 0;
    }

    setAnalog(channel, value) {
        if (channel < 0 || channel >= 4) return;
        this.analog[channel] = value;
    }

    getAnalog(channel) {
        if (channel < 0 || channel >= 4) return 0;
        return this.analog[channel];
    }

    isDirty() {
        return this.dirty;
    }

    clearDirty() {
        this.dirty = false;
    }

    serialize() {
        return {
            gpio: {
                output: this.gpio.output,
                input: this.gpio.input
            },
            analog: this.analog,
            timestamp: Date.now()
        };
    }
}

module.exports = new StateManager();
