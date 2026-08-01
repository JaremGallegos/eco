export const AppConfig = {
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  geocoding: {
    timeout: 5000,
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  media: {
    maxPhotos: 3,
    maxVideos: 1,
    imageQuality: 0.8,
    videoQuality: 'medium' as const,
    allowedImageTypes: ['jpg', 'jpeg', 'png'],
    allowedVideoTypes: ['mp4', 'mov'],
  },

  location: {
    accuracy: 5,
    distanceInterval: 10,
    timeInterval: 5000,
  },

  polling: {
    incidentDetailInterval: 10000,
    dashboardStatsInterval: 30000,
  },

  legal: {
    escalationHoursLimit: 24,
    responseDeadlineDays: 15,
  },

  ui: {
    animationDuration: 300,
    toastDuration: 3000,
    debounceDelay: 500,
  },
} as const;

export type AppConfigType = typeof AppConfig;
