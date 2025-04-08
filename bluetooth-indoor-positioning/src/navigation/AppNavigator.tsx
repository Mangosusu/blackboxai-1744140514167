import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen } from '../auth/AuthScreen';
import { PositioningScreen } from '../positioning/PositioningScreen';
import { useAuth } from '../auth/AuthContext';
import { ActivityIndicator, View } from 'react-native';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#2563eb" />
  </View>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#fff' }
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen}
            options={{ animationTypeForReplace: !user ? 'pop' : 'push' }}
          />
        ) : (
          <Stack.Screen 
            name="Main" 
            component={PositioningScreen}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
