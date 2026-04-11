import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api.service';
import { SignalRService, ExecutionDelta } from '../../../../core/services/signalr.service';
import { GraphDefinition } from '../../../../models/agentflow-api';
import { Subscription } from 'rxjs';

export type ExecutionState = 'idle' | 'running' | 'paused' | 'failed' | 'success';

@Component({
    selector: 'af-execution-controls',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './execution-controls.component.html',
    styleUrls: ['./execution-controls.component.scss']
})
export class ExecutionControlsComponent implements OnInit {
    @Input() graph!: GraphDefinition;

    @Output() runStarted = new EventEmitter<string>();
    @Output() executionUpdate = new EventEmitter<ExecutionDelta>();

    private api = inject(ApiService);
    private signalR = inject(SignalRService);

    public state: ExecutionState = 'idle';
    public currentExecutionId: string | null = null;
    public elapsedTime: number = 0;

    private timerInt: any;
    private streamSub!: Subscription;

    async ngOnInit() {
        await this.signalR.initiateConnection();
        this.streamSub = this.signalR.execution$.subscribe(delta => {
            this.handleDelta(delta);
        });
    }

    ngOnDestroy() {
        if (this.streamSub) this.streamSub.unsubscribe();
        if (this.timerInt) clearInterval(this.timerInt);
    }

    public async runWorkflow() {
        if (this.state === 'running') return;

        this.state = 'running';
        this.startTimer();

        this.api.executeWorkflow(this.graph).subscribe({
            next: async (res) => {
                this.currentExecutionId = res.executionId;
                this.runStarted.emit(res.executionId);
                await this.signalR.subscribeToExecution(res.executionId);
            },
            error: (err) => {
                console.error('Execution invocation failed', err);
                this.failWorkflow();
            }
        });
    }

    public stopWorkflow() {
        if (this.state !== 'running') return;

        // In a real app we'd dispatch a cancellation signal, but for UI sake we'll just stop
        this.failWorkflow();
    }

    public pauseWorkflow() {
        // Scaffold UI logic for pause
        this.state = 'paused';
        clearInterval(this.timerInt);
    }

    public replayExecution() {
        if (!this.currentExecutionId) return;
        // Just re-triggers the visual replay for now
        this.api.getReplay(this.currentExecutionId).subscribe(events => {
            console.log('Replaying historical events', events);
        });
    }

    private handleDelta(delta: ExecutionDelta) {
        if (delta.correlationId !== this.currentExecutionId) return;

        this.executionUpdate.emit(delta);

        // If final terminating events from ExecutionEngine
        if (delta.eventType === 'completed' && delta.nodeId === 'workflow') {
            this.finishWorkflow('success');
        } else if (delta.eventType === 'failed' && delta.nodeId === 'workflow') {
            this.failWorkflow();
        }
    }

    private startTimer() {
        this.elapsedTime = 0;
        if (this.timerInt) clearInterval(this.timerInt);
        this.timerInt = setInterval(() => {
            this.elapsedTime += 0.1;
        }, 100);
    }

    private finishWorkflow(endState: ExecutionState) {
        this.state = endState;
        clearInterval(this.timerInt);
    }

    private failWorkflow() {
        this.finishWorkflow('failed');
    }

    public formatTime(sec: number): string {
        return `${sec.toFixed(1)}s`;
    }
}
