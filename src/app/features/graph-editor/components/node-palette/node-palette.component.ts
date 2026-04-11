import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { NodeDefinition } from '../../../../models/agentflow-api';

interface CategoryGroup {
  name: string;
  nodes: NodeDefinition[];
  expanded: boolean;
}

@Component({
  selector: 'af-node-palette',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './node-palette.component.html',
  styleUrls: ['./node-palette.component.scss'],
})
export class NodePaletteComponent implements OnInit {
  private api = inject(ApiService);

  public searchQuery: string = '';
  public categories: CategoryGroup[] = [];
  public loading: boolean = true;

  private allNodes: NodeDefinition[] = [];

  ngOnInit() {
    this.api.getNodes().subscribe({
      next: (nodes) => {
        this.allNodes = nodes;
        this.groupNodes(nodes);
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to fetch node definitions', err);
        this.loading = false;
      },
    });
  }

  public filterNodes() {
    if (!this.searchQuery.trim()) {
      this.groupNodes(this.allNodes);
      return;
    }

    const query = this.searchQuery.toLowerCase();
    const filtered = this.allNodes.filter(
      (n) =>
        n.name.toLowerCase().includes(query) ||
        n.type.toLowerCase().includes(query) ||
        (n.description && n.description.toLowerCase().includes(query)),
    );
    this.groupNodes(filtered);

    // Auto-expand all categories when searching
    this.categories.forEach((c) => (c.expanded = true));
  }

  public toggleCategory(category: CategoryGroup) {
    category.expanded = !category.expanded;
  }

  public onDragStart(event: DragEvent, nodeType: string) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/json', JSON.stringify({ type: nodeType }));
      event.dataTransfer.effectAllowed = 'copy';

      const el = event.target as HTMLElement;
      el.classList.add('dragging');
    }
  }

  public onDragEnd(event: DragEvent) {
    const el = event.target as HTMLElement;
    el.classList.remove('dragging');
  }

  private groupNodes(nodes: NodeDefinition[]) {
    const map = new Map<string, NodeDefinition[]>();
    for (const node of nodes) {
      const cat = node.category || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(node);
    }

    this.categories = Array.from(map.entries())
      .map(([name, items]) => ({
        name,
        nodes: items.sort((a, b) => a.name.localeCompare(b.name)),
        expanded: true,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
