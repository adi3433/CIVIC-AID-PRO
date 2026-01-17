/**
 * Location Service
 * 
 * Handles GPS location detection, permission management,
 * and reverse geocoding for civic issue reporting.
 */

import type { IssueLocation } from "@/types/civicIssue";

// ============================================
// LOCATION PERMISSION
// ============================================

export interface LocationPermissionResult {
  granted: boolean;
  error?: string;
}

/**
 * Request location permission from the browser
 */
export async function requestLocationPermission(): Promise<LocationPermissionResult> {
  try {
    if (!navigator.geolocation) {
      return {
        granted: false,
        error: "Geolocation is not supported by your browser",
      };
    }

    // Check existing permission state
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({
        name: "geolocation" as PermissionName,
      });

      if (permission.state === "denied") {
        return {
          granted: false,
          error: "Location permission denied. Please enable in browser settings.",
        };
      }

      if (permission.state === "granted") {
        return { granted: true };
      }
    }

    // Permission is "prompt" or unknown, request will prompt user
    return { granted: true };
  } catch (error) {
    return {
      granted: false,
      error: "Failed to check location permission",
    };
  }
}

// ============================================
// GPS LOCATION DETECTION
// ============================================

export interface LocationResult {
  success: boolean;
  location?: IssueLocation;
  error?: string;
}

/**
 * Get current GPS location with high accuracy
 */
export async function getCurrentLocation(): Promise<LocationResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 seconds
      maximumAge: 0, // Don't use cached position
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Attempt reverse geocoding to get address
        const address = await reverseGeocode(latitude, longitude);

        resolve({
          success: true,
          location: {
            latitude: Number(latitude.toFixed(6)),
            longitude: Number(longitude.toFixed(6)),
            address: address?.formatted,
            area: address?.area,
            ward: address?.ward,
            landmark: address?.landmark,
          },
        });
      },
      (error) => {
        let errorMessage = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
        });
      },
      options
    );
  });
}

/**
 * Watch location for real-time updates
 * Returns a watchId that can be used to stop watching
 */
export function watchLocation(
  onLocationUpdate: (location: IssueLocation) => void,
  onError?: (error: string) => void
): number | null {
  if (!navigator.geolocation) {
    onError?.("Geolocation is not supported");
    return null;
  }

  const options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);

      onLocationUpdate({
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        address: address?.formatted,
        area: address?.area,
        ward: address?.ward,
      });
    },
    (error) => {
      onError?.(`Location error: ${error.message}`);
    },
    options
  );

  return watchId;
}

/**
 * Stop watching location
 */
export function stopWatchingLocation(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// ============================================
// REVERSE GEOCODING
// ============================================

interface ReverseGeocodeResult {
  formatted: string;
  area?: string;
  ward?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
}

/**
 * Convert GPS coordinates to human-readable address
 * 
 * NOTE: This uses OpenStreetMap Nominatim API (free, no key required)
 * In production, consider using Google Maps API, Mapbox, or similar
 * for better accuracy and rate limits.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodeResult> {
  try {
    const url = `/api/nominatim/reverse?format=json&lat=${lat}&lon=${lon}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.error) {
      return null;
    }

    const address = data.address || {};

    // Build formatted address
    const parts: string[] = [];
    if (address.road) parts.push(address.road);
    if (address.suburb) parts.push(address.suburb);
    if (address.city || address.town || address.village) {
      parts.push(address.city || address.town || address.village);
    }

    const formatted = parts.length > 0 ? parts.join(", ") : "Unknown location";

    return {
      formatted,
      area: address.suburb || address.neighbourhood,
      ward: address.suburb,
      city: address.city || address.town || address.village,
      state: address.state,
      country: address.country,
      landmark: address.amenity || address.building,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

// ============================================
// MANUAL LOCATION INPUT
// ============================================

/**
 * Geocode an address string to GPS coordinates
 * Used when GPS is unavailable and user enters address manually
 * 
 * NOTE: Uses OpenStreetMap Nominatim API
 */
export async function geocodeAddress(
  address: string
): Promise<LocationResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      address
    )}&format=json&addressdetails=1&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CivicAid/1.0",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Failed to find location",
      };
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "Address not found",
      };
    }

    const result = data[0];
    const addressData = result.address || {};

    return {
      success: true,
      location: {
        latitude: Number(parseFloat(result.lat).toFixed(6)),
        longitude: Number(parseFloat(result.lon).toFixed(6)),
        address: result.display_name,
        area: addressData.suburb || addressData.neighbourhood,
        ward: addressData.suburb,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to geocode address",
    };
  }
}

// ============================================
// LOCATION VALIDATION
// ============================================

/**
 * Validate GPS coordinates
 */
export function validateCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Check if location is within service area
 * 
 * NOTE: In production, define service boundaries
 * based on municipality/city limits
 */
export function isWithinServiceArea(
  latitude: number,
  longitude: number,
  serviceBounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  }
): boolean {
  if (!serviceBounds) {
    // No bounds defined, allow all locations
    return true;
  }

  return (
    latitude <= serviceBounds.north &&
    latitude >= serviceBounds.south &&
    longitude <= serviceBounds.east &&
    longitude >= serviceBounds.west
  );
}

// ============================================
// LOCATION UTILITIES
// ============================================

/**
 * Format location for display
 */
export function formatLocation(location: IssueLocation): string {
  if (location.address) {
    return location.address;
  }

  if (location.area) {
    return location.area;
  }

  // Fallback to coordinates
  return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
}

/**
 * Generate Google Maps link for location
 */
export function getGoogleMapsLink(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Generate Apple Maps link for location
 */
export function getAppleMapsLink(latitude: number, longitude: number): string {
  return `https://maps.apple.com/?q=${latitude},${longitude}`;
}

/**
 * Get appropriate maps link based on device
 */
export function getMapsLink(latitude: number, longitude: number): string {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);

  return isIOS
    ? getAppleMapsLink(latitude, longitude)
    : getGoogleMapsLink(latitude, longitude);
}
