import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExecutionDelta } from '../../../../core/services/signalr.service';

@Component({
  selector: 'af-timeline-scrubber',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="timeline-scrubber">
      <div class="header">
        <h4>Time-Travel Debugger</h4>
        @if (traces.length) {
          <div class="metrics">Steps: {{ traces.length }} | Replay Speed: {{ playbackSpeed }}x</div>
        }
      </div>

      <div class="scrubber-track">
        <input
          type="range"
          min="0"
          [max]="traces.length - 1"
          [(ngModel)]="currentIndex"
          (input)="onScrub()"
          aria-label="Execution timeline scrubber"
        />

        <div class="ticks">
          <!-- Visualize failure/retry points along track -->
          @for (trace of traces; track trace; let i = $index) {
            <div
              class="tick"
              [style.left.%]="(i / (traces.length - 1)) * 100"
              [ngClass]="trace.eventType"
            ></div>
          }
        </div>
      </div>

      <div class="controls">
        <button (click)="stepBack()" [disabled]="currentIndex <= 0" aria-label="Step Back">
          ⏮
        </button>
        @if (!isPlaying) {
          <button (click)="play()" [disabled]="currentIndex >= traces.length - 1" aria-label="Play">
            ▶
          </button>
        }
        @if (isPlaying) {
          <button (click)="pause()" aria-label="Pause">⏸</button>
        }
        <button
          (click)="stepForward()"
          [disabled]="currentIndex >= traces.length - 1"
          aria-label="Step Forward"
        >
          ⏭
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .timeline-scrubber {
        background: var(--af-bg, #ffffff);
        border-top: 1px solid #e1e4e8;
        padding: 12px 16px;
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          h4 {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
            color: var(--af-secondary, #6c5ce7);
          }
          .metrics {
            font-size: 11px;
            color: var(--af-text-muted, #636e72);
          }
        }
        .scrubber-track {
          position: relative;
          height: 32px;
          display: flex;
          align-items: center;
          input[type='range'] {
            width: 100%;
            z-index: 10;
            margin: 0;
            cursor: pointer;
          }
          .ticks {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 16px;
            transform: translateY(-50%);
            pointer-events: none;
            .tick {
              position: absolute;
              width: 4px;
              height: 8px;
              top: 4px;
              transform: translateX(-50%);
              border-radius: 2px;
              background: #e1e4e8;
              &.failed {
                background: var(--af-error, #d63031);
                height: 12px;
                top: 2px;
              }
              &.retry {
                background: var(--af-warning, #fdcb6e);
              }
            }
          }
        }
        .controls {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          button {
            background: #f1f2f6;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s;
            &:hover:not(:disabled) {
              background: #e1e4e8;
            }
            &:disabled {
              opacity: 0.4;
              cursor: not-allowed;
            }
          }
        }
      }
    `,
  ],
})
export class TimelineScrubberComponent {
  @Input() traces: ExecutionDelta[] = [];
  @Output() snapshotPreview = new EventEmitter<ExecutionDelta>();

  public currentIndex: number = 0;
  public playbackSpeed: number = 1;
  public isPlaying: boolean = false;

  private playInterval: any;

  public onScrub() {
    this.pause();
    this.emitCurrentSnapshot();
  }

  public play() {
    if (this.currentIndex >= this.traces.length - 1) {
      this.currentIndex = 0;
    }
    this.isPlaying = true;

    this.playInterval = setInterval(() => {
      this.stepForward();
      if (this.currentIndex >= this.traces.length - 1) {
        this.pause();
      }
    }, 1000 / this.playbackSpeed);
  }

  public pause() {
    this.isPlaying = false;
    if (this.playInterval) clearInterval(this.playInterval);
  }

  public stepForward() {
    if (this.currentIndex < this.traces.length - 1) {
      this.currentIndex++;
      this.emitCurrentSnapshot();
    }
  }

  public stepBack() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.emitCurrentSnapshot();
    }
  }

  private emitCurrentSnapshot() {
    if (this.traces.length > this.currentIndex) {
      this.snapshotPreview.emit(this.traces[this.currentIndex]);
    }
  }
}
