# Design: Netflix-style Player UI Enhancement

## Technical Approach

Refactor monolithic `PlayerComponent` into a Container/Presentational architecture using Angular 21+ zonesless patterns with signals. Extract player logic into `PlayerService`, then compose UI from smaller reusable components. Add speed/quality selection menus and improve Netflix-style UX with pseudo-fullscreen and refined auto-hide logic.

## Architecture Decisions

### Decision: Container/Presentational Pattern

**Choice**: Smart `PlayerContainerComponent` + dumb presentational components
**Alternatives considered**: Keep monolithic component, use NgRx for state
**Rationale**: Separation of concerns enables testability, reusability, and cleaner logic flow. Signals already provide reactive state — no need for NgRx overhead.

### Decision: Centralized PlayerService

**Choice**: `PlayerService` as single source of truth for all player state
**Alternatives considered**: Distributed state in components, event emitters between components
**Rationale**: Multiple components need access to current time, volume, speed, quality. Centralized service with signals ensures consistency and eliminates prop drilling.

### Decision: Pseudo-Fullscreen with Viewport Units

**Choice**: CSS-based fullscreen using `100vh`/`100vw` instead of Fullscreen API
**Alternatives considered**: Native Fullscreen API (`requestFullscreen`)
**Rationale**: Netflix-style pseudo-fullscreen provides smoother transitions, avoids browser restrictions, and maintains consistent UI chrome. Native fullscreen can be flaky on mobile.

### Decision: Auto-Hide Timer with Mouse Detection

**Choice**: `setTimeout`-based controls visibility with `mousemove` reset
**Alternatives considered**: CSS-only with `pointer-events`, `setInterval` polling
**Rationale**: Timer gives precise control over hide delay (3s Netflix-style). Mouse move detection is lightweight and provides instant show response.

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    PlayerContainerComponent                  │
│  ┌──────────────┐    ┌──────────────────────────────────┐  │
│  │ Video Element│◄───│        PlayerService              │  │
│  └──────────────┘    │  (signals: current, duration,    │  │
│         │             │   volume, speed, quality,        │  │
│         │             │   fullscreen, showControls)     │  │
│         ▼             └──────────────┬───────────────────┘  │
│  ┌──────────────────┐                      │               │
│  │ PlayerOverlay    │◄─────────────────────┘               │
│  │  ├─ ProgressBar  │                                        │
│  │  ├─ SpeedMenu    │                                        │
│  │  └─ QualityMenu │                                        │
│  └──────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `player/services/player.service.ts` | Create | Centralized player state with signals |
| `player/components/player-container/player-container.component.ts` | Create | Smart container - video element, service connection |
| `player/components/player-container/player-container.component.html` | Create | Template for container |
| `player/components/player-container/player-container.component.scss` | Create | Styles including pseudo-fullscreen |
| `player/components/player-overlay/player-overlay.component.ts` | Create | Presentational - controls layout |
| `player/components/player-overlay/player-overlay.component.html` | Create | Template with gradient backgrounds |
| `player/components/player-overlay/player-overlay.component.scss` | Create | Netflix-style animations |
| `player/components/progress-bar/progress-bar.component.ts` | Create | Presentational - seek bar |
| `player/components/progress-bar/progress-bar.component.html` | Create | Template with buffered/progress |
| `player/components/progress-bar/progress-bar.component.scss` | Create | Hover effects, thumb animation |
| `player/components/speed-menu/speed-menu.component.ts` | Create | Presentational - playback speed |
| `player/components/speed-menu/speed-menu.component.html` | Create | Speed options: 0.5x - 2x |
| `player/components/quality-menu/quality-menu.component.ts` | Create | Presentational - quality selection |
| `player/components/quality-menu/quality-menu.component.html` | Create | Quality levels from HLS |
| `player/pages/player/player.component.ts` | Modify | Refactor to use container, inject service |
| `player/pages/player/player.component.html` | Modify | Replace with container component |
| `player/pages/player/player.component.scss` | Delete | Styles moved to components |

## Interfaces / Contracts

```typescript
// player.service.ts - Signal-based state
export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';
export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
export type QualityLevel = 'auto' | number; // 'auto' or height (e.g., 1080)

export interface PlayerState {
  readonly state: Signal<PlayerState>;
  readonly currentTime: Signal<number>;
  readonly duration: Signal<number>;
  readonly buffered: Signal<number>;
  readonly volume: Signal<number>;
  readonly muted: Signal<boolean>;
  readonly playbackSpeed: Signal<PlaybackSpeed>;
  readonly quality: Signal<QualityLevel>;
  readonly availableQualities: Signal<number[]>;
  readonly isFullscreen: Signal<boolean>;
  readonly showControls: Signal<boolean>;
  readonly errorMessage: Signal<string>;
  
  // Computed
  readonly isPlaying: ComputedRef<boolean>;
  readonly isPaused: ComputedRef<boolean>;
  readonly progressPercent: ComputedRef<number>;
  readonly formattedCurrentTime: ComputedRef<string>;
  readonly formattedDuration: ComputedRef<string>;
  
  // Actions
  play(): void;
  pause(): void;
  seek(time: number): void;
  skip(seconds: number): void;
  setVolume(volume: number): void;
  toggleMute(): void;
  setPlaybackSpeed(speed: PlaybackSpeed): void;
  setQuality(quality: QualityLevel): void;
  toggleFullscreen(): void;
  showControlsTemporarily(): void;
}

// Progress bar output event
export interface ProgressBarOutput {
  progressPercent: number;
  bufferedPercent: number;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | PlayerService signals, computed values, actions | `TestBed` with `Hls` mock |
| Unit | ProgressBarComponent click-to-seek calculation | Shallow test, mock emit |
| Integration | Container loads stream, manages Hls lifecycle | Full test with mock Hls |
| E2E | Play/pause, seek, fullscreen, controls auto-hide | Playwright with video mock |

## Migration / Rollout

1. Create `PlayerService` with signal-based state (non-breaking)
2. Create presentational components with minimal logic
3. Create `PlayerContainerComponent` that uses service
4. Update routes to load container instead of existing component
5. Delete old component files after verification

No data migration required. Feature flag not needed — direct replacement.

## Open Questions

- [ ] Should quality switching use HLS levels or manual bitrate control?
- [ ] Persist playback speed preference to localStorage?
- [ ] Support keyboard shortcuts (space=play/pause, arrows=seek, f=fullscreen)?
