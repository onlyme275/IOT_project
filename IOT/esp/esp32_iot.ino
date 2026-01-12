#include <WiFi.h>
#include <PubSubClient.h>

/* WiFi */
const char* ssid = "onlyme";
const char* password = "password";

/* MQTT */
const char* mqtt_server = "broker.mqttdashboard.com";
const int mqtt_port = 1883;

const char* water_topic = "bbg/esp32/waterlevel";
const char* motor_topic = "bbg/esp32/motor";

/* Pins */
#define WATER_PIN 34

#define LED_RED    32
#define LED_BLUE   33
#define LED_YELLOW 25

#define IN1 26
#define IN2 27
#define ENA 14

WiFiClient espClient;
PubSubClient client(espClient);

bool motorState = false;
unsigned long lastPublish = 0;

/* ---------- WiFi ---------- */
void connectWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✓ WiFi connected");
}

/* ---------- MQTT ---------- */
void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting MQTT...");
    if (client.connect("esp32_water_bbg")) {
      Serial.println(" ✓ connected");
      client.subscribe(motor_topic);
    } else {
      Serial.print(" ✗ failed rc=");
      Serial.println(client.state());
      delay(2000);
    }
  }
}

/* ---------- Callback ---------- */
void callback(char* topic, byte* payload, unsigned int length) {
  payload[length] = '\0';
  String msg = String((char*)payload);

  if (String(topic) == motor_topic) {
    if (msg == "ON") {
      motorState = true;
      digitalWrite(IN1, HIGH);
      digitalWrite(IN2, LOW);
      analogWrite(ENA, 200);   // motor speed
      Serial.println("Motor ON");
    } else {
      motorState = false;
      analogWrite(ENA, 0);
      Serial.println("Motor OFF");
    }
  }
}

/* ---------- Setup ---------- */
void setup() {
  Serial.begin(115200);

  pinMode(WATER_PIN, INPUT);

  pinMode(LED_RED, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);

  connectWiFi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

/* ---------- Loop ---------- */
void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  if (millis() - lastPublish > 2000) {
    int raw = analogRead(WATER_PIN);     // 0–4095
    int level = map(raw, 0, 4095, 0, 100);

    /* LED sequence */
    digitalWrite(LED_RED, level > 20);
    digitalWrite(LED_BLUE, level > 50);
    digitalWrite(LED_YELLOW, level > 80);

    char payload[80];
    snprintf(payload, sizeof(payload),
             "{\"water\":%d,\"raw\":%d}", level, raw);

    client.publish(water_topic, payload);

    Serial.print("Water Level → ");
    Serial.println(payload);

    lastPublish = millis();
  }
}
