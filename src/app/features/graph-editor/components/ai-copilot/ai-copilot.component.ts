import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../../core/services/api.service';
import { GraphDefinition } from '../../../../models/agentflow-api';

interface ChatMessage {
    role: 'user' | 'ai';
    text: string;
    isStreaming?: boolean;
}

@Component({
    selector: 'af-ai-copilot',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ai-copilot.component.html',
    styleUrls: ['./ai-copilot.component.scss']
})
export class AiCopilotPanelComponent {
    private api = inject(ApiService);

    @Output() graphGenerated = new EventEmitter<GraphDefinition>();

    public messages: ChatMessage[] = [
        { role: 'ai', text: 'Hi! I am the AgentFlow Copilot. Describe the workflow you want to build (e.g. "Create a workflow that listens for Stripe Webhooks, checks if it is a failed payment, updates MongoDB, and pings me on Slack").' }
    ];
    public promptText: string = '';
    public isGenerating = false;

    public async submitPrompt() {
        if (!this.promptText.trim() || this.isGenerating) return;

        const userText = this.promptText;
        this.promptText = '';

        this.messages.push({ role: 'user', text: userText });
        this.isGenerating = true;

        const aiMsg: ChatMessage = { role: 'ai', text: 'Thinking...', isStreaming: true };
        this.messages.push(aiMsg);

        this.api.compileNlToGraph(userText).subscribe({
            next: (graph) => {
                aiMsg.text = `I've generated the workflow "${graph.name}". Review it on the canvas and deploy when ready!`;
                aiMsg.isStreaming = false;
                this.isGenerating = false;

                this.graphGenerated.emit(graph);
            },
            error: (err) => {
                console.error('Compilation failed', err);
                aiMsg.text = 'Sorry, there was an error analyzing your request. Can you try rephrasing it?';
                aiMsg.isStreaming = false;
                this.isGenerating = false;
            }
        });
    }

    public onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.submitPrompt();
        }
    }
}
