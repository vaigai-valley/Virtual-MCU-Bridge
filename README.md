# Euantix Virtual MCU Bridge

This is a standalone hardware bridge client for **Euantix Circuit Studio**. It allows your local hardware (MCP2221A, MCP23017, ADS1115) to communicate with the web-based IDE.

## 🚀 Setup & Run (One-Click)

1. **Windows**: Right-click `run.ps1` and select **Run with PowerShell**.
2. **Linux**: Run `chmod +x run.sh` then `./run.sh`.

The scripts will automatically install the necessary dependencies (`npm install`) on the first run and then start the bridge.

## 🛠 Manual Setup
If you prefer to run manually:
1. **Install Dependencies**: `npm install`
2. **Start**: `npm start`

## 📟 Usage

Once the bridge is running:
1. Open [Circuit Studio](https://sanwitch.vaigaivalley.workers.dev/CircuitStudio/sim.html).
2. Click on the **HW PANEL** button in the sidebar.
3. Your physical hardware state (LEDs, Sensors) will now be mirrored in the browser!
4. Any components you toggle on the canvas will instantly control your physical hardware.

## 🛠 Troubleshooting

- **Hardware not detected**: Ensure your MCP2221A driver is correctly installed and the device is visible in your system's HID devices.
- **Connection Error**: Check your internet connection. The bridge needs to talk to the Euantix Cloud Worker.

---
Built with ❤️ by Euantix.
