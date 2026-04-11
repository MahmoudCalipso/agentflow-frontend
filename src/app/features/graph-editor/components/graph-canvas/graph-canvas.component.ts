import { Component, ElementRef, ViewChild, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeCardComponent, NodeViewModel } from '../../../../shared/components/node-card/node-card.component';
import { ApiService } from '../../../../core/services/api.service';
import { GraphDefinition, NodeConfig, EdgeConfig } from '../../../../models/agentflow-api';

interface ViewState {
    x: number;
    y: number;
    scale: number;
}

@Component({
    selector: 'af-graph-canvas',
    standalone: true,
    imports: [CommonModule, NodeCardComponent],
    templateUrl: './graph-canvas.component.html',
    styleUrls: ['./graph-canvas.component.scss']
})
export class GraphCanvasComponent implements OnInit {
    @ViewChild('graphContainer', { static: true }) container!: ElementRef<HTMLDivElement>;

    private api = inject(ApiService);

    public nodes: NodeConfig[] = [];
    public edges: EdgeConfig[] = [];
    public view: ViewState = { x: 0, y: 0, scale: 1 };
    public selectedNodeId: string | null = null;

    private isDraggingContext = false;
    private lastMousePos = { x: 0, y: 0 };
    private draggingNode: NodeConfig | null = null;

    // Edge drawing state
    public isDrawingEdge = false;
    public draftEdgeStart: { x: number, y: number, nodeId: string, port: string } | null = null;
    public draftEdgeEnd: { x: number, y: number } | null = null;

    ngOnInit() {
        // Initialize empty canvas
    }

