import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  ahead: number;
  behind: number;
}

@Component({
  selector: 'af-git-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="git-toolbar">
      <div class="branch-selector" (click)="toggleDropdown()">
        <span class="icon">🌿</span>
        <span class="current-branch">{{ currentBranch()?.name || 'main' }}</span>
        <span class="chev">▼</span>
      </div>

      @if (prData) {
        <div class="pr-status">
          <span class="badge" [ngClass]="prData.status">{{ prData.status }}</span>
          <a [href]="prData.url" target="_blank" class="pr-link">#PR-Status</a>
        </div>
      }

      <div class="env-switcher">
        <span class="badge" [class.active]="currentEnv === 'dev'" (click)="envSwap('dev')"
          >DEV</span
        >
        <span class="badge" [class.active]="currentEnv === 'stg'" (click)="envSwap('stg')"
          >STG</span
        >
        <span class="badge" [class.active]="currentEnv === 'prod'" (click)="envSwap('prod')"
          >PROD</span
        >
      </div>

      @if (hasConflicts) {
        <div class="merge-guard">
          <span class="conflict-alert">⚠️ Merge Conflicts Detected</span>
          <button class="btn-resolve">Resolve visually</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .git-toolbar {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 0 16px;
        height: 40px;
        background: #1e1e2e;
        color: white;
        font-size: 13px;
        font-family: monospace;

        .branch-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          transition: background 0.2s;
          &:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        }

        .env-switcher {
          display: flex;
          gap: 4px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          padding: 2px;
          .badge {
            padding: 2px 8px;
            cursor: pointer;
            border-radius: 2px;
            color: #a4b0be;
            transition: all 0.2s;
            &.active {
              background: var(--af-primary, #ff6d5a);
              color: white;
              font-weight: bold;
            }
            &:hover:not(.active) {
              color: white;
            }
          }
        }

        .pr-status {
          display: flex;
          align-items: center;
          gap: 8px;
          .badge {
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            background: #34495e;
          }
          .pr-link {
            color: var(--af-secondary, #6c5ce7);
            text-decoration: none;
            &:hover {
              text-decoration: underline;
            }
          }
        }

        .merge-guard {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          .conflict-alert {
            color: var(--af-warning, #fdcb6e);
            font-weight: bold;
          }
          .btn-resolve {
            background: white;
            color: black;
            border: none;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-family: inherit;
            font-weight: bold;
          }
        }
      }
    `,
  ],
})
export class GitToolbarComponent implements OnInit {
  private http = inject(HttpClient);

  public branches: GitBranch[] = [
    { name: 'main', isCurrent: true, ahead: 0, behind: 0 },
    { name: 'feature/stripe-webhook', isCurrent: false, ahead: 2, behind: 0 },
  ];
  public isDropdownOpen = false;
  public prData: any = null;
  public hasConflicts = false;
  public currentEnv = 'dev';

  ngOnInit() {
    this.refreshGitStatus();
  }

  currentBranch() {
    return this.branches.find((b) => b.isCurrent);
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  envSwap(env: string) {
    this.currentEnv = env;
    console.log('Swapped to environment overlay:', env);
  }

  refreshGitStatus() {
    this.http.get<GitBranch[]>('/api/v1/git/branches').subscribe({
      next: (b) => (this.branches = b),
      error: () => {
        /* use mock data */
      },
    });
  }
}
