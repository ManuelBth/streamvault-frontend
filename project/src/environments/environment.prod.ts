export const environment = {
  production: true,
  apiUrl: 'https://api.streamvault.com/api/v1',
  wsUrl: 'wss://api.streamvault.com/ws',
  apiVersion: 'v1',
  // MinIO público para thumbnails (solo lectura)
  minioPublicUrl: 'https://minio.streamvault.com/streamvault-thumbnails/',
  features: {
    enableVideoStreaming: true,
    enableNotifications: true,
    enableAnalytics: true,
    enableChat: true
  },
  logging: {
    console: false,
    remote: true
  }
};
