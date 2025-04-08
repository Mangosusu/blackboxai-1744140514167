interface Point {
  x: number;
  y: number;
}

interface Circle {
  center: Point;
  radius: number;
}

export class Trilateration {
  // Known beacon positions on the floor plan (in meters)
  private beaconPositions: { [key: string]: Point } = {
    '58:06:24:08:02:f5': { x: 0, y: 0 },    // Beacon 1 position
    '58:06:24:08:02:f6': { x: 10, y: 0 },   // Beacon 2 position
    '58:06:24:08:02:f7': { x: 5, y: 8 }     // Beacon 3 position
  };

  constructor(beaconPositions?: { [key: string]: Point }) {
    if (beaconPositions) {
      this.beaconPositions = beaconPositions;
    }
  }

  private calculateIntersectionPoints(circle1: Circle, circle2: Circle): Point[] {
    const x1 = circle1.center.x;
    const y1 = circle1.center.y;
    const r1 = circle1.radius;
    const x2 = circle2.center.x;
    const y2 = circle2.center.y;
    const r2 = circle2.radius;

    const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    // Circles are too far apart or too close together
    if (d > r1 + r2 || d < Math.abs(r1 - r2)) {
      return [];
    }

    // Circles are the same
    if (d === 0 && r1 === r2) {
      return [];
    }

    const a = (Math.pow(r1, 2) - Math.pow(r2, 2) + Math.pow(d, 2)) / (2 * d);
    const h = Math.sqrt(Math.pow(r1, 2) - Math.pow(a, 2));

    const x3 = x1 + (a * (x2 - x1)) / d;
    const y3 = y1 + (a * (y2 - y1)) / d;

    const offsetX = (h * (y2 - y1)) / d;
    const offsetY = (h * (x2 - x1)) / d;

    return [
      {
        x: x3 + offsetX,
        y: y3 - offsetY
      },
      {
        x: x3 - offsetX,
        y: y3 + offsetY
      }
    ];
  }

  private findCentroid(points: Point[]): Point {
    const n = points.length;
    if (n === 0) return { x: 0, y: 0 };

    const sum = points.reduce(
      (acc, point) => ({
        x: acc.x + point.x,
        y: acc.y + point.y
      }),
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / n,
      y: sum.y / n
    };
  }

  public calculatePosition(beaconDistances: { [key: string]: number }): Point {
    const circles: Circle[] = [];

    // Create circles for each beacon
    for (const [macAddress, distance] of Object.entries(beaconDistances)) {
      const position = this.beaconPositions[macAddress];
      if (position) {
        circles.push({
          center: position,
          radius: distance
        });
      }
    }

    if (circles.length < 3) {
      throw new Error('Need at least 3 beacons for trilateration');
    }

    // Find intersection points between all pairs of circles
    const intersectionPoints: Point[] = [];
    for (let i = 0; i < circles.length - 1; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const points = this.calculateIntersectionPoints(circles[i], circles[j]);
        intersectionPoints.push(...points);
      }
    }

    if (intersectionPoints.length === 0) {
      throw new Error('No intersection points found');
    }

    // Calculate the centroid of all intersection points
    return this.findCentroid(intersectionPoints);
  }

  public getBeaconPosition(macAddress: string): Point | null {
    return this.beaconPositions[macAddress] || null;
  }

  public setBeaconPosition(macAddress: string, position: Point): void {
    this.beaconPositions[macAddress] = position;
  }

  public getAllBeaconPositions(): { [key: string]: Point } {
    return { ...this.beaconPositions };
  }
}
