import { BleManager, Device, State } from 'react-native-ble-plx';
import { Platform, PermissionsAndroid } from 'react-native';

export interface Beacon {
  id: string;
  rssi: number;
  distance: number;
  macAddress: string;
}

export class BeaconManager {
  private manager: BleManager;
  private beacons: Map<string, Beacon>;
  private knownBeacons: Set<string>;
  private onBeaconUpdate: (beacons: Beacon[]) => void;

  constructor(onBeaconUpdate: (beacons: Beacon[]) => void) {
    this.manager = new BleManager();
    this.beacons = new Map();
    this.onBeaconUpdate = onBeaconUpdate;
    // MAC addresses of our three beacons
    this.knownBeacons = new Set([
      '58:06:24:08:02:f5',
      '58:06:24:08:02:f6',
      '58:06:24:08:02:f7'
    ]);
  }

  private calculateDistance(rssi: number): number {
    // Using the Log-distance path loss model
    // RSSI = -10n * log10(d) + A
    // where:
    // n is the path loss exponent (typically 2-4)
    // d is the distance in meters
    // A is the RSSI at 1 meter distance (typically around -59 dBm)
    const n = 2.5; // Path loss exponent
    const A = -59; // RSSI at 1 meter

    return Math.pow(10, (A - rssi) / (10 * n));
  }

  private handleDeviceDiscovery = (device: Device) => {
    if (!device.id || !this.knownBeacons.has(device.id)) return;

    const rssi = device.rssi ?? -100;
    const distance = this.calculateDistance(rssi);

    const beacon: Beacon = {
      id: device.id,
      rssi: rssi,
      distance: distance,
      macAddress: device.id
    };

    this.beacons.set(device.id, beacon);
    this.onBeaconUpdate(Array.from(this.beacons.values()));
  };

  public async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      return true;
    }

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires location permission',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return true;
  }

  public async startScanning(): Promise<void> {
    try {
      const state = await this.manager.state();
      
      if (state !== State.PoweredOn) {
        throw new Error('Bluetooth is not powered on');
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      this.manager.startDeviceScan(
        null,
        { allowDuplicates: true },
        (error, device) => {
          if (error) {
            console.error('Scanning error:', error);
            return;
          }
          if (device) {
            this.handleDeviceDiscovery(device);
          }
        }
      );
    } catch (error) {
      console.error('Error starting scan:', error);
      throw error;
    }
  }

  public stopScanning(): void {
    this.manager.stopDeviceScan();
    this.beacons.clear();
    this.onBeaconUpdate([]);
  }

  public destroy(): void {
    this.stopScanning();
    this.manager.destroy();
  }
}
