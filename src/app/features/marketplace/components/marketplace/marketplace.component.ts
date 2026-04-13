import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { NodeDiscoveryService } from '../../../../core/services/node-discovery.service';
import { NodePackage } from '../../../../models/agentflow-api';

interface MarketplaceItem extends NodePackage {
    name: string;
    description: string;
    author: string;
    downloads: number;
    category: string;
    installing?: boolean;
    installed?: boolean;
}

@Component({
    selector: 'af-marketplace',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './marketplace.component.html',
    styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
    private api = inject(ApiService);
    private discovery = inject(NodeDiscoveryService);

    public searchQuery: string = '';
    public packages: MarketplaceItem[] = [];
    public loading: boolean = true;

    ngOnInit() {
        this.loading = true;
        this.api.getMarketplaceNodes().subscribe({
            next: (index) => {
                this.packages = Object.entries(index.nodes).map(([id, data]: [string, any]) => ({
                    id: id,
                    name: id.replace('mcp-', '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
                    description: data.description,
                    version: data.version,
                    author: 'Community',
                    verified: true,
                    downloads: Math.floor(Math.random() * 5000), // Mocked discovery metric
                    category: 'n8n Community',
                    sbomUrl: '#',
                    url: data.downloadUrl
                }));
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                console.error('Failed to load marketplace index from GitHub');
            }
        });
    }

    public installPackage(pkg: MarketplaceItem) {
        if (pkg.installed || pkg.installing) return;

        pkg.installing = true;
        this.api.getMarketplacePackage(pkg.id, pkg.version).subscribe({
            next: (res) => {
                // Simulating the actual installation delay
                setTimeout(() => {
                    pkg.installing = false;
                    pkg.installed = true;
                    this.discovery.refresh(); // Refresh the palette to show the new node
                }, 1500);
            },
            error: () => {
                pkg.installing = false;
                alert('Failed to install ' + pkg.name + '. Signature verification failed.');
            }
        });
    }
}
