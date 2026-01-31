# IoT Vending Machine Integration Guide

This document outlines how to connect real vending machines to the NEON Energy dashboard.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vending        │     │  MQTT Broker    │     │  NEON Server    │
│  Machine        │────▶│  (AWS IoT Core) │────▶│  (WebSocket)    │
│  (ESP32/RPi)    │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Dashboard UI   │
                                               │  (Real-time)    │
                                               └─────────────────┘
```

## Current Status

The system currently uses **simulated data** for demonstration purposes. Real IoT integration requires:

1. MQTT broker setup (AWS IoT Core recommended)
2. Device firmware with MQTT client
3. SSL certificates for secure communication
4. Environment variable configuration

## Quick Start for Real Devices

### 1. Set Up MQTT Broker

**Option A: AWS IoT Core (Recommended)**
```bash
# Install AWS CLI and configure
aws iot create-thing --thing-name "vending-machine-001"
aws iot create-keys-and-certificate --set-as-active
```

**Option B: Self-hosted Mosquitto**
```bash
docker run -d -p 1883:1883 -p 9001:9001 eclipse-mosquitto
```

### 2. Configure Environment Variables

Add to your `.env` file:
```env
# AWS IoT Core
AWS_IOT_ENDPOINT=your-endpoint.iot.us-east-1.amazonaws.com
AWS_IOT_REGION=us-east-1

# OR Self-hosted MQTT
MQTT_BROKER_URL=mqtt://your-broker:1883
MQTT_USERNAME=neon
MQTT_PASSWORD=your-secure-password
```

### 3. Device Firmware Topics

Machines should publish/subscribe to these topics:

| Topic | Direction | Purpose |
|-------|-----------|---------|
| `vending/{machineId}/status` | Publish | Machine status updates |
| `vending/{machineId}/sales` | Publish | Sale events |
| `vending/{machineId}/alerts` | Publish | Alert notifications |
| `vending/{machineId}/commands` | Subscribe | Remote commands |

### 4. Message Formats

**Status Update (publish every 30s)**
```json
{
  "timestamp": 1706745600000,
  "online": true,
  "temperature": 38.5,
  "humidity": 45,
  "batteryLevel": 92,
  "doorOpen": false,
  "inventory": [
    { "slot": 1, "productId": "neon-original", "quantity": 15, "maxQuantity": 20 },
    { "slot": 2, "productId": "neon-pink", "quantity": 8, "maxQuantity": 20 }
  ]
}
```

**Sale Event (publish on each sale)**
```json
{
  "timestamp": 1706745600000,
  "productId": "neon-original",
  "productName": "NEON Original",
  "price": 2.99,
  "paymentMethod": "card",
  "slot": 1
}
```

**Alert (publish when triggered)**
```json
{
  "id": "alert-123",
  "type": "low_stock",
  "severity": "warning",
  "message": "Slot 2 running low (8 remaining)",
  "timestamp": 1706745600000
}
```

**Command (subscribe and execute)**
```json
{
  "command": "dispense",
  "params": { "slot": 1 },
  "timestamp": 1706745600000
}
```

## Supported Commands

| Command | Description | Parameters |
|---------|-------------|------------|
| `dispense` | Dispense product | `{ slot: number }` |
| `reset` | Reset machine state | None |
| `lock` | Lock machine | None |
| `unlock` | Unlock machine | None |
| `reboot` | Reboot controller | None |

## Hardware Recommendations

### Controller Options
- **ESP32** - Low cost, WiFi built-in, good for simple machines
- **Raspberry Pi** - More powerful, supports camera/display
- **Industrial PLC** - For commercial-grade machines

### Sensors
- **Temperature**: DS18B20 or DHT22
- **Humidity**: DHT22 or BME280
- **Door**: Reed switch or hall effect sensor
- **Inventory**: IR break-beam or weight sensors
- **Payment**: Nayax, Cantaloupe, or custom NFC reader

### Connectivity
- **WiFi**: Built-in on ESP32/RPi
- **Cellular**: LTE modem (Quectel EC25, SIM7600)
- **Ethernet**: For fixed locations

## Security Best Practices

1. **Use TLS/SSL** for all MQTT connections
2. **Rotate certificates** regularly
3. **Implement device authentication** with unique credentials per machine
4. **Validate commands** before execution
5. **Log all activities** for audit trail
6. **Rate limit** command execution

## Testing Without Hardware

The dashboard includes a simulated data mode for testing:

```typescript
import { startSimulatedDataStream } from './server/iot/websocket';

// Start simulation for demo machines
const stopSimulation = startSimulatedDataStream(['machine-001', 'machine-002']);

// Stop when done
stopSimulation();
```

## Support

For integration support, contact the NEON technical team or refer to:
- AWS IoT Core Documentation: https://docs.aws.amazon.com/iot/
- MQTT Protocol: https://mqtt.org/
- ESP32 Arduino Core: https://github.com/espressif/arduino-esp32
