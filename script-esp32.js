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

// Connection variables
let isConnected = false;
let espIpAddress = '';
let dataPollingInterval;

// Parking state
let occupiedSlots = [];
let availableSlotsCount = 4;
let notificationVisible = false;

// Event Listeners
connectBtn.addEventListener('click', toggleConnection);
notificationClose.addEventListener('click', hideNotification);

// Connect/disconnect from ESP32
async function toggleConnection() {
    if (isConnected) {
        disconnectFromESP();
    } else {
        connectToESP();
    }
}

// Connect to ESP32
function connectToESP() {
    // Show IP address input prompt
    espIpAddress = prompt('Enter your ESP32 IP address:', espIpAddress || '');
    
    if (!espIpAddress) {
        alert('IP address is required to connect.');
        return;
    }
    
    // Validate IP address format (basic check)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(espIpAddress)) {
        alert('Invalid IP address format. Please use format: xxx.xxx.xxx.xxx');
        return;
    }

    // Test connection
    fetch(`http://${espIpAddress}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to connect to ESP32');
            }
            return response.json();
        })
        .then(data => {
            // Update UI
            isConnected = true;
            connectBtn.textContent = 'Disconnect';
            connectionStatus.textContent = 'Connected';
            connectionStatus.classList.add('connected');
            
            // Initialize the display with received data
            updateDataDisplay(data);
            
            // Start polling for updates
            dataPollingInterval = setInterval(pollESPData, 1000);
        })
        .catch(error => {
            console.error('Error connecting to ESP32:', error);
            alert(`Failed to connect to ESP32 at ${espIpAddress}. Make sure it is powered on and connected to WiFi.`);
        });
}

// Disconnect from ESP32
function disconnectFromESP() {
    clearInterval(dataPollingInterval);
    
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
    
    // Hide notification if visible
    if (notificationVisible) {
        hideNotification();
    }
}

// Poll for data updates from ESP32
function pollESPData() {
    if (!isConnected) return;
    
    fetch(`http://${espIpAddress}/data`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Connection lost');
            }
            return response.json();
        })
        .then(data => {
            updateDataDisplay(data);
        })
        .catch(error => {
            console.error('Error polling ESP32:', error);
            disconnectFromESP();
            alert('Connection to ESP32 was lost. Please reconnect.');
        });
}

// Update all displays with ESP32 data
function updateDataDisplay(data) {
    // Update slots
    if (data.slots !== undefined && availableSlotsCount !== data.slots) {
        updateSlots(data.slots);
    }
    
    // Update alignment
    if (data.alignment !== undefined) {
        updateAlignment(data.alignment);
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
        
        // Update parking visualization
        updateParkingVisualization(availableSlots);
    }
}

// Update the visual representation of parking spaces based on available slots
function updateParkingVisualization(availableSlots) {
    // Clear all spaces first
    parkingSpaces.forEach(space => {
        space.classList.remove('occupied');
    });
    
    // Mark spaces as occupied based on available slots
    // For simplicity, we'll fill from highest slot number to lowest
    const occupiedCount = 4 - availableSlots;
    for (let i = 0; i < occupiedCount; i++) {
        const spaceIndex = 3 - i; // Start from last space (index 3 for space 4)
        if (spaceIndex >= 0 && spaceIndex < parkingSpaces.length) {
            parkingSpaces[spaceIndex].classList.add('occupied');
        }
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