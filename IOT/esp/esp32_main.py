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
# Water Sensor (ADC on D34)
sensor = ADC(Pin(34))
sensor.atten(ADC.ATTN_11DB)  

# LEDs
led1 = Pin(32, Pin.OUT)
led2 = Pin(33, Pin.OUT)
led3 = Pin(25, Pin.OUT)

# L298N Motor Driver
ena = Pin(14, Pin.OUT)
in1 = Pin(26, Pin.OUT)
in2 = Pin(27, Pin.OUT)

# Status LED (Optional, kept from original)
status_led = Pin(2, Pin.OUT)

# ========= CALLBACK =========
def on_message(topic, msg):
    cmd = msg.decode()
    print("Received Command:", cmd)
    if cmd == "ON":
        # Enable motor
        ena.value(1)
        in1.value(1)
        in2.value(0)
    elif cmd == "OFF":
        # Disable motor
        ena.value(0)
        in1.value(0)
        in2.value(0)

# ========= WIFI AP SETUP =========
def setup_ap():
    ap = network.WLAN(network.AP_IF)
    ap.active(True)
    ap.config(essid=SSID, password=PASSWORD)
    
    while not ap.active():
        utime.sleep(0.5)
        
    print("AP Active. IP Config:", ap.ifconfig())
    status_led.value(1)

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
utime.sleep(5) 

client = None
while client is None:
    client = connect_mqtt()
    if client is None:
        utime.sleep(2)

last = 0

while True:
    try:
        client.check_msg()
    except Exception as e:
        print("MQTT check error:", e)
        client = connect_mqtt()

    if utime.time() - last >= 2:
        raw = sensor.read()
        percent = int((raw / 4095) * 100)

        # LED Logic based on water level
        if percent < 34:
            led1.value(1)
            led2.value(0)
            led3.value(0)
        elif percent < 67:
            led1.value(1)
            led2.value(1)
            led3.value(0)
        else:
            led1.value(1)
            led2.value(1)
            led3.value(1)

        payload = ujson.dumps({
            "water": percent,
            "raw": raw
        })

        try:
            client.publish(WATER_TOPIC, payload, retain=True)
            print("Published:", payload)
        except Exception as e:
            print("Publish failed:", e)
            client = connect_mqtt()
            
        last = utime.time()

    utime.sleep(0.1)



