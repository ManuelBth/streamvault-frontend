import { Component, Output, EventEmitter, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-player-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2 md:p-4 space-y-2 md:space-y-3">
      <!-- Progress Bar -->
      <div
        class="relative h-1 md:h-1.5 bg-white/30 rounded-full cursor-pointer group"
        (click)="onSeek($event)"
      >
        <!-- Buffered -->
        <div
          class="absolute h-full bg-white/50 rounded-full"
          [style.width.%]="bufferedPercent()"
        ></div>
        <!-- Progress -->
        <div
          class="absolute h-full bg-sv-primary rounded-full"
          [style.width.%]="progressPercent()"
        ></div>
        <!-- Thumb -->
        <div
          class="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-sv-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          [style.left.%]="progressPercent()"
        ></div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-between gap-2 md:gap-4">
        <div class="flex items-center gap-2 md:gap-4">
          <!-- Play/Pause -->
          <button
            (click)="playPause.emit()"
            class="text-sv-text hover:text-sv-red transition-colors"
          >
            @if (isPlaying()) {
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            } @else {
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            }
          </button>

          <!-- Skip Back -->
          <button
            (click)="skip.emit(-10)"
            class="hidden md:flex text-sv-text hover:text-sv-red transition-colors"
            title="-10 segundos"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          <!-- Skip Forward -->
          <button
            (click)="skip.emit(10)"
            class="hidden md:flex text-sv-text hover:text-sv-red transition-colors"
            title="+10 segundos"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>

          <!-- Time -->
          <span class="text-sv-text text-xs md:text-sm">
            {{ formattedCurrentTime() }} / {{ formattedDuration() }}
          </span>
        </div>

        <div class="flex items-center gap-4">
          <!-- Volume -->
          <div class="flex items-center gap-2 group">
            <button
              (click)="mute.emit()"
              class="text-sv-text hover:text-sv-red transition-colors"
            >
              @if (muted() || volume() === 0) {
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                </svg>
              } @else if (volume() < 0.5) {
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                </svg>
              } @else {
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              }
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              [value]="volume()"
              (input)="onVolumeChange($event)"
              class="w-12 md:w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-sv-red [&::-webkit-slider-thumb]:rounded-full group-hover:opacity-100 opacity-0 transition-opacity"
            />
          </div>

          <!-- Speed -->
          <div class="relative">
            <button
              (click)="speedClick.emit()"
              class="text-sv-text hover:text-sv-primary transition-colors px-1 md:px-2 py-1 text-xs md:text-sm"
            >
              @if (speed() === 1) {
                1x
              } @else {
                {{ speed() }}x
              }
            </button>
            @if (showSpeedMenu()) {
              <div class="absolute bottom-full mb-2 right-0 bg-sv-surface border border-sv-card rounded shadow-lg py-1 min-w-24 z-50">
                @for (option of speedOptions; track option) {
                  <button
                    (click)="speedChange.emit(option); menuClose.emit()"
                    class="w-full px-3 py-2 text-left text-sm transition-colors"
                    [class.bg-sv-primary]="speed() === option"
                    [class.text-sv-black]="speed() === option"
                    [class.text-sv-text]="speed() !== option"
                    [class.hover:bg-sv-card]="speed() !== option"
                  >
                    {{ option }}x
                  </button>
                }
              </div>
            }
          </div>

          <!-- Quality -->
          <div class="relative">
            <button
              (click)="qualityClick.emit()"
              class="text-sv-text hover:text-sv-primary transition-colors px-1 md:px-2 py-1 text-xs md:text-sm"
            >
              {{ quality() }}
            </button>
            @if (showQualityMenu()) {
              <div class="absolute bottom-full mb-2 right-0 bg-sv-surface border border-sv-card rounded shadow-lg py-1 min-w-24 z-50">
                @for (option of qualityOptions; track option) {
                  <button
                    (click)="qualityChange.emit(option); menuClose.emit()"
                    class="w-full px-3 py-2 text-left text-sm transition-colors"
                    [class.bg-sv-primary]="quality() === option"
                    [class.text-sv-black]="quality() === option"
                    [class.text-sv-text]="quality() !== option"
                    [class.hover.bg-sv-card]="quality() !== option"
                  >
                    {{ option }}
                  </button>
                }
              </div>
            }
          </div>

          <!-- Fullscreen -->
          <button
            (click)="fullscreenToggle.emit()"
            class="text-sv-text hover:text-sv-primary transition-colors"
          >
            @if (isFullscreen()) {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            } @else {
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class PlayerControlsComponent {
  currentTime = input.required<number>();
  duration = input.required<number>();
  buffered = input.required<number>();
  volume = input.required<number>();
  muted = input.required<boolean>();
  isFullscreen = input.required<boolean>();
  speed = input.required<number>();
  quality = input.required<string>();
  showSpeedMenu = input.required<boolean>();
  showQualityMenu = input.required<boolean>();
  isPlaying = input.required<boolean>();

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

  readonly speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
  readonly qualityOptions = ['Auto', '1080p', '720p', '480p', '360p'] as const;

  @Output() playPause = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() skip = new EventEmitter<number>();
  @Output() mute = new EventEmitter<void>();
  @Output() volumeChange = new EventEmitter<number>();
  @Output() fullscreenToggle = new EventEmitter<void>();
  @Output() speedClick = new EventEmitter<void>();
  @Output() qualityClick = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<number>();
  @Output() qualityChange = new EventEmitter<string>();
  @Output() menuClose = new EventEmitter<void>();

  onSeek(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.seek.emit(percent);
  }

  onVolumeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.volumeChange.emit(parseFloat(input.value));
  }

  private formatTime(seconds: number): string {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}