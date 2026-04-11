export interface NodeDefinition {
    id: string;
    type: string;
    name: string;
    category: string;
    version: string;
    description?: string;
    icon?: string;
    inputs: PortDefinition[];
    outputs: PortDefinition[];
    configSchema: Record<string, any>;
    metadata: Record<string, any>;
}

export interface PortDefinition {
    id: string;
    name: string;
    type: 'main' | 'error' | 'any' | string;
}

export interface GraphDefinition {
    id: string;
    name: string;
    nodes: NodeConfig[];
    edges: EdgeConfig[];
}

export interface NodeConfig {
    id: string;
    type: string;
    label?: string;
    position: { x: number; y: number };
    config: Record<string, any>;
}

export interface EdgeConfig {
    sourceNodeId: string;
    sourcePort: string;
    targetNodeId: string;
    targetPort: string;
}

export interface ValidationReport {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface ExecutionStartResponse {
    executionId: string;
    status: string;
}

export interface CostBreakdown {
    tenantId: string;
    totalCost: number;
    usage: any[];
}

export interface ExecutionPreview {
    workflow_id: string;
    valid: boolean;
    validation_errors: string[];
    node_count: number;
    edge_count: number;
    ai_node_count: number;
    estimated_latency_ms: number;
    estimated_cost_usd: number;
    success_probability: number;
    generated_at: string;
}

export interface PullRequest {
    id: string;
    url: string;
    status: string;
}

export interface PolicyDefinition {
    nodeId: string;
    allowedNetworkHosts: string[];
    preventPii: boolean;
    requireAudit: boolean;
}

export interface NodePackage {
    id: string;
    version: string;
    verified: boolean;
    sbomUrl: string;
    url: string;
}
