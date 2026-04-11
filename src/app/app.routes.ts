import { Routes } from '@angular/router';
import { MarketplaceComponent } from './features/marketplace/components/marketplace/marketplace.component';
import { EditorLayoutComponent } from './features/graph-editor/components/editor-layout/editor-layout.component';

export const routes: Routes = [
    { path: '', component: EditorLayoutComponent },
    { path: 'marketplace', component: MarketplaceComponent },
    { path: '**', redirectTo: '' }
];
