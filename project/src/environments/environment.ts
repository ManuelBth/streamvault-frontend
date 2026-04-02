export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  wsUrl: 'ws://localhost:8080/ws',
  apiVersion: 'v1',
  // MinIO público para thumbnails (solo lectura)
  minioPublicUrl: 'http://localhost:9000/streamvault-thumbnails/',
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
