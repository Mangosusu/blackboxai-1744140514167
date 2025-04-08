import { Redirect } from 'expo-router';
import { useAuth } from '../src/auth/AuthContext';
import { AuthScreen } from '../src/auth/AuthScreen';

export default function Index() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/positioning" />;
  }

  return <AuthScreen />;
}
