import network
from umqtt.simple import MQTTClient
from machine import Pin, ADC
import ujson
import utime

# ========= WIFI =========
SSID = "xitiz"
PASSWORD = "password123"

# ========= MQTT =========
MQTT_SERVER = "192.168.4.2"
MQTT_PORT = 1883
CLIENT_ID = "esp32_water"
WATER_TOPIC = b"esp32/micro/water"
CONTROL_TOPIC = b"esp32/micro/control"

# ========= HARDWARE =========
sensor = ADC(Pin(34))
sensor.atten(ADC.ATTN_11DB)  
relay = Pin(14, Pin.OUT)
led = Pin(2, Pin.OUT)

# ========= CALLBACK =========
def on_message(topic, msg):
    cmd = msg.decode()
    if cmd == "ON":
        relay.value(1)
    elif cmd == "OFF":
        relay.value(0)

# ========= WIFI AP SETUP =========
def setup_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid=SSID, password=PASSWORD)
    
    # Wait for AP to be active
    while not ap.active():
        utime.sleep(0.5)
        
    print("AP Active. IP Config:", ap.ifconfig())
    # Note: ESP32 AP IP is usually 192.168.4.1
    # PC should connect to this AP and will likely get 192.168.4.2
    led.value(1)

# ========= MQTT CONNECT =========
def connect_mqtt():
    client = MQTTClient(CLIENT_ID, MQTT_SERVER, MQTT_PORT)
    client.set_callback(on_message)
    
    print("Attempting MQTT connection to:", MQTT_SERVER)
    try:
        client.connect()
        client.subscribe(CONTROL_TOPIC)
        print("MQTT Connected!")
        return client
    except Exception as e:
        print("MQTT Connection failed:", e)
        return None

# ========= MAIN =========
setup_ap()

# Give PC time to connect and broker to start if needed
utime.sleep(5) 

client = None
while client is None:
    client = connect_mqtt()
    if client is None:
        utime.sleep(2)

last = 0

while True:
    client.check_msg()

    if utime.time() - last >= 2:
        raw = sensor.read()
        percent = int((raw / 4095) * 100)

        payload = ujson.dumps({
            "water": percent,
            "raw": raw
        })

        client.publish(WATER_TOPIC, payload, retain=True)
        print("Published:", payload)
        last = utime.time()

    utime.sleep(0.1)


