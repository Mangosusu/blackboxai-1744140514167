# Bluetooth Indoor Positioning System

A React Native application that uses BLE beacons for indoor positioning using trilateration algorithm.

## Features

- Authentication system using Firebase
- BLE beacon scanning and distance calculation
- Real-time position tracking using trilateration
- Interactive floor plan display
- Beacon signal strength monitoring

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- React Native development environment
- Three BLE beacons with MAC addresses:
  - 58:06:24:08:02:f5
  - 58:06:24:08:02:f6
  - 58:06:24:08:02:f7

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bluetooth-indoor-positioning
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication (Email/Password)
   - Copy your Firebase configuration to `src/auth/AuthContext.tsx`

## Running the App

1. Start the development server:
```bash
npx expo start
```

2. Run on your device:
   - Install the Expo Go app on your device
   - Scan the QR code from the terminal
   - Or run on an emulator using the appropriate command (press 'a' for Android, 'i' for iOS)

## Beacon Setup

1. Place the three BLE beacons in known positions in your space
2. Update the beacon positions in `src/positioning/Trilateration.ts`:
```typescript
private beaconPositions: { [key: string]: Point } = {
  '58:06:24:08:02:f5': { x: 0, y: 0 },    // Beacon 1 position
  '58:06:24:08:02:f6': { x: 10, y: 0 },   // Beacon 2 position
  '58:06:24:08:02:f7': { x: 5, y: 8 }     // Beacon 3 position
};
```

## Usage

1. Launch the app and create an account or sign in
2. Grant the necessary Bluetooth and location permissions
3. Press "Start Scanning" to begin detecting beacons
4. Your position will be displayed on the floor plan when at least 3 beacons are detected
5. Monitor beacon signal strengths and distances in the list below the floor plan

## Technical Details

### Positioning Algorithm

The app uses trilateration to calculate the user's position based on the distances from three BLE beacons. The distance is calculated using the RSSI (Received Signal Strength Indicator) values from each beacon.

### Components

- `AuthContext`: Handles user authentication state and Firebase integration
- `BeaconManager`: Manages BLE scanning and beacon detection
- `Trilateration`: Implements the trilateration algorithm
- `FloorPlan`: Renders the SVG floor plan with beacon and user positions
- `PositioningScreen`: Main screen that integrates all components

### Permissions

The app requires the following permissions:
- Bluetooth
- Location (for Android)
- Background location (optional, for continuous tracking)

## Troubleshooting

1. Bluetooth Issues:
   - Ensure Bluetooth is enabled on your device
   - Check if location services are enabled (required for Android)
   - Verify the beacons are powered and broadcasting

2. Position Accuracy:
   - Ensure beacons are placed at the correct coordinates
   - Minimize obstacles between beacons and the device
   - Consider environmental factors that may affect signal strength

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
