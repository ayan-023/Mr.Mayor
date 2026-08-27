/**
 * Spatial Analysis Utilities for GIS & Geofencing
 */

import { LatLng } from '../src/types/index.js';

const EARTH_RADIUS_METERS = 6371000;

/**
 * Calculates Great-Circle distance between two coordinates in meters (Haversine)
 */
export function calculateDistanceMeters(p1: LatLng, p2: LatLng): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Total length of a polyline in meters
 */
export function calculatePolylineLengthMeters(points: LatLng[]): number {
  if (!points || points.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += calculateDistanceMeters(points[i], points[i + 1]);
  }
  return total;
}

/**
 * Calculates minimum distance from a point to a line segment in meters
 */
export function pointToSegmentDistanceMeters(p: LatLng, v: LatLng, w: LatLng): number {
  const l2 = (w.lat - v.lat) ** 2 + (w.lng - v.lng) ** 2;
  if (l2 === 0) return calculateDistanceMeters(p, v);
  
  // Projection factor t
  let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2;
  t = Math.max(0, Math.min(1, t));
  
  const projection: LatLng = {
    lat: v.lat + t * (w.lat - v.lat),
    lng: v.lng + t * (w.lng - v.lng),
  };
  
  return calculateDistanceMeters(p, projection);
}

/**
 * Minimum distance between a point and a polyline in meters
 */
export function pointToPolylineDistanceMeters(p: LatLng, polyline: LatLng[]): number {
  if (!polyline || polyline.length === 0) return Infinity;
  if (polyline.length === 1) return calculateDistanceMeters(p, polyline[0]);
  
  let minDistance = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const dist = pointToSegmentDistanceMeters(p, polyline[i], polyline[i + 1]);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
}

/**
 * Calculates the overlap distance (in meters) and overlap percentage between two polylines
 */
export function calculatePolylineOverlap(
  poly1: LatLng[],
  poly2: LatLng[],
  proximityThresholdMeters: number = 30
): { overlapMeters: number; overlapPercentage: number; minDistanceMeters: number } {
  if (!poly1 || !poly2 || poly1.length === 0 || poly2.length === 0) {
    return { overlapMeters: 0, overlapPercentage: 0, minDistanceMeters: Infinity };
  }

  const length1 = calculatePolylineLengthMeters(poly1);
  const length2 = calculatePolylineLengthMeters(poly2);
  const baseLength = Math.max(1, Math.min(length1, length2));

  let minDistanceMeters = Infinity;
  let overlappingSegmentsLength = 0;

  // Sample points along poly1
  const sampleCount = 20;
  for (let i = 0; i <= sampleCount; i++) {
    const fraction = i / sampleCount;
    const samplePoint = getInterpolatedPoint(poly1, fraction);
    const dist = pointToPolylineDistanceMeters(samplePoint, poly2);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
    }
    if (dist <= proximityThresholdMeters) {
      overlappingSegmentsLength += length1 / sampleCount;
    }
  }

  const overlapPercentage = Math.min(100, Math.round((overlappingSegmentsLength / baseLength) * 100));

  return {
    overlapMeters: Math.round(overlappingSegmentsLength),
    overlapPercentage,
    minDistanceMeters: Math.round(minDistanceMeters),
  };
}

/**
 * Gets point at fraction (0.0 to 1.0) along a polyline
 */
function getInterpolatedPoint(points: LatLng[], fraction: number): LatLng {
  if (points.length === 0) return { lat: 0, lng: 0 };
  if (points.length === 1) return points[0];
  if (fraction <= 0) return points[0];
  if (fraction >= 1) return points[points.length - 1];

  const totalLength = calculatePolylineLengthMeters(points);
  const targetDistance = totalLength * fraction;

  let accumulated = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const segDist = calculateDistanceMeters(points[i], points[i + 1]);
    if (accumulated + segDist >= targetDistance) {
      const segFraction = (targetDistance - accumulated) / segDist;
      return {
        lat: points[i].lat + segFraction * (points[i + 1].lat - points[i].lat),
        lng: points[i].lng + segFraction * (points[i + 1].lng - points[i].lng),
      };
    }
    accumulated += segDist;
  }
  return points[points.length - 1];
}

/**
 * Checks if a given GPS coordinate is within the approved geofence corridor (e.g. 50m tolerance)
 */
export function validateGeofence(
  gps: LatLng,
  approvedGeometry: LatLng[],
  toleranceMeters: number = 50
): { isValid: boolean; distanceToApprovedRouteMeters: number } {
  const dist = pointToPolylineDistanceMeters(gps, approvedGeometry);
  return {
    isValid: dist <= toleranceMeters,
    distanceToApprovedRouteMeters: Math.round(dist),
  };
}
