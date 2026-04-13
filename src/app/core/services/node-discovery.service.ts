import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { NodeDefinition } from '../../models/agentflow-api';
import { take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class NodeDiscoveryService {
    public nodes = signal<NodeDefinition[]>([]);
    public loading = signal<boolean>(false);

    constructor(private api: ApiService) { }

    public refresh() {
        this.loading.set(true);
        this.api.getNodes().pipe(take(1)).subscribe({
            next: (nodes) => {
                this.nodes.set(nodes);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
        });
    }
}
