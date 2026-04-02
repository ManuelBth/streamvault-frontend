export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  apiVersion: 'v1',
  features: {
    enableVideoStreaming: true,
    enableNotifications: true,
    enableAnalytics: false
  },
  logging: {
    console: true,
    remote: false
  }
};
