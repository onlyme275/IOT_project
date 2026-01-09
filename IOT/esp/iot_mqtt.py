import paho.mqtt.client as mqtt
import socket
import time
import ssl

# Local Mosquitto Configuration
BROKER = "127.0.0.1"
PORT = 1883
TOPIC = "esp32/micro/control"

def publish_message(message):
    """
    Publish a message to the local Mosquitto broker
    """
    client = None
    connected = {'status': False}
    
    def on_connect(client, userdata, flags, rc, properties=None):
        rc_value = rc if isinstance(rc, int) else (rc.value if hasattr(rc, 'value') else str(rc))
        if rc_value == 0 or str(rc) == "Success":
            connected['status'] = True
            print(f"✓ Connected to local broker at {BROKER}")
        else:
            print(f"✗ Connection failed with code {rc_value} ({rc})")
    
    try:
        # Create MQTT client
        try:
            client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        except AttributeError:
            client = mqtt.Client()
        
        client.on_connect = on_connect
        
        # Connect to local broker (no TLS/Auth for local mosquitto)
        print(f"Connecting to {BROKER}:{PORT}...")
        client.connect(BROKER, PORT, keepalive=60)
        
        # Start network loop
        client.loop_start()
        
        # Wait for connection (up to 3 seconds for local)
        wait_time = 0
        while not connected['status'] and wait_time < 3:
            time.sleep(0.1)
            wait_time += 0.1
        
        if not connected['status']:
            print("✗ Failed to connect to local broker")
            return False
        
        # Publish
        print(f"Publishing to {TOPIC}: {message}")
        result = client.publish(TOPIC, message, qos=1)
        result.wait_for_publish(timeout=3)
        
        success = result.is_published()
        if success:
            print(f"✓ Message Published")
        
        client.loop_stop()
        client.disconnect()
        return success
        
    except Exception as e:
        print(f"✗ Publish error: {e}")
        return False
    finally:
        if client:
            try:
                client.loop_stop()
                client.disconnect()
            except:
                pass
