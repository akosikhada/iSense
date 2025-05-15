#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);  

Servo servoEntry;  
Servo servoExit;  

// IR Sensor Pins
int IR1 = 2;  // Entry Gate
int IR2 = 3;  // Exit Gate
int IR3 = 11; // Alignment Left Sensor
int IR4 = 12; // Alignment Right Sensor
int buzzer = 8;  

// Parking variables
int Slot = 4;      
int maxSlot = 4;  

// Alignment variables
String currentAlignmentStatus = "OK";
String previousAlignmentStatus = "";  // Different initial value to force first update
unsigned long lastAlignmentUpdate = 0;
const unsigned long ALIGNMENT_UPDATE_INTERVAL = 50; // Much faster alignment checks

// Slot variables
int previousSlotCount = 4;
unsigned long lastSlotUpdate = 0;
const unsigned long SLOT_UPDATE_INTERVAL = 500;

// Track if slot 2 is occupied
bool slot2Occupied = false;

// Buzzer variables for non-blocking operation
unsigned long buzzerStartTime = 0;
unsigned long buzzerDuration = 0;
bool buzzerActive = false;

// LCD update variables for non-blocking operation
unsigned long lcdUpdateTime = 0;
bool lcdUpdateNeeded = false;
String lcdLine1 = "";
String lcdLine2 = "";

bool firstCarEntered = false;

const unsigned long CAR_MIN_DURATION = 1500; // Reduced for faster response
const unsigned long OBJECT_MAX_DURATION = 1000;
const unsigned long DEBOUNCE_DELAY = 50; // Shorter debounce for faster response

void playStartupMelody() {
  int melody[] = { 1000, 1200, 1400, 1600, 1800, 2000, 1800, 1600, 1400, 1200, 1000 };
  int noteDuration = 100; // Faster melody

  for (int i = 0; i < 11; i++) {
    tone(buzzer, melody[i]);
    delay(noteDuration);
  }
  noTone(buzzer);           
}

bool isCarDetected(int sensorPin) {
  unsigned long startTime = millis();

  while (digitalRead(sensorPin) == LOW) {
    if (millis() - startTime >= CAR_MIN_DURATION) {
      return true;
    }
    delay(10);
  }
  return false;
}

void startBuzzer(unsigned long duration) {
  digitalWrite(buzzer, HIGH);
  buzzerActive = true;
  buzzerStartTime = millis();
  buzzerDuration = duration;
}

void checkBuzzer() {
  if (buzzerActive && (millis() - buzzerStartTime >= buzzerDuration)) {
    digitalWrite(buzzer, LOW);
    buzzerActive = false;
  }
}

void updateLCD(String line1, String line2) {
  lcdLine1 = line1;
  lcdLine2 = line2;
  lcdUpdateNeeded = true;
  lcdUpdateTime = millis();
}

void checkLCD() {
  if (lcdUpdateNeeded) {
    lcd.clear(); // Clear the entire display first
    lcd.setCursor(0, 0);
    lcd.print(lcdLine1);
    lcd.setCursor(0, 1);
    lcd.print(lcdLine2);
    lcdUpdateNeeded = false;
  }
}

void setup() {
  Serial.begin(115200);
 
  lcd.init();
  lcd.backlight();

  pinMode(IR1, INPUT);
  pinMode(IR2, INPUT);
  pinMode(IR3, INPUT);
  pinMode(IR4, INPUT);
  pinMode(buzzer, OUTPUT);

  servoEntry.attach(5);  
  servoExit.attach(6);  
 
  servoEntry.write(100); 
  servoExit.write(100);   

  lcd.setCursor(0, 0);
  lcd.print("   INTELLIGENT    ");
  lcd.setCursor(0, 1);
  lcd.print(" PARKING SYSTEM ");

  playStartupMelody();  

  delay(1000); // Shorter startup delay
  lcd.clear();
  
  // Send initial status immediately
  Serial.println("SLOTS:4");
  Serial.println("ALIGNMENT:OK");
  Serial.flush(); // Ensure data is sent
}

