import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SignalRService, ExecutionDelta } from '../../../../core/services/signalr.service';
import { ApiService } from '../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'af-trace-visualizer',
    standalone: true,
    imports: [CommonModule],
    providers: [DatePipe],
    templateUrl: './trace-visualizer.component.html',
    styleUrls: ['./trace-visualizer.component.scss']
})
export class TraceVisualizerComponent implements OnInit {
    @Input() executionId!: string;

    private signalR = inject(SignalRService);
    private api = inject(ApiService);

    public traces: ExecutionDelta[] = [];
    public selectedTrace: ExecutionDelta | null = null;
    public loading = false;

    async ngOnInit() {
        if (this.executionId) {
            await this.loadHistoricalExecution();
        }

        // Subscribe to live deltas if execution is ongoing
        this.signalR.execution$.subscribe(delta => {
            if (delta.correlationId === this.executionId) {
                this.traces.push(delta);
            }
        });
    }

    private async loadHistoricalExecution() {
        this.loading = true;
        this.api.getReplay(this.executionId).subscribe({
            next: (events) => {
                this.traces = events.map(e => ({
                    correlationId: e.executionId,
                    nodeId: e.nodeId,
                    eventType: e.status,
                    timestamp: e.timestamp,
                    data: e.data
                }));
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load trace history', err);
                this.loading = false;
            }
        });
    }

    public selectTrace(trace: ExecutionDelta) {
        this.selectedTrace = trace;
    }

    public formatData(data: any): string {
        if (!data) return 'No output data.';
        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    }
}
