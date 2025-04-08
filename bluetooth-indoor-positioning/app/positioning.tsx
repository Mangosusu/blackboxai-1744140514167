import { PositioningScreen } from '../src/positioning/PositioningScreen';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';

export default function PositioningRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/" />;
  }

  return <PositioningScreen />;
}
