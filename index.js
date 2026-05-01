/**
 * euantix Virtual MCU Bridge
 * Standalone Local Client to bridge Circuit Studio (Web) to MCP2221A Hardware.
 */

const axios = require('axios');
const mcu = require('./virtual_mcu/mcu');

const WORKER_URL = 'https://sanwitch.vaigaivalley.workers.dev/api/cloud';

async function startBridge() {
    console.log("🚀 Euantix Virtual MCU Bridge Starting...");
    
    if (!mcu.begin()) {
        console.error("❌ MCP2221A Hardware not detected! Please plug in your hardware.");
        process.exit(1);
    }

    console.log("🟢 Hardware Detected (MCP2221A / MCP23017 / ADS1115)");
    console.log(`📡 Connected to Cloud: ${WORKER_URL}`);

    // 1. Sync Hardware State Locally
    mcu.startLoop(100);

    // 2. Push Local Hardware State to Cloud (for HW Panel)
    setInterval(async () => {
        try {
            const stateData = require('./virtual_mcu/state').serialize();
            await axios.post(`${WORKER_URL}/update`, stateData, { timeout: 2000 });
        } catch (e) {
            console.warn("⚠️ Cloud Sync Error: Failed to push state.");
        }
    }, 500);

    // 3. Pull Commands from Cloud (from Browser Canvas)
    setInterval(async () => {
        try {
            const res = await axios.get(`${WORKER_URL}/commands`);
            if (res.data && res.data.commands) {
                res.data.commands.forEach(cmd => {
                    if (cmd.cmd === 'digitalWrite') {
                        mcu.digitalWrite(cmd.pin, cmd.value);
                        console.log(`🔌 Command Executed: digitalWrite(pin:${cmd.pin}, val:${cmd.value})`);
                    } else if (cmd.cmd === 'analogWrite') {
                        mcu.analogWrite(cmd.pin, cmd.value);
                        console.log(`🔌 Command Executed: analogWrite(pin:${cmd.pin}, val:${cmd.value})`);
                    }
                });
            }
        } catch (e) {
            console.warn("⚠️ Cloud Sync Error: Failed to pull commands.");
        }
    }, 500);

    console.log("\n💎 Bridge running. You can now use the HW Panel on Circuit Studio.");
}

startBridge();
