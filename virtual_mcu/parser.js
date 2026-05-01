/**
 * euantix Virtual MCU - Command Parser
 * Handles incoming JSON commands for the MCU.
 */

const mcu = require('./mcu');
const state = require('./state');

class CommandParser {
    parse(message) {
        try {
            const data = typeof message === 'string' ? JSON.parse(message) : message;
            
            switch (data.cmd) {
                case 'digitalWrite':
                    mcu.digitalWrite(data.pin, data.value);
                    return { status: 'ok' };
                
                case 'digitalRead':
                    return { status: 'ok', value: mcu.digitalRead(data.pin) };
                
                case 'analogRead':
                    return { status: 'ok', value: mcu.analogRead(data.channel) };
                
                case 'getState':
                    return { status: 'ok', state: state.serialize() };
                
                case 'ping':
                    return { status: 'pong', timestamp: Date.now() };

                default:
                    return { status: 'error', message: 'Unknown command' };
            }
        } catch (e) {
            return { status: 'error', message: 'Invalid JSON' };
        }
    }
}

module.exports = new CommandParser();
