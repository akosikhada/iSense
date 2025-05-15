# ESP32 Setup Instructions

## Error: WebServer.h: No such file or directory

If you're seeing this error:
```
C:\Users\QCU\Documents\GitHub\iSense\arduino\esp.ino:2:10: fatal error: WebServer.h: No such file or directory
#include <WebServer.h>
         ^~~~~~~~~~~~~
compilation terminated.
```

It means your Arduino IDE doesn't have the ESP32 board support installed. Follow these steps to fix it:

## Installing ESP32 Board Support in Arduino IDE

### Step 1: Add ESP32 Board URL
1. Open Arduino IDE
2. Go to **File > Preferences**
3. In "Additional Boards Manager URLs" add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
   - If you already have URLs in this field, separate them with commas
4. Click **OK**

### Step 2: Install ESP32 Board Package
1. Go to **Tools > Board > Boards Manager**
2. Search for "esp32"
3. Find "ESP32 by Espressif Systems" and click **Install**
4. Wait for the installation to complete (this may take a few minutes)

### Step 3: Select Your ESP32 Board
1. Go to **Tools > Board > ESP32 Arduino**
2. Select your specific ESP32 board model (commonly "ESP32 Dev Module")

### Step 4: Install Required Libraries
The ESP32 code also requires ArduinoJson library:

1. Go to **Tools > Manage Libraries**
2. Search for "ArduinoJson"
3. Install "ArduinoJson by Benoit Blanchon"

## ESP32 Connection Setup

### Hardware Connection
1. Connect ESP32 to your Arduino:
   - ESP32 TX → Arduino RX
   - ESP32 RX → Arduino TX
   - ESP32 GND → Arduino GND
   - ESP32 5V/3.3V → Arduino 5V/3.3V (depending on your ESP32 model)

### WiFi Configuration
1. Edit the WiFi credentials in the code:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```

### Upload the Code
1. Select the correct ESP32 board and port
2. Click the Upload button
3. After uploading, open Serial Monitor (set to 115200 baud)
4. Note the IP address shown on Serial Monitor

### Testing
1. Connect to the same WiFi network as your ESP32
2. Open a web browser and navigate to the IP address shown in the Serial Monitor
3. You should see the Parking System API page

## Troubleshooting

### USB Connection Issues
- Make sure you have the correct USB driver installed for your ESP32 board
- Some ESP32 boards require you to hold the BOOT button while connecting to USB
- Try a different USB cable or port

### Upload Errors
- If you get "Failed to connect to ESP32" errors:
  1. Press and hold the BOOT button on ESP32
  2. Click Upload in Arduino IDE
  3. When you see "Connecting..." release the BOOT button

### ArduinoJson Errors
- Make sure you have ArduinoJson version 6 or higher installed
- If you see errors about ArduinoJson, uninstall and reinstall the library 