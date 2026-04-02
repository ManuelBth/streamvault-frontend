import { EpisodeStatus } from './catalog.enums';

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title: string;
  description: string;
  minioKey: string | null;
  thumbnailKey: string | null;
  durationSec: number;
  status: EpisodeStatus;
  createdAt: string;
}