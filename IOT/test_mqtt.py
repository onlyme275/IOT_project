import paho.mqtt.client as mqtt
import ssl
import time

# Local Mosquitto Configuration
BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "esp32/micro/control"

connected = False

def on_connect(client, userdata, flags, rc, properties=None):
    global connected
    print(f"Connection callback: rc={rc}")
    if rc == 0:
        connected = True
        print("✓ Successfully connected!")
    else:
        print(f"✗ Connection failed with code {rc}")
        error_messages = {
            1: "Connection refused - incorrect protocol version",
            2: "Connection refused - invalid client identifier",
            3: "Connection refused - server unavailable",
            4: "Connection refused - bad username or password",
            5: "Connection refused - not authorized"
        }
        print(f"  Reason: {error_messages.get(rc, 'Unknown error')}")

def on_disconnect(client, userdata, flags, rc, properties=None):
    print(f"Disconnected with code {rc}")

def on_publish(client, userdata, mid, reason_codes=None, properties=None):
    print(f"Message {mid} published")

print("Creating MQTT client...")
try:
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
except AttributeError:
    client = mqtt.Client()

client.on_connect = on_connect
client.on_disconnect = on_disconnect
client.on_publish = on_publish

print(f"Connecting to {BROKER}:{PORT} (Local Mosquitto)...")
try:
    # Connect directly (no credentials/TLS)
    client.connect(BROKER, PORT, keepalive=60)
    
    print("Starting loop...")
    client.loop_start()
    
    # Wait for connection
    print("Waiting for connection...")
    wait_time = 0
    while not connected and wait_time < 10:
        time.sleep(0.5)
        wait_time += 0.5
        print(f"  Waiting... {wait_time}s")
    
    if connected:
        print("\n✓ Connection successful!")
        print("Publishing test message...")
        result = client.publish(TOPIC, "TEST", qos=1)
        result.wait_for_publish(timeout=5)
        print("✓ Message published!")
    else:
        print("\n✗ Connection timeout!")
    
    time.sleep(1)
    client.loop_stop()
    client.disconnect()
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
