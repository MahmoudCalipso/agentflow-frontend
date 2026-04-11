import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyFieldConfig } from '@ngx-formly/core';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'af-config-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule],
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss'],
})
export class ConfigFormComponent implements OnChanges {
  @Input() nodeId!: string;
  @Input() config: any = {};

  private api = inject(ApiService);

  public form = new FormGroup({});
  public fields: FormlyFieldConfig[] = [];
  public model: any = {};
  public loading = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['nodeId'] && this.nodeId) {
      this.loadSchema();
    }
  }

  private loadSchema() {
    this.loading = true;
    (this.api as any).getNodeSchema(this.nodeId).subscribe({
      next: (schema: any) => {
        this.fields = this.mapJsonSchemaToFormly(schema);
        this.model = { ...this.config };
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load schema for node:', this.nodeId, err);
        this.loading = false;
      },
    });
  }

  private mapJsonSchemaToFormly(schema: any): FormlyFieldConfig[] {
    const fields: FormlyFieldConfig[] = [];
    if (!schema.properties) return fields;

    for (const key of Object.keys(schema.properties)) {
      const prop = schema.properties[key];

      const field: FormlyFieldConfig = {
        key: key,
        type: this.getFormlyType(prop),
        templateOptions: {
          label: prop.title || key,
          description: prop.description,
          required: schema.required?.includes(key),
          placeholder: prop.default?.toString() || '',
        },
      };

      if (prop.format === 'password') {
        field.type = 'input';
        field.templateOptions!.type = 'password';
      }

      if (field.type === 'textarea') {
        field.templateOptions!.rows = 8;
        field.templateOptions!.attributes = {
          style: 'font-family: monospace; white-space: pre;'
        };
      }

      if (prop.enum) {
        field.type = 'select';
        field.templateOptions!.options = prop.enum.map((e: string) => ({ label: e, value: e }));
      }

      fields.push(field);
    }

    return fields;
  }

  private getFormlyType(prop: any): string {
    if (prop.format === 'textarea' || prop.format === 'code' || prop['x-editor']) return 'textarea';

    switch (prop.type) {
      case 'string':
        return 'input';
      case 'number':
      case 'integer':
        return 'input'; // use input type="number" in templateOptions usually
      case 'boolean':
        return 'checkbox';
      case 'object':
      case 'json':
        return 'textarea';
      default:
        return 'input';
    }
  }

  public onSubmit() {
    if (this.form.valid) {
      console.log('Form saved:', this.model);
    }
  }
}
