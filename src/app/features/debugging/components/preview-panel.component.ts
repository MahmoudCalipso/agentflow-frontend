import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { GraphDefinition, ExecutionPreview } from '../../../models/agentflow-api';

@Component({
    selector: 'af-preview-panel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './preview-panel.component.html',
    styleUrls: ['./preview-panel.component.scss']
})
export class PreviewPanelComponent implements OnChanges {
    @Input() graph!: GraphDefinition;
    @Output() executeClicked = new EventEmitter<void>();

    private api = inject(ApiService);

    public preview: ExecutionPreview | null = null;
    public loading: boolean = false;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['graph'] && this.graph && this.graph.nodes.length > 0) {
            this.refreshPreview();
        }
    }

    public refreshPreview() {
        this.loading = true;
        (this.api as any).previewExecution(this.graph).subscribe({
            next: (res: any) => {
                this.preview = res;
                this.loading = false;
            },
            error: (err: any) => {
                this.preview = null;
                this.loading = false;
            }
        });
    }

    public get confidenceColor(): string {
        if (!this.preview) return '';
        if (this.preview.success_probability > 0.9) return 'success';
        if (this.preview.success_probability > 0.7) return 'warning';
        return 'danger';
    }
}
