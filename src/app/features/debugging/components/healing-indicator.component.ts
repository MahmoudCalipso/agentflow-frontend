import { Component, Input } from '@angular/core';

@Component({
  selector: 'af-healing-indicator',
  standalone: true,
  imports: [],
  template: `
    @if (active) {
      <div class="healing-wrapper" role="status" aria-live="polite">
        <div class="pulse-ring"></div>
        <div class="icon">✨</div>
        <div class="tooltip">
          <strong>Self-Healing Active</strong>
          <span>AutonomousDebugAgent is repairing node {{ nodeId }}...</span>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .healing-wrapper {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--af-secondary, #6c5ce7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: help;
        z-index: 50;
        box-shadow: 0 2px 8px rgba(108, 92, 231, 0.4);

        .pulse-ring {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--af-secondary, #6c5ce7);
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .icon {
          font-size: 12px;
          z-index: 2;
          animation: spin 3s linear infinite;
        }

        .tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          background: #1e1e2e;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          width: 180px;
          text-align: left;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          pointer-events: none;

          strong {
            display: block;
            color: var(--af-secondary, #6c5ce7);
            margin-bottom: 4px;
          }
          &::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -4px;
            border-width: 4px;
            border-style: solid;
            border-color: #1e1e2e transparent transparent transparent;
          }
        }

        &:hover .tooltip {
          opacity: 1;
          visibility: visible;
        }
      }

      @keyframes ping {
        75%,
        100% {
          transform: scale(2);
          opacity: 0;
        }
      }
      @keyframes spin {
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class HealingIndicatorComponent {
  @Input() active: boolean = false;
  @Input() nodeId: string = '';
}
