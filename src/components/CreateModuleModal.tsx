'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { CustomFieldDefinition } from '@/types';
import { Plus, X, Layers, Trash2, CheckCircle2 } from 'lucide-react';

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleCreated: (moduleSlug: string) => void;
}

export const CreateModuleModal: React.FC<CreateModuleModalProps> = ({
  isOpen,
  onClose,
  onModuleCreated,
}) => {
  const { createModule } = useTenant();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<CustomFieldDefinition[]>([
    { id: 'f_1', key: 'name', label: 'Record Name / Title', type: 'text', required: true },
  ]);

  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<'text' | 'number' | 'select' | 'date'>('text');
  const [fieldOptions, setFieldOptions] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddField = () => {
    if (!fieldLabel.trim()) return;
    const key = fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const optionsArray =
      fieldType === 'select'
        ? fieldOptions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    setFields([
      ...fields,
      {
        id: `f_${Date.now()}`,
        key,
        label: fieldLabel.trim(),
        type: fieldType,
        options: optionsArray,
        required: fieldRequired,
      },
    ]);

    setFieldLabel('');
    setFieldOptions('');
    setFieldRequired(false);
  };

  const handleRemoveField = (id: string) => {
    if (fields.length <= 1) return;
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const success = await createModule(name.trim(), description.trim(), 'Layers', fields);
      if (success) {
        onModuleCreated(slug);
        onClose();
      }
    } catch (err) {
      console.error('Error creating module:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95 text-xs text-slate-800">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Create New CRM Module (Zoho Style)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Module Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vendors, Flights, Costing Requests"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Manage supplier contracts & flight details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Module Fields Designer */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">
              Module Layout Fields ({fields.length})
            </label>

            <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-200 rounded p-1.5 bg-slate-50">
              {fields.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-1.5 rounded bg-white border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-800">{f.label}</span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded font-mono uppercase">
                      {f.type}
                    </span>
                    {f.required && (
                      <span className="text-[9px] text-rose-600 bg-rose-50 px-1 py-0.2 rounded font-semibold">
                        Mandatory
                      </span>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveField(f.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Field Section */}
            <div className="rounded border border-blue-100 bg-blue-50/50 p-2.5 space-y-2">
              <div className="font-bold text-blue-900 text-[11px]">+ Add Field to Module Layout</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Field Label (e.g. Cost, Status, Contact)"
                    value={fieldLabel}
                    onChange={(e) => setFieldLabel(e.target.value)}
                    className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs"
                  />
                </div>
                <div>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="number">Number / Amount</option>
                    <option value="select">Dropdown Select</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>

              {fieldType === 'select' && (
                <input
                  type="text"
                  placeholder="Options separated by commas (e.g. Active, Pending, Closed)"
                  value={fieldOptions}
                  onChange={(e) => setFieldOptions(e.target.value)}
                  className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs"
                />
              )}

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fieldRequired}
                    onChange={(e) => setFieldRequired(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 h-3 w-3"
                  />
                  <span>Mandatory</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddField}
                  disabled={!fieldLabel.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2 py-0.5 text-xs rounded transition-colors disabled:opacity-50"
                >
                  + Add Field
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Module...' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
