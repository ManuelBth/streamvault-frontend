export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080/ws',
  apiVersion: 'v1',
  features: {
    enableVideoStreaming: true,
    enableNotifications: true,
    enableAnalytics: false,
    enableChat: false
  },
  logging: {
    console: true,
    remote: false
  }
};