void checkAlignment() {
  // Read sensor states once to avoid inconsistencies
  bool leftSensor = digitalRead(IR3);
  bool rightSensor = digitalRead(IR4);
  
  // Determine alignment status
  if (leftSensor == HIGH && rightSensor == HIGH) {
    currentAlignmentStatus = "OK";
  }
  else if (leftSensor == LOW && rightSensor == LOW) {
    if (Slot == 4) {
      currentAlignmentStatus = "NOT_OCCUPIED";
    } else if (Slot == 0) {
      currentAlignmentStatus = "OVER_THE_LANE";
    } else {
      currentAlignmentStatus = "OVER_THE_LANE";
    }
  }
  else if (leftSensor == LOW && rightSensor == HIGH) {
    currentAlignmentStatus = "MOVE_LEFT";
  }
  else if (leftSensor == HIGH && rightSensor == LOW) {
    currentAlignmentStatus = "MOVE_RIGHT";
  }

  // Always send alignment status (removed status change check)
  Serial.print("ALIGNMENT:");
  Serial.println(currentAlignmentStatus);
  Serial.flush(); // Ensure data is sent
  
  // Visual feedback for misalignment (now non-blocking)
  if (currentAlignmentStatus != "OK" && currentAlignmentStatus != "NOT_OCCUPIED" && !buzzerActive) {
    startBuzzer(200); // Short beep
    
    if (currentAlignmentStatus == "OVER_THE_LANE") {
      updateLCD("    WARNING!   ", " OVER THE LANE! ");
    }
    else if (currentAlignmentStatus == "MOVE_LEFT") {
      updateLCD("   WARNING!   ", " MOVE LEFT! ");
    }
    else if (currentAlignmentStatus == "MOVE_RIGHT") {
      updateLCD("   WARNING!   ", " MOVE RIGHT! ");
    }
  } 
  else if (currentAlignmentStatus == "OK" && previousAlignmentStatus != "OK") {
    // Clear warnings when alignment is back to OK
    // Add spaces after the slot number to clear any remaining characters
    String slotDisplay = "  Slot Left: " + String(Slot) + "     ";
    updateLCD("    WELCOME!    ", slotDisplay);
  }
  
  previousAlignmentStatus = currentAlignmentStatus;
}

void loop() {
  // Non-blocking control
  checkBuzzer();
  checkLCD();
  
  // Continuous alignment checks (almost every loop cycle)
  if (millis() - lastAlignmentUpdate >= ALIGNMENT_UPDATE_INTERVAL) {
    checkAlignment();
    lastAlignmentUpdate = millis();
  }

  // Check for wrong direction
  if (Slot == 4 && digitalRead(IR2) == LOW) {  
    updateLCD("   WRONG TURN!  ", " Use Entry Gate");
    startBuzzer(1000);
  }

  // Entry gate logic
  if (digitalRead(IR1) == LOW) {
    delay(DEBOUNCE_DELAY);
    if (digitalRead(IR1) == LOW) {  
      if (Slot > 0) {
        firstCarEntered = true;
        servoEntry.write(0);  // Open entry gate
        Slot--;

        // Mark slot 2 as occupied
        if (!slot2Occupied) {
          slot2Occupied = true;
          Serial.println("OCCUPIED:2");
          Serial.flush();
        }

        // Send updated slot count immediately
        Serial.print("SLOTS:");
        Serial.println(Slot);
        Serial.flush();

        delay(2000);  // Wait for car to pass
        servoEntry.write(100);  // Close entry gate
        
        // Add spaces after the slot number to clear any remaining characters
        String slotDisplay = "  Slot Left: " + String(Slot) + "     ";
        updateLCD("    WELCOME!    ", slotDisplay);
      } else {
        updateLCD("PARKING IS FULL!", "  No Space Left  ");
        startBuzzer(1000);
      }
    }
  }

  // Exit gate logic
  if (digitalRead(IR2) == LOW) {
    delay(DEBOUNCE_DELAY);
    if (digitalRead(IR2) == LOW) {
      servoExit.write(0);  // Open exit gate
      delay(2000); // Wait for car to pass
      servoExit.write(100); // Close exit gate

      if (Slot < maxSlot) {
        Slot++;
        
        // Release slot 2 when a car exits
        if (slot2Occupied && Slot == 4) {
          slot2Occupied = false;
          Serial.println("RELEASED:2");
          Serial.flush();
        }
        
        // Send updated slot count immediately
        Serial.print("SLOTS:");
        Serial.println(Slot);
        Serial.flush();
      }
      
      // Add spaces after the slot number to clear any remaining characters
      String slotDisplay = "  Slot Left: " + String(Slot) + "     ";
      updateLCD("    WELCOME!    ", slotDisplay);
    }
  }

  // Update default LCD display periodically (if no warnings active)
  if (!lcdUpdateNeeded && millis() % 1000 == 0) {
    // Method 1: Use lcd.clear() for complete refresh
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("    WELCOME!    ");
    lcd.setCursor(0, 1);
    lcd.print("  Slot Left: ");
    lcd.print(Slot);
    
    /* 
    // Method 2: Alternatively you can use this approach
    lcd.setCursor(0, 0);
    lcd.print("    WELCOME!    ");
    lcd.setCursor(0, 1);
    // Add spaces after the slot number to clear any remaining characters
    String slotDisplay = "  Slot Left: " + String(Slot) + "     ";
    lcd.print(slotDisplay);
    */
  }

  // Send slot updates at regular intervals or when changed
  if ((millis() - lastSlotUpdate >= SLOT_UPDATE_INTERVAL) || (previousSlotCount != Slot)) {
    previousSlotCount = Slot;
    Serial.print("SLOTS:");
    Serial.println(Slot);
    Serial.flush();
    lastSlotUpdate = millis();
  }

  delay(10); // Minimal loop delay for faster response
} 