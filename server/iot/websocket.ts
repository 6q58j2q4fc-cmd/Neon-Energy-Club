/**
 * IoT WebSocket Integration for Vending Machines
 * 
 * This module provides the structure for real-time communication with vending machines.
 * Currently uses simulated data; ready for MQTT/WebSocket integration with actual devices.
 * 
 * Integration Points:
 * - MQTT Broker: Connect to AWS IoT Core, Azure IoT Hub, or self-hosted Mosquitto
 * - WebSocket: Real-time updates to dashboard clients
 * - Device Shadow: Sync desired vs reported state
 */

import { EventEmitter } from 'events';

// Types for IoT data
export interface VendingMachineStatus {
  machineId: string;
  serialNumber: string;
  timestamp: number;
  online: boolean;
  temperature: number;
  humidity: number;
  batteryLevel: number;
  doorOpen: boolean;
  inventory: InventoryLevel[];
  lastSale?: SaleEvent;
  alerts: Alert[];
}

export interface InventoryLevel {
  slot: number;
  productId: string;
  productName: string;
  quantity: number;
  maxQuantity: number;
  lowStockThreshold: number;
}

export interface SaleEvent {
  timestamp: number;
  productId: string;
  productName: string;
  price: number;
  paymentMethod: 'card' | 'cash' | 'mobile';
  slot: number;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'temperature' | 'offline' | 'door_open' | 'payment_error' | 'maintenance';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

// IoT Event Emitter for real-time updates
class IoTEventBus extends EventEmitter {
  private static instance: IoTEventBus;
  
  private constructor() {
    super();
    this.setMaxListeners(100); // Support many dashboard connections
  }
  
  static getInstance(): IoTEventBus {
    if (!IoTEventBus.instance) {
      IoTEventBus.instance = new IoTEventBus();
    }
    return IoTEventBus.instance;
  }
  
  // Emit machine status update
  emitStatusUpdate(machineId: string, status: Partial<VendingMachineStatus>) {
    this.emit('status_update', { machineId, status, timestamp: Date.now() });
  }
  
  // Emit sale event
  emitSale(machineId: string, sale: SaleEvent) {
    this.emit('sale', { machineId, sale });
  }
  
  // Emit alert
  emitAlert(machineId: string, alert: Alert) {
    this.emit('alert', { machineId, alert });
  }
}

export const iotEventBus = IoTEventBus.getInstance();

/**
 * MQTT Configuration (for future integration)
 * 
 * To connect to actual vending machines:
 * 
 * 1. Set up MQTT broker (AWS IoT Core recommended)
 * 2. Configure device certificates
 * 3. Uncomment and configure the MQTT client below
 * 
 * Example topics:
 * - vending/{machineId}/status - Machine status updates
 * - vending/{machineId}/sales - Sale events
 * - vending/{machineId}/alerts - Alert notifications
 * - vending/{machineId}/commands - Commands to machine (dispense, reset, etc.)
 */

// MQTT Configuration placeholder
export const mqttConfig = {
  // AWS IoT Core
  awsIotEndpoint: process.env.AWS_IOT_ENDPOINT || '',
  awsIotRegion: process.env.AWS_IOT_REGION || 'us-east-1',
  
  // Self-hosted MQTT
  mqttBrokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  mqttUsername: process.env.MQTT_USERNAME || '',
  mqttPassword: process.env.MQTT_PASSWORD || '',
  
  // Topics
  topics: {
    status: 'vending/+/status',
    sales: 'vending/+/sales',
    alerts: 'vending/+/alerts',
    commands: 'vending/+/commands',
  },
};

/**
 * Initialize MQTT connection (placeholder for real implementation)
 * 
 * When ready to connect real devices:
 * 1. Install mqtt package: pnpm add mqtt
 * 2. Uncomment the code below
 * 3. Configure environment variables
 */
export async function initializeMqttConnection() {
  console.log('[IoT] MQTT connection initialization placeholder');
  console.log('[IoT] To connect real devices, configure MQTT_BROKER_URL environment variable');
  
  // Placeholder - uncomment when ready for real MQTT
  /*
  const mqtt = await import('mqtt');
  
  const client = mqtt.connect(mqttConfig.mqttBrokerUrl, {
    username: mqttConfig.mqttUsername,
    password: mqttConfig.mqttPassword,
    reconnectPeriod: 5000,
    keepalive: 60,
  });
  
  client.on('connect', () => {
    console.log('[IoT] Connected to MQTT broker');
    
    // Subscribe to all vending machine topics
    client.subscribe(mqttConfig.topics.status);
    client.subscribe(mqttConfig.topics.sales);
    client.subscribe(mqttConfig.topics.alerts);
  });
  
  client.on('message', (topic, message) => {
    const [, machineId, eventType] = topic.split('/');
    const data = JSON.parse(message.toString());
    
    switch (eventType) {
      case 'status':
        iotEventBus.emitStatusUpdate(machineId, data);
        break;
      case 'sales':
        iotEventBus.emitSale(machineId, data);
        break;
      case 'alerts':
        iotEventBus.emitAlert(machineId, data);
        break;
    }
  });
  
  client.on('error', (error) => {
    console.error('[IoT] MQTT error:', error);
  });
  
  return client;
  */
  
  return null;
}

/**
 * Send command to vending machine
 */
export async function sendMachineCommand(
  machineId: string, 
  command: 'dispense' | 'reset' | 'lock' | 'unlock' | 'reboot',
  params?: Record<string, unknown>
) {
  console.log(`[IoT] Command to ${machineId}: ${command}`, params);
  
  // Placeholder - implement when MQTT is connected
  /*
  const topic = `vending/${machineId}/commands`;
  mqttClient.publish(topic, JSON.stringify({ command, params, timestamp: Date.now() }));
  */
  
  return { success: true, message: 'Command queued (simulated)' };
}

/**
 * Simulated data generator for demo/testing
 * Remove this when connecting real devices
 */
export function startSimulatedDataStream(machineIds: string[]) {
  console.log('[IoT] Starting simulated data stream for demo');
  
  // Simulate status updates every 30 seconds
  const statusInterval = setInterval(() => {
    machineIds.forEach(machineId => {
      const status: Partial<VendingMachineStatus> = {
        temperature: 35 + Math.random() * 10,
        humidity: 40 + Math.random() * 20,
        batteryLevel: 85 + Math.random() * 15,
        online: Math.random() > 0.05, // 95% uptime
      };
      iotEventBus.emitStatusUpdate(machineId, status);
    });
  }, 30000);
  
  // Simulate random sales every 2-5 minutes
  const saleInterval = setInterval(() => {
    const machineId = machineIds[Math.floor(Math.random() * machineIds.length)];
    const sale: SaleEvent = {
      timestamp: Date.now(),
      productId: `prod-${Math.floor(Math.random() * 3) + 1}`,
      productName: ['NEON Original', 'NEON Pink', 'NEON Mixed'][Math.floor(Math.random() * 3)],
      price: [2.99, 3.49, 3.29][Math.floor(Math.random() * 3)],
      paymentMethod: ['card', 'cash', 'mobile'][Math.floor(Math.random() * 3)] as 'card' | 'cash' | 'mobile',
      slot: Math.floor(Math.random() * 6) + 1,
    };
    iotEventBus.emitSale(machineId, sale);
  }, 120000 + Math.random() * 180000);
  
  return () => {
    clearInterval(statusInterval);
    clearInterval(saleInterval);
  };
}

export default {
  iotEventBus,
  mqttConfig,
  initializeMqttConnection,
  sendMachineCommand,
  startSimulatedDataStream,
};
