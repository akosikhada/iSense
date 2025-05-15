// DOM Elements
const connectBtn = document.getElementById('connect-btn');
const connectionStatus = document.getElementById('connection-status');
const slotCount = document.getElementById('slot-count');
const alignmentStatus = document.getElementById('alignment-status');
const parkingSpaces = document.querySelectorAll('.parking-space');
const notification = document.getElementById('notification');
const notificationTitle = document.getElementById('notification-title');
const notificationMessage = document.getElementById('notification-message');
const notificationClose = document.getElementById('notification-close');

// Serial port variables
let port;
let reader;
let writer;
let isConnected = false;
let readBuffer = '';

// Parking state
let occupiedSlots = [];
let availableSlotsCount = 4;
let notificationVisible = false;

// Event Listeners
connectBtn.addEventListener('click', toggleConnection);
notificationClose.addEventListener('click', hideNotification);

// Connect/disconnect from serial port
async function toggleConnection() {
    if (isConnected) {
        await disconnectFromSerial();
    } else {
        await connectToSerial();
    }
}

// Connect to serial port
async function connectToSerial() {
    try {
        // Request port access
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 115200 });
        
        // Set up reading and writing
        reader = port.readable.getReader();
        writer = port.writable.getWriter();
        
        // Update UI
        isConnected = true;
        connectBtn.textContent = 'Disconnect';
        connectionStatus.textContent = 'Connected';
        connectionStatus.classList.add('connected');
        
        // Initialize the display
        slotCount.textContent = availableSlotsCount;
        
        // Start reading data
        readSerialData();
        
    } catch (error) {
        console.error('Error connecting to serial port:', error);
        alert('Failed to connect to the Arduino. Make sure it is connected and try again.');
    }
}

// Disconnect from serial port
async function disconnectFromSerial() {
    if (reader) {
        await reader.cancel();
        reader.releaseLock();
    }
    
    if (writer) {
        writer.releaseLock();
    }
    
    if (port) {
        await port.close();
    }
    
    // Update UI
    isConnected = false;
    connectBtn.textContent = 'Connect Device';
    connectionStatus.textContent = 'Disconnected';
    connectionStatus.classList.remove('connected');
    slotCount.textContent = '--';
    alignmentStatus.textContent = 'Not Connected';
    alignmentStatus.className = 'alignment-display';
    
    // Reset parking spaces
    parkingSpaces.forEach(space => {
        space.classList.remove('occupied');
    });
    
    // Reset state
    occupiedSlots = [];
    availableSlotsCount = 4;
    readBuffer = '';
    
    // Hide notification if visible
    if (notificationVisible) {
        hideNotification();
    }
}

// Read data from serial port with immediate processing for alignment data
async function readSerialData() {
    const textDecoder = new TextDecoder();
    
    while (isConnected) {
        try {
            const { value, done } = await reader.read();
            
            if (done) {
                break;
            }
            
            // Process the received data immediately
            const chunk = textDecoder.decode(value);
            
            // High-priority processing for alignment data
            const alignmentMatch = chunk.match(/ALIGNMENT:([A-Z_]+)/);
            if (alignmentMatch) {
                updateAlignment(alignmentMatch[1]);
            }
            
            // Add to buffer for other data processing
            readBuffer += chunk;
            
            // Process complete lines
            const lines = readBuffer.split('\n');
            readBuffer = lines.pop() || '';
            
            // Process non-alignment data
            processNonAlignmentData(lines);
            
        } catch (error) {
            console.error('Error reading from serial port:', error);
            break;
        }
    }
    
    if (isConnected) {
        await disconnectFromSerial();
    }
}

// Process non-alignment data lines
function processNonAlignmentData(lines) {
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        // Skip alignment data (already processed)
        if (line.startsWith('ALIGNMENT:')) continue;
        
        // Process other data types
        if (line.startsWith('SLOTS:')) {
            const slots = parseInt(line.substring(6).trim(), 10);
            updateSlots(slots);
        }
        else if (line.startsWith('OCCUPIED:')) {
            const slotNumber = parseInt(line.substring(9).trim(), 10);
            markSlotOccupied(slotNumber);
        }
        else if (line.startsWith('RELEASED:')) {
            const slotNumber = parseInt(line.substring(9).trim(), 10);
            markSlotReleased(slotNumber);
        }
    }
}

