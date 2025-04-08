import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Rect, Circle, Text } from 'react-native-svg';

interface Point {
  x: number;
  y: number;
}

interface FloorPlanProps {
  beaconPositions: { [key: string]: Point };
  userPosition: Point | null;
  // Scale factors to convert meters to pixels
  scaleX: number;
  scaleY: number;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({
  beaconPositions,
  userPosition,
  scaleX,
  scaleY,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = screenWidth * 0.8; // Maintain aspect ratio

  // Convert meter coordinates to screen coordinates
  const toScreenCoords = (point: Point) => ({
    x: point.x * scaleX,
    y: point.y * scaleY,
  });

  return (
    <View style={{ width: screenWidth, height: screenHeight }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${screenWidth} ${screenHeight}`}>
        {/* Floor plan background */}
        <Rect
          x="0"
          y="0"
          width={screenWidth}
          height={screenHeight}
          fill="#f0f0f0"
          stroke="#666"
          strokeWidth="2"
        />

        {/* Render beacons */}
        {Object.entries(beaconPositions).map(([macAddress, position]) => {
          const screenPos = toScreenCoords(position);
          return (
            <React.Fragment key={macAddress}>
              <Circle
                cx={screenPos.x}
                cy={screenPos.y}
                r="10"
                fill="#2563eb"
                stroke="#1d4ed8"
                strokeWidth="2"
              />
              <Text
                x={screenPos.x}
                y={screenPos.y + 25}
                fill="#1d4ed8"
                fontSize="12"
                textAnchor="middle"
              >
                {macAddress.slice(-5)}
              </Text>
            </React.Fragment>
          );
        })}

        {/* Render user position */}
        {userPosition && (
          <Circle
            cx={toScreenCoords(userPosition).x}
            cy={toScreenCoords(userPosition).y}
            r="8"
            fill="#ef4444"
            stroke="#dc2626"
            strokeWidth="2"
          />
        )}
      </Svg>
    </View>
  );
};
