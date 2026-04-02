import { ContentStatus, ContentType } from './catalog.enums';
import { Genre } from './genre.model';

export interface Content {
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

export interface CatalogResponse {
  content: Content[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ContentDetailResponse extends Content {}