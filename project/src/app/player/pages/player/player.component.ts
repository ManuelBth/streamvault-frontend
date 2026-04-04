import { Component, OnInit, OnDestroy, inject, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Hls from 'hls.js';

import { StreamService } from '../../services/stream.service';
import { PlayerControlsService } from '../../services/player-controls.service';
import { PlayerOverlayComponent } from '../../components/player-overlay/player-overlay.component';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, PlayerOverlayComponent],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss'
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElementRef!: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private streamService = inject(StreamService);
  controls = inject(PlayerControlsService);

  private hls: Hls | null = null;

  contentId = signal<string>('');
  episodeId = signal<string>('');

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
        this.controls.setError('No se encontró el ID del contenido');
      }
    });
  }

  ngAfterViewInit(): void {
    this.initVideoEvents();
    document.addEventListener('keydown', (e) => this.controls.handleKeydown(e));
  }

  ngOnDestroy(): void {
    this.destroyHls();
    this.controls.clearHideControlsTimer();
  }

  private initVideoEvents(): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;

    video.addEventListener('timeupdate', () => this.onTimeUpdate());
    video.addEventListener('loadedmetadata', () => this.onLoadedMetadata());
    video.addEventListener('progress', () => this.onProgress());
    video.addEventListener('play', () => this.onPlay());
    video.addEventListener('pause', () => this.onPause());
    video.addEventListener('waiting', () => this.controls.setLoading());
    video.addEventListener('playing', () => this.controls.setPlaying());
    video.addEventListener('error', () => this.onError());
    video.addEventListener('volumechange', () => this.onVolumeChange());
  }

  private loadStream(contentId: string): void {
    console.log('[Player] loadStream called with contentId:', contentId);
    this.controls.setLoading();
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
        this.controls.setError(state.error || 'Failed to load stream');
      }
    }, 100);
  }

  private loadEpisodeStream(contentId: string, episodeId: string): void {
    this.controls.setLoading();
    this.streamService.loadEpisodeStreamUrl(contentId, episodeId);

    const checkInterval = setInterval(() => {
      const state = this.streamService.episodeStreamUrl();
      if (state.state === 'success' && state.data?.url) {
        clearInterval(checkInterval);
        this.initializeHls(state.data.url);
      } else if (state.state === 'error') {
        clearInterval(checkInterval);
        this.controls.setError(state.error || 'Failed to load episode stream');
      }
    }, 100);
  }

  private initializeHls(streamUrl: string): void {
    console.log('[Player] initializeHls called with URL:', streamUrl);
    
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
        this.controls.setPaused();
        video.play().catch(() => this.controls.setPaused());
      });
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('[Player] HLS error:', data);
        if (data.fatal) {
          this.controls.setError('Failed to load video stream');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = fixedUrl;
      video.addEventListener('loadedmetadata', () => {
        this.controls.setPaused();
        video.play().catch(() => this.controls.setPaused());
      });
    } else {
      this.controls.setError('HLS is not supported in this browser');
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
      this.controls.updateCurrentTime(video.currentTime);
    }
  }

  private onLoadedMetadata(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      this.controls.updateDuration(video.duration);
    }
  }

  private onProgress(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video && video.buffered.length > 0) {
      this.controls.updateBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }

  private onPlay(): void {
    this.controls.setPlaying();
  }

  private onPause(): void {
    this.controls.setPaused();
  }

  private onError(): void {
    this.controls.setError('Video playback error');
  }

  private onVolumeChange(): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      this.controls.updateVolume(video.volume);
      this.controls.updateMuted(video.muted);
    }
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
    this.controls.showControlsTemporarily();
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

  seek(percent: number): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;
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

  setVolume(volume: number): void {
    const video = this.videoElementRef?.nativeElement;
    if (!video) return;
    video.volume = volume;
    if (video.muted && video.volume > 0) {
      video.muted = false;
    }
  }

  toggleFullscreen(): void {
    const container = document.querySelector('.player-container');
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        this.controls.setFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        this.controls.setFullscreen(false);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  retry(): void {
    const id = this.contentId();
    if (id) {
      this.controls.setLoading();
      const epId = this.episodeId();
      if (epId) {
        this.loadEpisodeStream(id, epId);
      } else {
        this.loadStream(id);
      }
    }
  }

  setSpeed(speed: number): void {
    const video = this.videoElementRef?.nativeElement;
    if (video) {
      video.playbackRate = speed;
      this.controls.setSpeed(speed);
    }
  }

  setQuality(quality: string): void {
    if (!this.hls) return;
    
    if (quality === 'Auto') {
      this.hls.currentLevel = -1;
    } else {
      const qualityMap: Record<string, number> = { '1080p': 0, '720p': 1, '480p': 2, '360p': 3 };
      const levelIndex = qualityMap[quality];
      if (levelIndex !== undefined && levelIndex < this.hls.levels.length) {
        this.hls.currentLevel = levelIndex;
      }
    }
    this.controls.setQuality(quality);
  }
}