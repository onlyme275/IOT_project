import network
from umqtt.simple import MQTTClient
from time import sleep
from machine import Pin
import ujson

SSID = 'xitiz'
PASSWORD = 'password123'

MQTT_SERVER = "192.168.100.229"
MQTT_PORT = 1883
MQTT_TOPIC = 'esp32/micro/control'  
MQTT_CLIENT_ID = 'esp32_xitiz'

control_pin = Pin(14, Pin.OUT)
control_pin.value(0) 

led = Pin(2, Pin.OUT)

def sub_cb(topic, msg):
    print((topic, msg))
    try:
        command = msg.decode()
        if command == "ON":
            control_pin.value(1)
            print("Device turned ON")
        elif command == "OFF":
            control_pin.value(0)
            print("Device turned OFF")
    except Exception as e:
        print(f"Error processing message: {e}")

def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('Connecting to network...')
        wlan.connect(SSID, PASSWORD)
        while not wlan.isconnected():
            led.value(not led.value()) 
            sleep(0.5)
            pass
    print('Network config:', wlan.ifconfig())
    led.value(1)

def connect_mqtt():
    global client
    try:
        if not network.WLAN(network.STA_IF).isconnected():
            print("Wi-Fi not connected! Waiting for Wi-Fi...")
            connect_wifi()
            
        print(f"Connecting to local MQTT broker: {MQTT_SERVER}:{MQTT_PORT}...")
        # Create plain MQTT client for local Mosquitto
        client = MQTTClient(
            client_id=MQTT_CLIENT_ID,
            server=MQTT_SERVER,
            port=MQTT_PORT
        )
        client.set_callback(sub_cb)
        client.connect()
        client.subscribe(MQTT_TOPIC)
        print(f'✓ Connected to Local Mosquitto!')
        print(f'✓ Subscribed to topic: {MQTT_TOPIC}')
    except Exception as e:
        print(f"✗ MQTT Connection failed: {e}")
        raise e

def restart():
    print('Failed to connect. Restarting...')
    sleep(5)
    machine.reset()

try:
    connect_wifi()
    connect_mqtt()
except Exception as e:
    print(f"Connection error: {e}")
    restart()

while True:
    try:
        client.check_msg()
        sleep(0.1) 
    except Exception as e:
        print(f"Loop error: {e}")
        try:
            connect_mqtt()
        except:
            pass
        sleep(2)

