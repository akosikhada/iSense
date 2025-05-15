/*
 * IMPORTANT: Before uploading this code, you need to install ESP32 board support in Arduino IDE:
 * 
 * 1. Open Arduino IDE
 * 2. Go to File > Preferences
 * 3. In "Additional Boards Manager URLs" add:
 *    https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
 * 4. Click OK
 * 5. Go to Tools > Board > Boards Manager
 * 6. Search for "esp32"
 * 7. Install "ESP32 by Espressif Systems"
 * 8. Select your ESP32 board from Tools > Board > ESP32 Arduino
 */

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "FRANZ JEREMY 2.4G";
const char* password = "FRANZINE160207";

WebServer server(80);
String parkingData = "{\"slots\":4,\"status\":\"OK\",\"alignment\":\"OK\"}";// Initial JSON data with alignment

void setup() {
  Serial.begin(115200); // Communication with Arduino
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());

  // Enable CORS for web requests from deployed sites
  server.enableCORS(true);

  // API Endpoints
  server.on("/data", HTTP_GET, []() {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(200, "application/json", parkingData);
  });
  
  server.on("/", HTTP_GET, []() {
    String html = "<html><body style='font-family: Arial, sans-serif; text-align: center; margin-top: 50px;'>";
    html += "<h1>Parking System API</h1>";
    html += "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 10px;'>";
    html += "<p><strong>IP Address:</strong> " + WiFi.localIP().toString() + "</p>";
    html += "<p><strong>Available Slots:</strong> <span id='slots'>4</span></p>";
    html += "<p><strong>Alignment Status:</strong> <span id='alignment'>OK</span></p>";
    html += "<p><strong>Last Update:</strong> <span id='time'></span></p>";
    html += "<div style='margin-top: 20px; padding: 10px; background-color: #e0e0e0; border-radius: 5px;'>";
    html += "<p><strong>API Endpoint:</strong> <code>/data</code></p>";
    html += "</div>";
    html += "</div>";
    html += "<script>setInterval(fetchData,1000);";
    html += "function fetchData(){";
    html += "fetch('/data').then(r=>r.json()).then(d=>{";
    html += "document.getElementById('slots').innerText=d.slots;";
    html += "document.getElementById('alignment').innerText=d.alignment;";
    html += "document.getElementById('time').innerText=new Date().toLocaleTimeString();";
    html += "});}</script>";
    html += "</body></html>";
    server.send(200, "text/html", html);
  });
  
  server.begin();
}

void loop() {
  server.handleClient();
  
  if (Serial.available()) {
    String received = Serial.readStringUntil('\n');
    
    if (received.startsWith("SLOTS:")) {
      int slots = received.substring(6).toInt();
      
      // Parse current data
      DynamicJsonDocument doc(256);
      deserializeJson(doc, parkingData);
      
      // Update slots
      doc["slots"] = slots;
      
      // Serialize back to string
      serializeJson(doc, parkingData);
      
      Serial.println("Updated slots: " + parkingData);
    }
    else if (received.startsWith("ALIGNMENT:")) {
      String alignmentStatus = received.substring(10);
      
      // Parse current data
      DynamicJsonDocument doc(256);
      deserializeJson(doc, parkingData);
      
      // Update alignment status
      doc["alignment"] = alignmentStatus;
      
      // Serialize back to string
      serializeJson(doc, parkingData);
      
      Serial.println("Updated alignment: " + parkingData);
    }
  }
} 