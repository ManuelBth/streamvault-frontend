export interface HistoryRecord {
  id: string;
  profileId: string;
  episodeId: string;
  progressSec: number;
  completed: boolean;
  watchedAt: string;
}

export interface CreateHistoryRequest {
  episodeId: string;
  progressSec?: number;
  completed?: boolean;
}

export interface UpdateProgressRequest {
  progressSec: number;
  completed?: boolean;
}