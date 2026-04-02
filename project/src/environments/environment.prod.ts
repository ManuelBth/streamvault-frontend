export const environment = {
  production: true,
  apiUrl: 'https://api.streamvault.com',
  apiVersion: 'v1',
  features: {
    enableVideoStreaming: true,
    enableNotifications: true,
    enableAnalytics: true
  },
  logging: {
    console: false,
    remote: true
  }
};
