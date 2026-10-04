'use client';

import React, { useState } from 'react';
import { useTenant } from '@/context/TenantContext';
import { CustomFieldDefinition } from '@/types';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  Building,
  Sparkles,
  Database,
  CheckCircle2,
  Layers,
  MessageSquare,
  Globe,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentOrg, updateOrgSettings, createOrganization, organizations } = useTenant();

  // Org Settings State
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [industry, setIndustry] = useState(currentOrg?.industry || '');
  const [currencySymbol, setCurrencySymbol] = useState(currentOrg?.currencySymbol || '₹');
  const [waTemplate, setWaTemplate] = useState(currentOrg?.whatsappTemplate || '');
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Custom Fields Builder State
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(
    currentOrg?.customFields || []
  );
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'select' | 'date'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  // New Client / Tenant Onboarding State
  const [newClientName, setNewClientName] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  // Sync state if currentOrg changes
  React.useEffect(() => {
    if (currentOrg) {
      setOrgName(currentOrg.name);
      setIndustry(currentOrg.industry);
      setCurrencySymbol(currentOrg.currencySymbol || '₹');
      setWaTemplate(currentOrg.whatsappTemplate || '');
      setCustomFields(currentOrg.customFields || []);
    }
  }, [currentOrg]);

  const handleSaveOrgDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    setIsSavingOrg(true);
    setSaveSuccess(false);

    const ok = await updateOrgSettings({
      name: orgName,
      industry,
      currencySymbol,
      whatsappTemplate: waTemplate,
      customFields,
    });

    setIsSavingOrg(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;

    const key = newFieldLabel
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 30);

    const newField: CustomFieldDefinition = {
      id: `field_${Date.now()}`,
      key,
      label: newFieldLabel.trim(),
      type: newFieldType,
      options:
        newFieldType === 'select'
          ? newFieldOptions
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      required: newFieldRequired,
    };

    const updated = [...customFields, newField];
    setCustomFields(updated);
    setNewFieldLabel('');
    setNewFieldOptions('');
    setNewFieldRequired(false);
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(customFields.filter((f) => f.id !== id));
  };

  const handleCreateNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    setIsCreatingClient(true);
    await createOrganization(newClientName.trim(), newClientIndustry.trim() || 'General Business');
    setIsCreatingClient(false);
    setNewClientName('');
    setNewClientIndustry('');
  };

  return (
    <div className="space-y-8 max-w-5xl pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Company Settings & Dynamic Fields</h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure organization preferences, custom CRM data fields, and onboard new companies.
        </p>
      </div>

      {/* Grid: Org Settings & Custom Fields Builder */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1: Org Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Building className="h-4 w-4 text-indigo-400" />
            <span>Organization Profile</span>
          </div>

          <form onSubmit={handleSaveOrgDetails} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Industry / Niche</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Real Estate, Healthcare, Education"
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Default 1-Click WhatsApp Template
              </label>
              <textarea
                rows={3}
                value={waTemplate}
                onChange={(e) => setWaTemplate(e.target.value)}
                placeholder="Hi {{name}}, greetings from {{company}}!..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800/80 p-2.5 text-white focus:border-indigo-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Variables supported: <code>{`{{name}}`}</code>, <code>{`{{company}}`}</code>, and any custom field keys.
              </span>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Settings updated!
                </span>
              )}
              <button
                type="submit"
                disabled={isSavingOrg}
                className="ml-auto flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all disabled:opacity-50 text-xs"
              >
                <Save className="h-4 w-4" />
                <span>{isSavingOrg ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: Dynamic Custom Fields Builder */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Custom Lead Fields (Dynamic)</span>
            </div>
            <span className="text-[11px] text-indigo-400 font-medium">
              {customFields.length} Defined
            </span>
          </div>

          {/* Existing Fields list */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {customFields.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No custom fields defined. Add your first field below!
              </p>
            ) : (
              customFields.map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-850 p-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span>{field.label}</span>
                      {field.required && <span className="text-rose-400 text-[10px]">*req</span>}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Key: <code className="text-indigo-300">{field.key}</code> • Type: {field.type}
                      {field.options && ` (${field.options.join(', ')})`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCustomField(field.id)}
                    className="rounded p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add New Field Sub-Form */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 space-y-3 text-xs">
            <span className="font-bold text-indigo-300 block text-[11px] uppercase tracking-wider">
              Add New Custom Field
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Field Label</label>
                <input
                  type="text"
                  placeholder="e.g. Property Type, Visa Score"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">Field Type</label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="select">Dropdown Select</option>
                  <option value="date">Date</option>
                </select>
              </div>
            </div>

            {newFieldType === 'select' && (
              <div>
                <label className="block text-[10px] text-slate-400 mb-0.5">
                  Dropdown Options (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Option 1, Option 2, Option 3"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddCustomField}
              disabled={!newFieldLabel.trim()}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600/30 py-1.5 font-semibold text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> Add Field (Click Save Settings after)
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Multi-Tenant Onboarding: Add New Company / Client */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Layers className="h-4 w-4 text-emerald-400" />
            <span>Onboard New Client Company (Tenant)</span>
          </div>
          <span className="text-xs text-slate-400">{organizations.length} Companies Running</span>
        </div>

        <p className="text-xs text-slate-400">
          Create a separate workspace for any new client company. All their leads, pipelines, and activities will be completely isolated in MongoDB.
        </p>

        <form onSubmit={handleCreateNewTenant} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Horizon Solar Systems"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Industry / Category</label>
            <input
              type="text"
              placeholder="e.g. Solar Energy, Fitness, Dental"
              value={newClientIndustry}
              onChange={(e) => setNewClientIndustry(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isCreatingClient || !newClientName.trim()}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            <span>{isCreatingClient ? 'Creating...' : 'Create & Switch Tenant'}</span>
          </button>
        </form>
      </div>

      {/* Card 4: MongoDB Atlas Free Connection Guide */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 to-indigo-950/30 p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-indigo-300">
          <Database className="h-4 w-4 text-indigo-400" />
          <span>MongoDB Atlas Cloud Configuration (Free Tier M0)</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The application is currently running with high-speed in-memory multi-tenant state. When you want to connect your free MongoDB Atlas database, simply create a <code className="text-white">.env.local</code> file in the project folder with:
        </p>
        <pre className="rounded-lg bg-slate-950 p-3 text-[11px] text-emerald-400 font-mono border border-slate-800 overflow-x-auto">
MONGODB_URI=mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/zyntex_crm?retryWrites=true&amp;w=majority
        </pre>
      </div>
    </div>
  );
};
