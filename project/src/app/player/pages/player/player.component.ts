import { Component, OnInit, OnDestroy, inject, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Hls from 'hls.js';

import { StreamService } from '../../services/stream.service';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private streamService = inject(StreamService);

  private hls: Hls | null = null;
  private hideControlsTimeout: any;

  contentId = signal<string>('');
  episodeId = signal<string>('');

  playerState = signal<PlayerState>('idle');
  currentTime = signal<number>(0);
  duration = signal<number>(0);
  buffered = signal<number>(0);
  volume = signal<number>(1);
  muted = signal<boolean>(false);
  isFullscreen = signal<boolean>(false);
  showControls = signal<boolean>(true);
  errorMessage = signal<string>('');

  readonly isPlaying = computed(() => this.playerState() === 'playing');
  readonly isPaused = computed(() => this.playerState() === 'paused');
  readonly isLoading = computed(() => this.playerState() === 'loading');
  readonly hasError = computed(() => this.playerState() === 'error');

  readonly progressPercent = computed(() => {
    const dur = this.duration();
    return dur > 0 ? (this.currentTime() / dur) * 100 : 0;
  });

  readonly bufferedPercent = computed(() => {
    const dur = this.duration();
    return dur > 0 ? (this.buffered() / dur) * 100 : 0;
  });

  readonly formattedCurrentTime = computed(() => this.formatTime(this.currentTime()));
  readonly formattedDuration = computed(() => this.formatTime(this.duration()));

  ngOnInit(): void {
    console.log('[Player] ngOnInit called');
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      console.log('[Player] contentId:', id);
      if (id) {
        this.contentId.set(id);
        const episode = params.get('episodeId');
        console.log('[Player] episodeId:', episode);
        if (episode) {
          this.episodeId.set(episode);
          this.loadEpisodeStream(id, episode);
        } else {
          this.loadStream(id);
        }
      } else {
        console.warn('[Player] No contentId found in route params');
        this.playerState.set('error');
        this.errorMessage.set('No se encontró el ID del contenido');
      }
    });
  }

  ngAfterViewInit(): void {
    this.initVideoEvents();
  }

  ngOnDestroy(): void {
    this.destroyHls();
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
  }

  private initVideoEvents(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    video.addEventListener('timeupdate', () => this.onTimeUpdate());
    video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    video.addEventListener('progress', () => this.onProgress());
    video.addEventListener('play', () => this.onPlay());
    video.addEventListener('pause', () => this.onPause());
    video.addEventListener('waiting', () => this.playerState.set('loading'));
    video.addEventListener('playing', () => this.playerState.set('playing'));
    video.addEventListener('error', () => this.onError());
    video.addEventListener('volumechange', () => this.onVolumeChange());
  }

  private loadStream(contentId: string): void {
    console.log('[Player] loadStream called with contentId:', contentId);
    this.playerState.set('loading');
    this.streamService.loadStreamUrl(contentId);
    
    const checkInterval = setInterval(() => {
      console.log('[Player] Checking stream state...', this.streamService.streamUrl());
      const state = this.streamService.streamUrl();
      if (state.state === 'success' && state.data?.url) {
        clearInterval(checkInterval);
        console.log('[Player] Stream URL received:', state.data.url);
        this.initializeHls(state.data.url);
      } else if (state.state === 'error') {
        clearInterval(checkInterval);
        console.error('[Player] Stream error:', state.error);
        this.playerState.set('error');
        this.errorMessage.set(state.error || 'Failed to load stream');
      }
    }, 100);
  }

  private loadEpisodeStream(contentId: string, episodeId: string): void {
    this.playerState.set('loading');
    this.streamService.loadEpisodeStreamUrl(contentId, episodeId);

    const checkInterval = setInterval(() => {
      const state = this.streamService.episodeStreamUrl();
      if (state.state === 'success' && state.data?.url) {
        clearInterval(checkInterval);
        this.initializeHls(state.data.url);
      } else if (state.state === 'error') {
        clearInterval(checkInterval);
        this.playerState.set('error');
        this.errorMessage.set(state.error || 'Failed to load episode stream');
      }
    }, 100);
  }

  private initializeHls(streamUrl: string): void {
    console.log('[Player] initializeHls called with URL:', streamUrl);
    
    // Workaround: fix duplicated bucket name in URL (backend bug)
    // URL like: http://localhost:9000/streamvault-videos/streamvault-videos/...
    // Should be: http://localhost:9000/streamvault-videos/...
    let fixedUrl = streamUrl;
    const bucketName = 'streamvault-videos';
    const doubleBucket = `${bucketName}/${bucketName}/`;
    if (streamUrl.includes(doubleBucket)) {
      console.log('[Player] Fixing duplicated bucket name in URL');
      fixedUrl = streamUrl.replace(doubleBucket, `${bucketName}/`);
      console.log('[Player] Fixed URL:', fixedUrl);
    }
    
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      this.hls.loadSource(fixedUrl);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[Player] HLS manifest parsed, starting playback');
        this.playerState.set('paused');
        video.play().catch(() => this.playerState.set('paused'));
      });
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[Player] HLS error:', data);
        if (data.fatal) {
          this.playerState.set('error');
          this.errorMessage.set('Failed to load video stream');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = fixedUrl;
      video.addEventListener('loadedmetadata', () => {
        this.playerState.set('paused');
        video.play().catch(() => this.playerState.set('paused'));
      });
    } else {
      this.playerState.set('error');
      this.errorMessage.set('HLS is not supported in this browser');
    }
  }

  private destroyHls(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
  }

  private onTimeUpdate(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      this.currentTime.set(video.currentTime);
    }
  }

  private onLoadedMetadata(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      this.duration.set(video.duration);
    }
  }

  private onProgress(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video && video.buffered.length > 0) {
      this.buffered.set(video.buffered.end(video.buffered.length - 1));
    }
  }

  private onPlay(): void {
    this.playerState.set('playing');
    this.startHideControlsTimer();
  }

  private onPause(): void {
    this.playerState.set('paused');
    this.showControls.set(true);
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
  }

  private onError(): void {
    this.playerState.set('error');
    this.errorMessage.set('Video playback error');
  }

  private onVolumeChange(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      this.volume.set(video.volume);
      this.muted.set(video.muted);
    }
  }

  private startHideControlsTimer(): void {
    if (this.hideControlsTimeout) {
      clearTimeout(this.hideControlsTimeout);
    }
    this.hideControlsTimeout = setTimeout(() => {
      if (this.isPlaying()) {
        this.showControls.set(false);
      }
    }, 3000);
  }

  onVideoClick(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  onVideoMouseMove(): void {
    this.showControls.set(true);
    if (this.isPlaying()) {
      this.startHideControlsTimer();
    }
  }

  togglePlay(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  seek(event: MouseEvent): void {
    const video = this.videoElementRef?.nativeElement;
    const progressBar = event.currentTarget as HTMLElement;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const time = percent * video.duration;
    video.currentTime = Math.max(0, Math.min(time, video.duration));
  }

  skip(seconds: number): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
  }

  toggleMute(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;
    video.muted = !video.muted;
  }

  setVolume(event: Event): void {
    const video = this.videoElementRef?.nativeElement;
    const input = event.target as HTMLInputElement;
    if (!video) return;
    video.volume = parseFloat(input.value);
    if (video.muted && video.volume > 0) {
      video.muted = false;
    }
  }

  toggleFullscreen(): void {
    const container = document.querySelector('.player-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        this.isFullscreen.set(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.isFullscreen.set(false);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    const id = this.contentId();
    if (id) {
      this.playerState.set('loading');
      this.errorMessage.set('');
      const epId = this.episodeId();
      if (epId) {
        this.loadEpisodeStream(id, epId);
      } else {
        this.loadStream(id);
      }
    }
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}