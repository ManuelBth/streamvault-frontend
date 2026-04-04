import { Component, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerTopBarComponent } from '../player-top-bar/player-top-bar.component';
import { PlayerCenterPlayComponent } from '../player-center-play/player-center-play.component';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';

@Component({
  selector: 'app-player-overlay',
  standalone: true,
  imports: [CommonModule, PlayerTopBarComponent, PlayerCenterPlayComponent, PlayerControlsComponent],
  template: `
    <div class="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300">
      <!-- Top Bar -->
      <div class="absolute top-0 left-0 right-0 p-2 md:p-4">
        <app-player-top-bar
          [contentId]="contentId()"
          [episodeId]="episodeId()"
          (backClick)="backClick.emit()"
        ></app-player-top-bar>
      </div>

      <!-- Center Play Button (when paused) -->
      @if (isPaused()) {
        <app-player-center-play
          [isPaused]="isPaused()"
          (playClick)="playClick.emit()"
        ></app-player-center-play>
      }

      <!-- Bottom Controls -->
      <app-player-controls
        [currentTime]="currentTime()"
        [duration]="duration()"
        [buffered]="buffered()"
        [volume]="volume()"
        [muted]="muted()"
        [isFullscreen]="isFullscreen()"
        [speed]="speed()"
        [quality]="quality()"
        [showSpeedMenu]="showSpeedMenu()"
        [showQualityMenu]="showQualityMenu()"
        [isPlaying]="isPlaying()"
        (playPause)="playPause.emit()"
        (seek)="seek.emit($event)"
        (skip)="skip.emit($event)"
        (mute)="muteToggle.emit()"
        (volumeChange)="volumeChange.emit($event)"
        (fullscreenToggle)="fullscreenToggle.emit()"
        (speedClick)="speedMenuToggle.emit()"
        (qualityClick)="qualityMenuToggle.emit()"
        (speedChange)="speedChange.emit($event)"
        (qualityChange)="qualityChange.emit($event)"
        (menuClose)="menusClose.emit()"
      ></app-player-controls>
    </div>
  `
})
export class PlayerOverlayComponent {
  isPaused = input.required<boolean>();
  isPlaying = input.required<boolean>();
  contentId = input.required<string>();
  episodeId = input.required<string>();

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

  @Output() backClick = new EventEmitter<void>();
  @Output() playClick = new EventEmitter<void>();
  @Output() playPause = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();
  @Output() skip = new EventEmitter<number>();
  @Output() muteToggle = new EventEmitter<void>();
  @Output() volumeChange = new EventEmitter<number>();
  @Output() fullscreenToggle = new EventEmitter<void>();
  @Output() speedMenuToggle = new EventEmitter<void>();
  @Output() qualityMenuToggle = new EventEmitter<void>();
  @Output() speedChange = new EventEmitter<number>();
  @Output() qualityChange = new EventEmitter<string>();
  @Output() menusClose = new EventEmitter<void>();
}