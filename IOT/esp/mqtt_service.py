import paho.mqtt.client as mqtt
import threading
import time
import json

BROKER = "127.0.0.1"
PORT = 1883

TOPIC_WATER = "esp32/micro/water"
TOPIC_CONTROL = "esp32/micro/control"

class MQTTService:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if not cls._instance:
                cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        self.client = None
        self.water_level = 0
        self.connected = False

    def on_connect(self, client, userdata, flags, rc, properties=None):
        if rc == 0:
            self.connected = True
            print("✓ Django MQTT connected")
            client.subscribe(TOPIC_WATER)
        else:
            print("✗ MQTT connect failed", rc)

    def on_message(self, client, userdata, msg):
        if msg.topic == TOPIC_WATER:
            try:
                data = json.loads(msg.payload.decode())
                self.water_level = data.get("water", 0)
                print("Water level:", self.water_level)
            except Exception as e:
                print(f"Error decoding MQTT message: {e}")

    def start(self):
        try:
            # Paho MQTT 2.0+ requires CallbackAPIVersion
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2, client_id=f"django_{int(time.time())}")
        except AttributeError:
            # Fallback for older paho-mqtt versions
            self.client = mqtt.Client(client_id=f"django_{int(time.time())}")

        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(BROKER, PORT, 60)
        self.client.loop_start()

    def publish(self, topic, message):
        if self.connected:
            self.client.publish(topic, message)

mqtt_service = MQTTService()
