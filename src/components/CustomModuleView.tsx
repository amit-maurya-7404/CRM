'use client';

import React, { useState, useMemo } from 'react';
import { CustomModule, CustomFieldDefinition } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Sliders,
  Trash2,
  Edit2,
  Layers,
  ChevronDown,
  Download,
  Filter,
  Check,
  X,
  FileText,
  Building,
  Car,
  MapPin,
  CalendarCheck,
  Compass,
} from 'lucide-react';

interface CustomModuleViewProps {
  moduleSlug: string;
}

export const CustomModuleView: React.FC<CustomModuleViewProps> = ({ moduleSlug }) => {
  const { currentOrg, currencySymbol, addModuleRecord, deleteModuleRecord, updateModuleLayout, getModuleLayout } = useTenant();

  // Find module in current tenant
  const currentModule: CustomModule | undefined = useMemo(() => {
    return (currentOrg?.modules || []).find((m) => m.slug === moduleSlug);
  }, [currentOrg, moduleSlug]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLayoutBuilderOpen, setIsLayoutBuilderOpen] = useState(false);

  // New Record Form State
  const [newRecordData, setNewRecordData] = useState<Record<string, any>>({});
  const [isSubmittingRecord, setIsSubmittingRecord] = useState(false);

  // Layout Builder State
  const [fields, setFields] = useState<CustomFieldDefinition[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select' | 'date'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [isSavingLayout, setIsSavingLayout] = useState(false);

  // Sync fields when module changes or layout is saved
  React.useEffect(() => {
    if (currentModule) {
      const layout = getModuleLayout(currentModule.slug);
      if (layout && layout.length > 0) {
        const flat: CustomFieldDefinition[] = [];
        layout.forEach((sec) => {
          [...sec.leftFields, ...sec.rightFields].forEach((f) => {
            flat.push({
              id: f.id,
              key: f.key,
              label: f.label,
              type: f.type as any,
              required: f.required,
              options: f.options,
            });
          });
        });
        if (flat.length > 0) {
          setFields(flat);
          return;
        }
      }
      setFields(currentModule.fields || []);
    }
  }, [currentModule, getModuleLayout]);

  // Real-time listener for layout changes from Settings
  React.useEffect(() => {
    const handleLayoutUpdate = (e: any) => {
      if (currentModule && e.detail?.moduleSlug === currentModule.slug && e.detail.sections) {
        const flat: CustomFieldDefinition[] = [];
        e.detail.sections.forEach((sec: any) => {
          [...sec.leftFields, ...sec.rightFields].forEach((f: any) => {
            flat.push({
              id: f.id,
              key: f.key,
              label: f.label,
              type: f.type as any,
              required: f.required,
              options: f.options,
            });
          });
        });
        if (flat.length > 0) setFields(flat);
      }
    };
    window.addEventListener('module_layout_updated', handleLayoutUpdate);
    return () => window.removeEventListener('module_layout_updated', handleLayoutUpdate);
  }, [currentModule]);

  if (!currentModule) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white p-8 text-center text-slate-500 text-xs">
        Module not found. Please select a valid module from the left sidebar.
      </div>
    );
  }

  // Filter records
  const records = currentModule.records || [];
  const filteredRecords = records.filter((rec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(rec).some((val) => String(val).toLowerCase().includes(q));
  });

  // Handle Create Record
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingRecord(true);
      const success = await addModuleRecord(currentModule.slug, newRecordData);
      if (success) {
        setNewRecordData({});
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating record:', err);
    } finally {
      setIsSubmittingRecord(false);
    }
  };

  // Handle Delete Record
  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    await deleteModuleRecord(currentModule.slug, recordId);
  };

  // Add Field in Layout Builder
  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    const key = newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const optionsArray =
      newFieldType === 'select'
        ? newFieldOptions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined;

    const newField: CustomFieldDefinition = {
      id: `f_${Date.now()}`,
      key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      options: optionsArray,
      required: newFieldRequired,
    };

    setFields([...fields, newField]);
    setNewFieldLabel('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
  };

  // Remove Field
  const handleRemoveField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  // Save Layout
  const handleSaveLayout = async () => {
    try {
      setIsSavingLayout(true);
      const success = await updateModuleLayout(currentModule.slug, fields);
      if (success) {
        setIsLayoutBuilderOpen(false);
      }
    } catch (err) {
      console.error('Error saving layout:', err);
    } finally {
      setIsSavingLayout(false);
    }
  };

  // Get Icon
  const getModuleIcon = () => {
    switch (currentModule.slug) {
      case 'itineraries':
        return <Compass className="h-4 w-4 text-blue-600" />;
      case 'hotels':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'vehicles':
        return <Car className="h-4 w-4 text-blue-600" />;
      case 'bookings':
        return <CalendarCheck className="h-4 w-4 text-blue-600" />;
      default:
        return <Layers className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-white border border-slate-200 rounded overflow-hidden shadow-xs text-xs text-slate-800">
      {/* 1. Module Sub-Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {getModuleIcon()}
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">{currentModule.name}</h1>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500">{currentModule.description || 'Module Records'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search inside Module */}
          <div className="relative w-44 sm:w-60">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${currentModule.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-2 text-xs rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Customize Layout Button (Zoho feature) */}
          <button
            onClick={() => {
              setFields(currentModule.fields || []);
              setIsLayoutBuilderOpen(true);
            }}
            className="flex items-center gap-1 text-slate-700 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 px-2.5 py-1 rounded text-xs font-medium transition-colors"
            title="Edit Layout & Custom Fields"
          >
            <Sliders className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden sm:inline">Layout Builder</span>
          </button>

          {/* Create Record Primary Button */}
          <button
            onClick={() => {
              setNewRecordData({});
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create {currentModule.name.replace(/s$/, '')}</span>
          </button>
        </div>
      </div>

      {/* 2. Main Data Table with Dynamic Columns */}
      <div className="flex-1 flex flex-col justify-between overflow-x-auto bg-white min-w-0">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
              <tr>
                <th className="w-8 px-3 py-2 text-center text-slate-400">#</th>
                {(currentModule.fields || []).map((f) => (
                  <th key={f.id} className="px-3 py-2 font-semibold text-slate-700 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="w-16 px-3 py-2 text-right font-semibold text-slate-700">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={(currentModule.fields?.length || 0) + 2} className="px-4 py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="h-10 w-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        {getModuleIcon()}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">No {currentModule.name} records found</div>
                      <div className="text-[11px] text-slate-500">
                        Click the button below to add your first record to this module.
                      </div>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2 inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded font-medium shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Record</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, index) => (
                  <tr key={rec._id || index} className="group hover:bg-blue-50/35 transition-colors cursor-pointer text-xs">
                    <td className="px-3 py-2 text-center text-slate-400">{index + 1}</td>
                    {(currentModule.fields || []).map((f, fIdx) => {
                      const val = rec[f.key];
                      const isFirstCol = fIdx === 0;
                      return (
                        <td key={f.id} className="px-3 py-2 whitespace-nowrap truncate max-w-[200px]">
                          {isFirstCol ? (
                            <span className="font-semibold text-blue-600 hover:underline">{val || '-'}</span>
                          ) : f.type === 'number' && (f.key.includes('cost') || f.key.includes('rate') || f.key.includes('amount')) ? (
                            <span className="font-bold text-slate-900">{formatCurrency(val, currencySymbol)}</span>
                          ) : f.type === 'select' ? (
                            <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-700">
                              {val || '-'}
                            </span>
                          ) : (
                            <span>{val !== undefined ? String(val) : '-'}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteRecord(rec._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Bottom Status Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/90 px-3 py-2 text-xs text-slate-600 shrink-0">
          <span className="font-semibold text-slate-800">
            Total {currentModule.name}: {filteredRecords.length}
          </span>
          <span className="text-[11px] text-slate-400">Zoho Custom Module System</span>
        </div>
      </div>

      {/* MODAL: CREATE RECORD (Dynamic Layout Form) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {getModuleIcon()}
                <h3 className="text-sm font-bold text-slate-900">Add New {currentModule.name.replace(/s$/, '')}</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-3">
              <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                {(currentModule.fields || []).map((field) => (
                  <div key={field.id} className="text-xs">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        required={field.required}
                        value={newRecordData[field.key] || ''}
                        onChange={(e) => setNewRecordData({ ...newRecordData, [field.key]: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs"
                      >
                        <option value="">Select {field.label}...</option>
                        {(field.options || []).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'date' ? (
                      <input
                        type="date"
                        required={field.required}
                        value={newRecordData[field.key] || ''}
                        onChange={(e) => setNewRecordData({ ...newRecordData, [field.key]: e.target.value })}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs"
                      >
                      </input>
                    ) : field.type === 'number' ? (
                      <input
                        type="number"
                        required={field.required}
                        value={newRecordData[field.key] ?? ''}
                        onChange={(e) => setNewRecordData({ ...newRecordData, [field.key]: Number(e.target.value) })}
                        placeholder={`Enter ${field.label}...`}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs"
                      />
                    ) : (
                      <input
                        type="text"
                        required={field.required}
                        value={newRecordData[field.key] || ''}
                        onChange={(e) => setNewRecordData({ ...newRecordData, [field.key]: e.target.value })}
                        placeholder={`Enter ${field.label}...`}
                        className="w-full h-8 px-2 rounded border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRecord}
                  className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isSubmittingRecord ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LAYOUT BUILDER & CUSTOM FIELDS (Zoho Layout Designer) */}
      {isLayoutBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-2xl p-4 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Customize Layout: {currentModule.name}
                </h3>
              </div>
              <button onClick={() => setIsLayoutBuilderOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Fields List */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Current Module Fields ({fields.length})
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded p-2 bg-slate-50">
                {fields.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-semibold text-slate-800 truncate">{f.label}</span>
                      <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded font-mono uppercase">
                        {f.type}
                      </span>
                      {f.required && (
                        <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-1 py-0.2 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveField(f.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5"
                      title="Remove field"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Field Section */}
            <div className="rounded border border-blue-100 bg-blue-50/50 p-3 space-y-2.5 text-xs">
              <div className="font-bold text-blue-900 text-xs">Add New Field to Layout</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold">Field Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Flight Number, Star Rating"
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs mt-0.5 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold">Data Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                    className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs mt-0.5"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="number">Number / Currency</option>
                    <option value="select">Dropdown Select</option>
                    <option value="date">Date</option>
                  </select>
                </div>
              </div>

              {newFieldType === 'select' && (
                <div>
                  <label className="text-[10px] text-slate-600 font-semibold">
                    Options (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={newFieldOptions}
                    onChange={(e) => setNewFieldOptions(e.target.value)}
                    className="w-full h-7 px-2 rounded border border-slate-200 bg-white text-xs mt-0.5"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newFieldRequired}
                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5"
                  />
                  <span>Mark as mandatory field</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddField}
                  disabled={!newFieldLabel.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-2.5 py-1 text-xs rounded transition-colors disabled:opacity-50"
                >
                  + Add Field
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsLayoutBuilderOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLayout}
                disabled={isSavingLayout}
                className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
              >
                {isSavingLayout ? 'Saving Layout...' : 'Save Layout & Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
