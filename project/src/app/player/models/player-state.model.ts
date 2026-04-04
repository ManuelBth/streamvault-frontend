export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayerControlsState {
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  speed: number;
  quality: string;
  pseudoFullscreen: boolean;
  showSpeedMenu: boolean;
  showQualityMenu: boolean;
  errorMessage: string;
}

export const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export const QUALITY_OPTIONS = ['Auto', '1080p', '720p', '480p', '360p'] as const;
export type SpeedOption = typeof SPEED_OPTIONS[number];
export type QualityOption = typeof QUALITY_OPTIONS[number];