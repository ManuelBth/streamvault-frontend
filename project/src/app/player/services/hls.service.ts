import { Injectable, signal } from '@angular/core';
import Hls from 'hls.js';

@Injectable({ providedIn: 'root' })
export class HlsService {
  private hlsInstance: Hls | null = null;
  private _isSupported = signal<boolean>(false);

  readonly isSupported = this._isSupported.asReadonly();

  constructor() {
    this._isSupported.set(Hls.isSupported());
  }

  initPlayer(videoElement: HTMLVideoElement, url: string): void {
    this.destroy();

    if (!Hls.isSupported()) {
      console.error('HLS is not supported in this browser');
      if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = url;
      }
      return;
    }

    this.hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    this.hlsInstance.loadSource(url);
    this.hlsInstance.attachMedia(videoElement);

    this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
      console.log('HLS manifest loaded');
    });

    this.hlsInstance.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Fatal network error, trying to recover...');
            this.hlsInstance?.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Fatal media error, trying to recover...');
            this.hlsInstance?.recoverMediaError();
            break;
          default:
            console.error('Fatal error, destroying...');
            this.destroy();
            break;
        }
      }
    });
  }

  destroy(): void {
    if (this.hlsInstance) {
      this.hlsInstance.destroy();
      this.hlsInstance = null;
    }
  }

  isHlsSupported(): boolean {
    return Hls.isSupported();
  }

  getInstance(): Hls | null {
    return this.hlsInstance;
  }
}
