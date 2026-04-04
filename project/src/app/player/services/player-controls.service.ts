import { Injectable, signal, computed, WritableSignal, Signal } from '@angular/core';
import { 
  PlayerState, 
  SPEED_OPTIONS, 
  QUALITY_OPTIONS, 
  SpeedOption, 
  QualityOption 
} from '../models/player-state.model';

@Injectable({ providedIn: 'root' })
export class PlayerControlsService {
  private _contentId = signal<string>('');
  private _episodeId = signal<string>('');
  private _playerState = signal<PlayerState>('idle');
  private _currentTime = signal<number>(0);
  private _duration = signal<number>(0);
  private _buffered = signal<number>(0);
  private _volume = signal<number>(1);
  private _muted = signal<boolean>(false);
  private _isFullscreen = signal<boolean>(false);
  private _showControls = signal<boolean>(true);
  private _speed = signal<number>(1);
  private _quality = signal<string>('Auto');
  private _pseudoFullscreen = signal<boolean>(false);
  private _showSpeedMenu = signal<boolean>(false);
  private _showQualityMenu = signal<boolean>(false);
  private _errorMessage = signal<string>('');

  private hideControlsTimeout: any = null;

  readonly contentId = this._contentId.asReadonly();
  readonly episodeId = this._episodeId.asReadonly();
  readonly playerState: Signal<PlayerState> = this._playerState.asReadonly();
  readonly currentTime: Signal<number> = this._currentTime.asReadonly();
  readonly duration: Signal<number> = this._duration.asReadonly();
  readonly buffered: Signal<number> = this._buffered.asReadonly();
  readonly volume: Signal<number> = this._volume.asReadonly();
  readonly muted: Signal<boolean> = this._muted.asReadonly();
  readonly isFullscreen: Signal<boolean> = this._isFullscreen.asReadonly();
  readonly showControls: Signal<boolean> = this._showControls.asReadonly();
  readonly speed: Signal<number> = this._speed.asReadonly();
  readonly quality: Signal<string> = this._quality.asReadonly();
  readonly pseudoFullscreen: Signal<boolean> = this._pseudoFullscreen.asReadonly();
  readonly showSpeedMenu: Signal<boolean> = this._showSpeedMenu.asReadonly();
  readonly showQualityMenu: Signal<boolean> = this._showQualityMenu.asReadonly();
  readonly errorMessage: Signal<string> = this._errorMessage.asReadonly();

  readonly speedOptions = SPEED_OPTIONS;
  readonly qualityOptions = QUALITY_OPTIONS;

  readonly isPlaying = computed(() => this._playerState() === 'playing');
  readonly isPaused = computed(() => this._playerState() === 'paused');
  readonly isLoading = computed(() => this._playerState() === 'loading');
  readonly hasError = computed(() => this._playerState() === 'error');

  readonly progressPercent = computed(() => {
    const dur = this._duration();
    return dur > 0 ? (this._currentTime() / dur) * 100 : 0;
  });

  readonly bufferedPercent = computed(() => {
    const dur = this._duration();
    return dur > 0 ? (this._buffered() / dur) * 100 : 0;
  });

  readonly formattedCurrentTime = computed(() => this.formatTime(this._currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this._duration()));

  setPlayerState(state: PlayerState): void {
    this._playerState.set(state);
  }

  setContentId(id: string): void {
    this._contentId.set(id);
  }

  setEpisodeId(id: string): void {
    this._episodeId.set(id);
  }

  updateCurrentTime(time: number): void {
    this._currentTime.set(time);
  }

  updateDuration(duration: number): void {
    this._duration.set(duration);
  }

  updateBuffered(buffered: number): void {
    this._buffered.set(buffered);
  }

  updateVolume(volume: number): void {
    this._volume.set(volume);
  }

  updateMuted(muted: boolean): void {
    this._muted.set(muted);
  }

  setFullscreen(isFullscreen: boolean): void {
    this._isFullscreen.set(isFullscreen);
  }

  setShowControls(show: boolean): void {
    this._showControls.set(show);
  }

  setSpeed(speed: number): void {
    this._speed.set(speed);
  }

  setQuality(quality: string): void {
    this._quality.set(quality);
  }

  togglePseudoFullscreen(): void {
    this._pseudoFullscreen.update(v => !v);
  }

  toggleSpeedMenu(): void {
    this._showSpeedMenu.update(v => !v);
    this._showQualityMenu.set(false);
  }

  toggleQualityMenu(): void {
    this._showQualityMenu.update(v => !v);
    this._showSpeedMenu.set(false);
  }

  closeMenus(): void {
    this._showSpeedMenu.set(false);
    this._showQualityMenu.set(false);
  }

  setErrorMessage(message: string): void {
    this._errorMessage.set(message);
  }

  setLoading(): void {
    this._playerState.set('loading');
  }

  setPlaying(): void {
    this._playerState.set('playing');
    this.startHideControlsTimer();
  }

  setPaused(): void {
    this._playerState.set('paused');
    this._showControls.set(true);
    this.closeMenus();
    this.clearHideControlsTimer();
  }

  setError(message?: string): void {
    this._playerState.set('error');
    this._errorMessage.set(message || 'Video playback error');
  }

  setIdle(): void {
    this._playerState.set('idle');
  }

  startHideControlsTimer(): void {
    this.clearHideControlsTimer();
    if (this.isPlaying()) {
      this.hideControlsTimeout = setTimeout(() => {
        this._showControls.set(false);
      }, 3000);
    }
  }

  clearHideControlsTimer(): void {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
      this.hideControlsTimeout = null;
    }
  }

  showControlsTemporarily(): void {
    this._showControls.set(true);
    if (this.isPlaying()) {
      this.startHideControlsTimer();
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this._pseudoFullscreen()) {
        this._pseudoFullscreen.set(false);
      }
      this.closeMenus();
    }
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}