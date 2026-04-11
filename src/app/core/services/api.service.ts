import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    NodeDefinition,
    ValidationReport,
    ExecutionStartResponse,
    GraphDefinition,
    CostBreakdown,
    ExecutionPreview,
    PolicyDefinition,
    NodePackage
} from '../../models/agentflow-api';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private readonly baseUrl = '/api/v1';

    // Nodes
    getNodes(): Observable<NodeDefinition[]> {
        return this.http.get<NodeDefinition[]>(`${this.baseUrl}/nodes`);
    }

    getNodeSchema(nodeId: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/nodes/${nodeId}/schema`);
    }

    // Execution & Validation
    validateGraph(graph: GraphDefinition): Observable<ValidationReport> {
        return this.http.post<ValidationReport>(`${this.baseUrl}/validate`, graph);
    }

    validateField(nodeId: string, field: string, value: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/validate/field`, { nodeId, field, value });
    }

    executeWorkflow(graph: GraphDefinition): Observable<ExecutionStartResponse> {
        return this.http.post<ExecutionStartResponse>(`${this.baseUrl}/execute`, graph);
    }

    previewExecution(graph: GraphDefinition): Observable<ExecutionPreview> {
        return this.http.post<ExecutionPreview>(`${this.baseUrl}/preview`, graph);
    }

    // Debug & Replay
    getReplay(id: string, from?: string, to?: string): Observable<any[]> {
        const params: any = {};
        if (from) params.from = from;
        if (to) params.to = to;
        return this.http.get<any[]>(`${this.baseUrl}/replay/${id}`, { params });
    }

    getDebugInfo(nodeId: string): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/nodes/${nodeId}/debug`);
    }

    // AI Copilot
    compileNlToGraph(prompt: string): Observable<GraphDefinition> {
        return this.http.post<GraphDefinition>(`${this.baseUrl}/compile/nl`, { prompt });
    }

    // Cost Tracking
    getCosts(workflowId?: string): Observable<CostBreakdown> {
        const params: any = {};
        if (workflowId) params.workflow_id = workflowId;
        return this.http.get<CostBreakdown>(`${this.baseUrl}/costs`, { params });
    }

    // Policies
    getPolicy(nodeId: string): Observable<PolicyDefinition> {
        return this.http.get<PolicyDefinition>(`${this.baseUrl}/policies/${nodeId}`);
    }

    updatePolicy(nodeId: string, policy: PolicyDefinition): Observable<PolicyDefinition> {
        return this.http.put<PolicyDefinition>(`${this.baseUrl}/policies/${nodeId}`, policy);
    }

    // Secrets
    resolveSecret(secretId: string): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}/secrets/resolve`, { secretId });
    }

    // Marketplace
    getMarketplaceNodes(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/marketplace/nodes`);
    }

    getMarketplacePackage(id: string, version: string): Observable<NodePackage> {
        return this.http.get<NodePackage>(`${this.baseUrl}/marketplace/${id}/${version}`);
    }
}
