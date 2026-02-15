"use client"

export type LocationResult =
  | { success: true; lat: number; lng: number }
  | { success: false; message: string }

export async function getCurrentLocation(): Promise<LocationResult> {
  if (!navigator.geolocation) {
    return {
      success: false,
      message: "Geolocation is not supported on this device.",
    }
  }

  // Check permission if supported
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      })

      if (permission.state === "denied") {
        return {
          success: false,
          message:
            "Location access was denied. Please enable it in your browser settings.",
        }
      }
    } catch {
      // Permissions API failed — continue to request location
    }
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          success: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        resolve({
          success: false,
          message:
            error.code === error.PERMISSION_DENIED
              ? "Location permission is required to continue."
              : "Unable to retrieve location. Please try again.",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  })
}