// Update slots display
function updateSlots(availableSlots) {
    // Update only if count changed
    if (availableSlotsCount !== availableSlots) {
        const previousCount = availableSlotsCount;
        availableSlotsCount = availableSlots;
        slotCount.textContent = availableSlots;
        
        // Add visual feedback with animation
        slotCount.classList.add('updated');
        setTimeout(() => {
            slotCount.classList.remove('updated');
        }, 500);
        
        // If a car entered, mark slot 2 as occupied
        if (availableSlots < 4 && !occupiedSlots.includes(2)) {
            markSlotOccupied(2);
        }
        
        // If all slots are available, clear occupied slots
        if (availableSlots === 4) {
            occupiedSlots = [];
            updateParkingSpacesVisual();
            
            // If notification was showing "full" message, hide it
            if (notificationVisible) {
                hideNotification();
            }
        }
        
        // Check if parking is now full (0 available slots)
        if (availableSlots === 0 && previousCount > 0) {
            showParkingFullNotification();
        }
    }
}

// Show notification when parking is full
function showParkingFullNotification() {
    notification.classList.remove('success');
    notification.classList.add('warning');
    notificationTitle.textContent = 'Parking Status';
    notificationMessage.textContent = 'We apologize for the inconvenience. All parking slots are currently occupied. Please wait for an available slot or try an alternative parking location.';
    
    notification.classList.remove('hidden');
    notificationVisible = true;
}

// Hide notification
function hideNotification() {
    notification.classList.add('closing');
    
    // After animation completes, hide the notification
    setTimeout(() => {
        notification.classList.add('hidden');
        notification.classList.remove('closing');
        notificationVisible = false;
    }, 300);
}

// Mark a specific slot as occupied
function markSlotOccupied(slotNumber) {
    if (!occupiedSlots.includes(slotNumber)) {
        occupiedSlots.push(slotNumber);
        updateParkingSpacesVisual();
        
        // Check if this makes the parking full
        if (occupiedSlots.length === 4 && availableSlotsCount === 0) {
            showParkingFullNotification();
        }
    }
}

// Mark a specific slot as released
function markSlotReleased(slotNumber) {
    const index = occupiedSlots.indexOf(slotNumber);
    if (index !== -1) {
        occupiedSlots.splice(index, 1);
        updateParkingSpacesVisual();
    }
}

// Update the visual representation of parking spaces
function updateParkingSpacesVisual() {
    // Clear all spaces first
    parkingSpaces.forEach(space => {
        space.classList.remove('occupied');
    });
    
    // Mark occupied spaces
    occupiedSlots.forEach(slotNumber => {
        // Adjust for zero-based indexing (slot 1 is at index 0)
        const spaceIndex = slotNumber - 1;
        if (spaceIndex >= 0 && spaceIndex < parkingSpaces.length) {
            parkingSpaces[spaceIndex].classList.add('occupied');
        }
    });
}

// Update alignment display with priority rendering
function updateAlignment(status) {
    // Get display text for the status
    const displayText = getAlignmentDisplayText(status);
    
    // Update DOM directly (more efficient than multiple operations)
    alignmentStatus.className = 'alignment-display';
    
    // Set the new text content
    alignmentStatus.textContent = displayText;
    
    // Set appropriate class
    switch (status) {
        case 'OK':
            alignmentStatus.classList.add('ok');
            break;
        case 'MOVE_LEFT':
        case 'MOVE_RIGHT':
        case 'OVER_THE_LANE':
            alignmentStatus.classList.add('warning');
            break;
    }
}

// Helper function to get display text for alignment status
function getAlignmentDisplayText(status) {
    switch (status) {
        case 'OK': return 'Properly Aligned';
        case 'MOVE_LEFT': return 'Move Left';
        case 'MOVE_RIGHT': return 'Move Right';
        case 'OVER_THE_LANE': return 'Over The Lane';
        case 'NOT_OCCUPIED': return 'Not Yet Occupied';
        default: return status;
    }
}
