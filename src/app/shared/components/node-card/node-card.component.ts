import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NodeViewModel {
    id: string;
    type: string;
    label: string;
    category: string;
    status?: 'idle' | 'running' | 'success' | 'failed' | 'retry';
    hasErrors?: boolean;
}

@Component({
    selector: 'af-node-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './node-card.component.html',
    styleUrls: ['./node-card.component.scss']
})
export class NodeCardComponent {
    @Input() node!: NodeViewModel;
    @Input() isSelected: boolean = false;
    @Output() nodeClicked = new EventEmitter<NodeViewModel>();

    onNodeClick(event: MouseEvent) {
        event.stopPropagation();
        this.nodeClicked.emit(this.node);
    }

    get statusClass(): string {
        if (this.node?.status) {
            return `status-${this.node.status}`;
        }
        return '';
    }
}
