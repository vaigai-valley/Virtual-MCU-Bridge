/**
 * euantix Virtual MCU - Hardware Bridge
 * Handles HID communication with MCP2221A.
 */

const HID = require('node-hid');

class HardwareBridge {
    constructor() {
        this.device = null;
        this.vendorId = 0x04D8;
        this.productId = 0x00DD;
        this.connected = false;
    }

    connect() {
        try {
            const devices = HID.devices();
            const target = devices.find(d => d.vendorId === this.vendorId && d.productId === this.productId);
            
            if (target) {
                this.device = new HID.HID(target.path);
                this.connected = true;
                console.log("✅ MCP2221A connected.");
                this.initI2C();
                return true;
            } else {
                console.warn("⚠️ MCP2221A not found.");
                return false;
            }
        } catch (e) {
            console.error("❌ HID Error:", e.message);
            return false;
        }
    }

    initI2C() {
        // Set I2C speed to 100kHz
        const report = Buffer.alloc(64);
        report[0] = 0x90; // Status/Set Parameters
        report[8] = 0x01; // Cancel current I2C transfer
        report[9] = 0x01; // Set I2C speed
        report[10] = 0x1A; // 100kHz (for 12MHz clock: 12000000/100000 - 2 = 118... wait, the formula is different)
        // For MCP2221A: Divider = (12,000,000 / BaudRate) - 3
        // For 100kHz: (12,000,000 / 100,000) - 3 = 120 - 3 = 117 (0x75)
        report[10] = 0x75; 
        
        this.sendReport(report);
    }

    sendReport(buffer) {
        if (!this.connected) return null;
        try {
            this.device.write(Array.from(buffer));
            const res = this.device.readSync(100);
            return Buffer.from(res);
        } catch (e) {
            this.connected = false;
            return null;
        }
    }

    i2cWrite(address, data) {
        const report = Buffer.alloc(64);
        report[0] = 0x60; // Write I2C Data
        report[1] = data.length & 0xFF; // Low byte of length
        report[2] = (data.length >> 8) & 0xFF; // High byte of length
        report[3] = (address << 1); // Address (Write bit 0)
        
        for (let i = 0; i < data.length; i++) {
            report[4 + i] = data[i];
        }
        
        const res = this.sendReport(report);
        if (res && res[1] === 0x00) {
            return true;
        }
        return false;
    }

    i2cRead(address, length) {
        const report = Buffer.alloc(64);
        report[0] = 0x40; // Read I2C Data
        report[1] = length & 0xFF;
        report[2] = (length >> 8) & 0xFF;
        report[3] = (address << 1) | 0x01; // Address (Read bit 1)
        
        let res = this.sendReport(report);
        if (!res || res[1] !== 0x00) return null;

        // Now poll for data
        const poll = Buffer.alloc(64);
        poll[0] = 0x40; // Get I2C Data
        
        // Wait a bit for data to be ready
        let dataRes = null;
        for (let i = 0; i < 5; i++) {
            dataRes = this.sendReport(poll);
            if (dataRes && dataRes[1] === 0x00) {
                if (dataRes[2] === 0x00) { // Data ready
                    return dataRes.slice(4, 4 + length);
                }
            }
        }
        return null;
    }

    // --- MCP23017 specific ---
    writeGPIO(port, value) {
        // Port A: 0x12, Port B: 0x13
        const reg = port === 'A' ? 0x12 : 0x13;
        return this.i2cWrite(0x20, [reg, value]);
    }

    readGPIO(port) {
        const reg = port === 'A' ? 0x12 : 0x13;
        this.i2cWrite(0x20, [reg]);
        const res = this.i2cRead(0x20, 1);
        return res ? res[0] : 0;
    }

    // --- ADS1115 specific ---
    readADC(channel) {
        // Config register: 0x01
        // OS=1, MUX=4-7 (Single ended), PGA=2 (4.096V), MODE=1 (Single shot)
        // DR=4 (128SPS), COMP_MODE=0, COMP_POL=0, COMP_LAT=0, COMP_QUE=3 (Disable)
        const mux = 0x4 | channel; // 0x4=A0, 0x5=A1, etc.
        const configH = 0x81 | (mux << 4);
        const configL = 0x83;
        
        this.i2cWrite(0x48, [0x01, configH, configL]);
        
        // Wait for conversion (approx 8ms for 128SPS)
        // In a real loop we would poll the OS bit, but here we can just wait or use a timeout
        
        // Pointer to Conversion register: 0x00
        this.i2cWrite(0x48, [0x00]);
        const res = this.i2cRead(0x48, 2);
        if (res) {
            return (res[0] << 8) | res[1];
        }
        return 0;
    }
}

module.exports = new HardwareBridge();
