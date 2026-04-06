export interface UploadResponse {
  key: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}