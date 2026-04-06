import { ContentStatus, ContentType } from '../../catalog/models/catalog.enums';
import { Genre } from '../../catalog/models/genre.model';

export interface ContentResponse {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  releaseYear: number;
  rating: string;
  thumbnailKey: string | null;
  minioKey: string | null;
  status: ContentStatus;
  genres: Genre[];
  createdAt: string;
  updatedAt: string | null;
}

export interface ContentListResponse {
  content: ContentResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CreateContentRequest {
  title: string;
  description: string;
  type: ContentType;
  releaseYear: number;
  rating: string;
  status: ContentStatus;
  genreIds: string[];
  thumbnailKey?: string;
}

export interface UpdateContentRequest {
  title?: string;
  description?: string;
  releaseYear?: number;
  rating?: string;
  status?: ContentStatus;
  genreIds?: string[];
  thumbnailKey?: string;
}