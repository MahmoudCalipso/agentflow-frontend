import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';

export interface ExecutionDelta {
    correlationId: string;
    nodeId: string;
    eventType: 'started' | 'completed' | 'failed' | 'retry' | 'stream_chunk';
    timestamp: string;
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection: signalR.HubConnection | null = null;
    private executionSubject = new Subject<ExecutionDelta>();

    public execution$ = this.executionSubject.asObservable();

    public async initiateConnection(): Promise<void> {
        if (this.hubConnection) {
            return;
        }

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/hub/execution')
            .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Exponential backoff
            .build();

        this.hubConnection.on('ReceiveDelta', (delta: ExecutionDelta) => {
            this.executionSubject.next(delta);
        });

        try {
            await this.hubConnection.start();
            console.log('SignalR ExecutionHub connection established.');
        } catch (err) {
            console.error('Error while establishing SignalR connection: ', err);
            // Let standard interceptors/reconnection handle recovery
        }
    }

    public async subscribeToExecution(correlationId: string): Promise<void> {
        if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
            await this.hubConnection.invoke('SubscribeToExecution', correlationId);
        } else {
            console.warn('Cannot subscribe to execution; hub connection is not active.');
        }
    }

    public async closeConnection(): Promise<void> {
        if (this.hubConnection) {
            await this.hubConnection.stop();
            this.hubConnection = null;
        }
    }
}
