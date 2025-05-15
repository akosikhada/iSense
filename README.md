# iSense Parking System

An intelligent parking system that helps monitor parking spaces and guide vehicles to align properly.

## Project Components

- **Web Interface**: User-facing application for monitoring parking
- **Arduino**: Controls hardware components (sensors, servos, LCD)
- **ESP32**: Acts as a bridge between Arduino and web interface

## Deployment Options

### Local Development
1. Connect Arduino + ESP32 to your computer
2. Upload the Arduino code (`arduino/arduino.ino`)
3. Upload the ESP32 code (`arduino/esp.ino`)
4. Open `index.html` in your browser
5. Connect using Web Serial API (Chrome/Edge only)

### Deploying to Vercel

1. Sign up or log in to [Vercel](https://vercel.com/)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel login` in your terminal
4. Navigate to your project directory
5. Run `vercel` and follow the prompts
6. Your site will be deployed to a URL like `your-project-name.vercel.app`

### Deploying to Netlify

1. Sign up or log in to [Netlify](https://www.netlify.com/)
2. Click "New site from Git"
3. Connect to your Git repository
4. Select your repository
5. Keep the default settings and click "Deploy site"
6. Your site will be deployed to a URL like `your-site-name.netlify.app`

## ESP32 Connection

For deployed websites, use the ESP32-compatible version:

1. Use `index-esp32.html` and `script-esp32.js` instead of the standard files
2. Make sure your ESP32 is connected to your WiFi network
3. Note the ESP32's IP address from the serial monitor
4. When accessing the deployed site, enter this IP address to connect

## CORS Considerations

If your deployed website can't connect to your ESP32, you may need to enable CORS on your ESP32:

```cpp
// Add these lines to the setup() function in esp.ino
server.enableCORS(true);
```

## Troubleshooting

- **Can't connect to ESP32**: Make sure your ESP32 and device are on the same network or that you've set up proper port forwarding
- **ESP32 not visible**: Check your router's DHCP settings to assign a static IP to your ESP32
- **Connection errors**: Try using an incognito/private browsing window to avoid cached issues 