import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { BeaconManager, Beacon } from './BeaconManager';
import { Trilateration } from './Trilateration';
import { FloorPlan } from '../components/FloorPlan';
import { useAuth } from '../auth/AuthContext';

interface Point {
  x: number;
  y: number;
}

export const PositioningScreen = () => {
  const [beaconManager, setBeaconManager] = useState<BeaconManager | null>(null);
  const [trilateration] = useState(() => new Trilateration());
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [userPosition, setUserPosition] = useState<Point | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { logout } = useAuth();

  // Scale factors for converting meters to pixels (adjust based on your floor plan)
  const scaleX = 30; // pixels per meter
  const scaleY = 30; // pixels per meter

  const handleBeaconUpdate = useCallback((updatedBeacons: Beacon[]) => {
    setBeacons(updatedBeacons);

    if (updatedBeacons.length >= 3) {
      try {
        const distances = updatedBeacons.reduce((acc, beacon) => ({
          ...acc,
          [beacon.macAddress]: beacon.distance
        }), {});

        const position = trilateration.calculatePosition(distances);
        setUserPosition(position);
      } catch (error) {
        console.error('Position calculation error:', error);
      }
    }
  }, [trilateration]);

  useEffect(() => {
    const manager = new BeaconManager(handleBeaconUpdate);
    setBeaconManager(manager);

    return () => {
      if (manager) {
        manager.destroy();
      }
    };
  }, [handleBeaconUpdate]);

  const toggleScanning = async () => {
    if (!beaconManager) return;

    try {
      if (isScanning) {
        beaconManager.stopScanning();
        setIsScanning(false);
      } else {
        await beaconManager.startScanning();
        setIsScanning(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Indoor Positioning</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FloorPlan
          beaconPositions={trilateration.getAllBeaconPositions()}
          userPosition={userPosition}
          scaleX={scaleX}
          scaleY={scaleY}
        />

        <TouchableOpacity
          style={[
            styles.scanButton,
            isScanning ? styles.scanningButton : null
          ]}
          onPress={toggleScanning}
        >
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Stop Scanning' : 'Start Scanning'}
          </Text>
        </TouchableOpacity>

        <View style={styles.beaconList}>
          <Text style={styles.beaconListTitle}>Detected Beacons</Text>
          {beacons.map((beacon) => (
            <View key={beacon.macAddress} style={styles.beaconItem}>
              <Text style={styles.beaconId}>ID: {beacon.macAddress.slice(-5)}</Text>
              <Text style={styles.beaconDetails}>
                RSSI: {beacon.rssi} dBm | Distance: {beacon.distance.toFixed(2)}m
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  scanButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  scanningButton: {
    backgroundColor: '#dc2626',
  },
  scanButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  beaconList: {
    marginTop: 16,
  },
  beaconListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  beaconItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  beaconId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  beaconDetails: {
    fontSize: 14,
    color: '#64748b',
  },
});