    // --- Workspace Panning & Zooming ---
    @HostListener('wheel', ['$event'])
    onWheel(e: WheelEvent) {
        if (e.ctrlKey || e.metaKey) {
            // Zoom
            e.preventDefault();
            const zoomFactor = 0.05;
            const delta = e.deltaY > 0 ? -zoomFactor : zoomFactor;
            let newScale = this.view.scale + delta;
            newScale = Math.max(0.2, Math.min(newScale, 3));
            this.view.scale = newScale;
        } else {
            // Pan
            this.view.x -= e.deltaX;
            this.view.y -= e.deltaY;
        }
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(e: MouseEvent) {
        if (e.target === this.container.nativeElement || (e.target as HTMLElement).tagName === 'svg') {
            this.isDraggingContext = true;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.selectedNodeId = null;
        }
    }

    @HostListener('mousemove', ['$event'])
    onMouseMove(e: MouseEvent) {
        if (this.isDraggingContext) {
            const dx = e.clientX - this.lastMousePos.x;
            const dy = e.clientY - this.lastMousePos.y;
            this.view.x += dx;
            this.view.y += dy;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        } else if (this.draggingNode) {
            const dx = (e.clientX - this.lastMousePos.x) / this.view.scale;
            const dy = (e.clientY - this.lastMousePos.y) / this.view.scale;
            this.draggingNode.position.x += dx;
            this.draggingNode.position.y += dy;
            this.lastMousePos = { x: e.clientX, y: e.clientY };
        } else if (this.isDrawingEdge && this.draftEdgeStart) {
            // Screen coordinates mapped to SVG space
            const rect = this.container.nativeElement.getBoundingClientRect();
            this.draftEdgeEnd = {
                x: (e.clientX - rect.left - this.view.x) / this.view.scale,
                y: (e.clientY - rect.top - this.view.y) / this.view.scale
            };
        }
    }

    @HostListener('mouseup')
    onMouseUp() {
        this.isDraggingContext = false;
        this.draggingNode = null;
        if (this.isDrawingEdge) {
            this.isDrawingEdge = false;
            this.draftEdgeStart = null;
            this.draftEdgeEnd = null;
        }
    }

    // --- Drag and Drop from Palette ---
    @HostListener('dragover', ['$event'])
    onDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy';
        }
    }

    @HostListener('drop', ['$event'])
    onDrop(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.type) {
                    const rect = this.container.nativeElement.getBoundingClientRect();
                    const dropX = (e.clientX - rect.left - this.view.x) / this.view.scale;
                    const dropY = (e.clientY - rect.top - this.view.y) / this.view.scale;

                    this.addNode(data.type, dropX, dropY);
                }
            } catch (err) { }
        }
    }

    private addNode(type: string, x: number, y: number) {
        const id = `node_${Date.now()}`;
        this.nodes.push({
            id,
            type,
            label: type,
            position: { x, y },
            config: {}
        });
        this.selectedNodeId = id;
        this.syncGraph();
    }

    // --- Node & Edge Interactions ---
    public onNodeSelected(node: any) {
        this.selectedNodeId = node.id;
    }

    public onNodeMouseDown(e: MouseEvent, node: NodeConfig) {
        e.stopPropagation();
        this.selectedNodeId = node.id;
        this.draggingNode = node;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
    }

    public onPortMouseDown(e: MouseEvent, nodeId: string, port: string, isOutput: boolean) {
        e.stopPropagation();
        if (isOutput) {
            this.isDrawingEdge = true;
            const rect = this.container.nativeElement.getBoundingClientRect();
            const portEl = e.target as HTMLElement;
            const portRect = portEl.getBoundingClientRect();

            const startX = (portRect.left + portRect.width / 2 - rect.left - this.view.x) / this.view.scale;
            const startY = (portRect.top + portRect.height / 2 - rect.top - this.view.y) / this.view.scale;

            this.draftEdgeStart = { x: startX, y: startY, nodeId, port };
            this.draftEdgeEnd = { x: startX, y: startY };
        }
    }

    public onPortMouseUp(e: MouseEvent, nodeId: string, port: string, isInput: boolean) {
        e.stopPropagation();
        if (this.isDrawingEdge && this.draftEdgeStart && isInput) {
            // Create connection
            if (this.draftEdgeStart.nodeId !== nodeId) {
                this.edges.push({
                    sourceNodeId: this.draftEdgeStart.nodeId,
                    sourcePort: this.draftEdgeStart.port,
                    targetNodeId: nodeId,
                    targetPort: port
                });
                this.syncGraph();
            }
        }
        this.isDrawingEdge = false;
        this.draftEdgeStart = null;
        this.draftEdgeEnd = null;
    }

    public getMapTransform(): string {
        return `translate(${this.view.x}px, ${this.view.y}px) scale(${this.view.scale})`;
    }

    // Calculate Bezier Curve path
    public getEdgePath(edge: EdgeConfig): string {
        // In a real implementation this measures actual port DOM elements bounds
        // For scaffolding, we approximate based on node coordinates assuming fixed size
        const srcNode = this.nodes.find(n => n.id === edge.sourceNodeId);
        const tgtNode = this.nodes.find(n => n.id === edge.targetNodeId);
        if (!srcNode || !tgtNode) return '';

        // Approximation: Right side of source node, Left side of target node
        const srcX = srcNode.position.x + 240;
        const srcY = srcNode.position.y + 40;
        const tgtX = tgtNode.position.x;
        const tgtY = tgtNode.position.y + 40;

        return this.calculateBezier(srcX, srcY, tgtX, tgtY);
    }

    public getDraftEdgePath(): string {
        if (!this.draftEdgeStart || !this.draftEdgeEnd) return '';
        return this.calculateBezier(
            this.draftEdgeStart.x, this.draftEdgeStart.y,
            this.draftEdgeEnd.x, this.draftEdgeEnd.y
        );
    }

    private calculateBezier(x1: number, y1: number, x2: number, y2: number): string {
        const tension = Math.max(Math.abs(x2 - x1) * 0.5, 50);
        return `M ${x1} ${y1} C ${x1 + tension} ${y1}, ${x2 - tension} ${y2}, ${x2} ${y2}`;
    }

    private syncGraph() {
        const graphDiff: GraphDefinition = {
            id: 'active_draft',
            name: 'AgentFlow Draft',
            nodes: this.nodes,
            edges: this.edges
        };

        // Call backend validation optimally (debounced)
        this.api.validateGraph(graphDiff).subscribe({
            next: (res) => {
                // e.g. Highlighting invalid connections red
                if (!res.isValid) console.warn('Graph invalid', res.errors);
            }
        });
    }
}
