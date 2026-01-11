import paho.mqtt.client as mqtt
import json
import os
import time

# MQTT Configuration
MQTT_BROKER = "broker.mqttdashboard.com"
MQTT_PORT = 1883
MQTT_TOPIC = "bbg/esp32/waterlevel"
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "latest_data.json")

def on_connect(client, userdata, flags, rc, properties=None):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        data = json.loads(payload)
        data['timestamp'] = time.time()
        
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f)
            
        print(f"Updated Data: {data}")
    except Exception as e:
        print(f"Error processing message: {e}")

def run():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    client.on_connect = on_connect
    client.on_message = on_message

    print(f"Connecting to {MQTT_BROKER}...")
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    
    client.loop_forever()

if __name__ == "__main__":
    run()
