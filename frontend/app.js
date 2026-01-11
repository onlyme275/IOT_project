/**
 * HydroGuard IoT Dashboard Logic
 * Uses Paho MQTT over WebSockets
 */

const MQTT_CONFIG = {
    host: 'broker.mqttdashboard.com',
    port: 8000, // WebSockets port
    clientId: 'Web_Dash_' + Math.random().toString(16).substr(2, 8),
    topic: 'bbg/esp32/waterlevel'
};

let client;
let offlineTimeout;

const elements = {
    statusBadge: document.getElementById('connection-status'),
    statusText: document.querySelector('.status-text'),
    levelCircle: document.getElementById('level-circle'),
    levelValue: document.getElementById('level-value'),
    rawValue: document.getElementById('raw-value'),
    lastUpdate: document.getElementById('last-update'),
    nodeStatus: document.getElementById('node-status'),
    log: document.getElementById('mqtt-log')
};

function init() {
    client = new Paho.MQTT.Client(MQTT_CONFIG.host, MQTT_CONFIG.port, MQTT_CONFIG.clientId);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    connect();
}

function connect() {
    log('System', 'Connecting to HiveMQ Broker...');
    client.connect({
        onSuccess: onConnect,
        onFailure: (err) => {
            log('Error', 'Connection failed: ' + err.errorMessage);
            setTimeout(connect, 5000);
        },
        useSSL: false // Change to true if using 8884
    });
}

function onConnect() {
    log('System', 'Connected via WebSockets');
    elements.statusBadge.classList.replace('disconnected', 'connected');
    elements.statusText.innerText = 'Online';

    client.subscribe(MQTT_CONFIG.topic);
    log('System', 'Subscribed to topic');
}

function onConnectionLost(responseObject) {
    if (responseObject.errorCode !== 0) {
        log('Error', 'Connection lost: ' + responseObject.errorMessage);
        elements.statusBadge.classList.replace('connected', 'disconnected');
        elements.statusText.innerText = 'Offline';
        setTimeout(connect, 5000);
    }
}

function onMessageArrived(message) {
    try {
        const data = JSON.parse(message.payloadString);
        updateUI(data);
    } catch (e) {
        log('Error', 'Invalid payload received');
    }
}

function updateUI(data) {
    // Update numeric values
    const percent = Math.min(100, Math.max(0, data.water));
    elements.levelValue.innerText = percent;
    elements.rawValue.innerText = data.raw;
    elements.lastUpdate.innerText = new Date().toLocaleTimeString();

    // Update Circle Progress
    // circumference is 2 * PI * R = 2 * 3.14 * 45 = 283
    const offset = 283 - (percent / 100) * 283;
    elements.levelCircle.style.strokeDashoffset = offset;

    // Node Status
    elements.nodeStatus.innerText = 'Online';
    elements.nodeStatus.classList.replace('offline', 'online');

    // Heartbeat logic: if no data for 15s, mark offline
    clearTimeout(offlineTimeout);
    offlineTimeout = setTimeout(() => {
        elements.nodeStatus.innerText = 'Offline';
        elements.nodeStatus.classList.replace('online', 'offline');
    }, 15000);

    log('Data', `Received: ${percent}% (Raw: ${data.raw})`);
}

function log(type, msg) {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type.toLowerCase()}`;
    entry.innerHTML = `<span style="opacity:0.5">[${new Date().toLocaleTimeString()}]</span> <strong>${type}:</strong> ${msg}`;
    elements.log.prepend(entry);

    // Keep log short
    if (elements.log.children.length > 10) {
        elements.log.removeChild(elements.log.lastChild);
    }
}

document.addEventListener('DOMContentLoaded', init);
