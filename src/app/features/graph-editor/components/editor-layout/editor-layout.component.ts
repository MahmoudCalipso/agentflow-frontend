import { Component } from '@angular/core';

import { GraphCanvasComponent } from '../graph-canvas/graph-canvas.component';
import { NodePaletteComponent } from '../node-palette/node-palette.component';
import { ExecutionControlsComponent } from '../toolbar/execution-controls.component';
import { AiCopilotPanelComponent } from '../ai-copilot/ai-copilot.component';
import { TraceVisualizerComponent } from '../inspector-panel/trace-visualizer.component';

@Component({
  selector: 'af-editor-layout',
  standalone: true,
  imports: [
    GraphCanvasComponent,
    NodePaletteComponent,
    ExecutionControlsComponent,
    AiCopilotPanelComponent,
    TraceVisualizerComponent,
  ],
  templateUrl: './editor-layout.component.html',
  styleUrls: ['./editor-layout.component.scss'],
})
export class EditorLayoutComponent {}
