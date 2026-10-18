'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lead, Activity, LeadStage, LayoutSectionItem, LayoutFieldItem } from '@/types';
import { useTenant } from '@/context/TenantContext';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Building,
  User,
  Plus,
  Trash2,
  Edit2,
  Share2,
  Printer,
  CheckCircle2,
  MapPin,
  Car,
  Compass,
  FileText,
  DollarSign,
  Send,
  Users,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  AlertCircle,
  Copy,
  Mail,
  ExternalLink,
  Shield,
  Layers,
  Tag,
  MoreHorizontal,
  Pencil,
  ArrowUp,
  X,
  Save,
  CheckCheck,
} from 'lucide-react';

// ==========================================
// REUSABLE INLINE EDITABLE FIELD COMPONENT
// Crisp, Enterprise CRM Field Box Styling
// ==========================================
interface InlineFieldProps {
  label: string;
  value: string | number | undefined | null;
  placeholder?: string;
  type?: 'text' | 'number' | 'select' | 'date';
  options?: string[];
  prefix?: string;
  badgeStyle?: 'amber' | 'emerald' | 'blue' | 'purple' | 'none';
  isLink?: boolean;
  onLinkClick?: () => void;
  salutation?: boolean;
  onSave: (newValue: any) => Promise<void> | void;
}

const InlineField: React.FC<InlineFieldProps> = ({
  label,
  value,
  placeholder = '–',
  type = 'text',
  options = [],
  prefix,
  badgeStyle = 'none',
  isLink,
  onLinkClick,
  salutation,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value !== undefined && value !== null ? String(value) : '');
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setEditValue(value !== undefined && value !== null ? String(value) : '');
  }, [value]);

  const handleSave = async () => {
    if (editValue === String(value || '')) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      let finalVal: any = editValue;
      if (type === 'number') {
        finalVal = editValue === '' ? 0 : Number(editValue);
      }
      await onSave(finalVal);
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (e) {
      console.error('Error saving field inline:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value !== undefined && value !== null ? String(value) : '');
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 py-1 text-xs group/field">
      {/* Label */}
      <span className="text-slate-500 font-medium sm:w-2/5 shrink-0 truncate select-none">
        {label}
      </span>

      {/* Field Value Box */}
      <div className="sm:w-3/5">
        {isEditing ? (
          <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100">
            {type === 'select' ? (
              <select
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="flex-1 rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              >
                <option value="">– Select –</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                placeholder={placeholder}
                className="flex-1 rounded border border-blue-500 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0 shadow-xs"
              title="Save (Enter)"
            >
              <Check className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setEditValue(value !== undefined && value !== null ? String(value) : '');
                setIsEditing(false);
              }}
              className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors shrink-0"
              title="Cancel (Esc)"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="group relative flex items-center justify-between min-h-[30px] rounded-md border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-400 hover:shadow-xs px-2.5 py-1 cursor-pointer transition-all shadow-2xs"
            title="Click to edit field"
          >
            <div className="flex items-center gap-1.5 truncate">
              {salutation && (
                <span className="text-[10px] text-slate-500 bg-slate-200/80 px-1 py-0.5 rounded font-semibold shrink-0">
                  Mr. ▾
                </span>
              )}
              {badgeStyle === 'amber' ? (
                <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 text-[11px]">
                  {prefix ? `${prefix}${value || placeholder}` : (value || placeholder)}
                </span>
              ) : badgeStyle === 'emerald' ? (
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  {prefix ? `${prefix}${value || placeholder}` : (value || placeholder)}
                </span>
              ) : badgeStyle === 'purple' ? (
                <span className="font-semibold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px]">
                  {prefix ? `${prefix}${value || placeholder}` : (value || placeholder)}
                </span>
              ) : isLink ? (
                <span
                  onClick={(e) => {
                    if (onLinkClick) {
                      e.stopPropagation();
                      onLinkClick();
                    }
                  }}
                  className="font-semibold text-blue-600 hover:underline truncate"
                >
                  {value || placeholder}
                </span>
              ) : (
                <span
                  className={`font-semibold truncate ${
                    value ? 'text-slate-900' : 'text-slate-400 italic font-normal'
                  }`}
                >
                  {value ? (prefix ? `${prefix}${value}` : value) : placeholder}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 ml-2 shrink-0">
              {justSaved && (
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                  <CheckCheck className="h-3 w-3" /> Saved
                </span>
              )}
              <Pencil className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-colors opacity-40 group-hover:opacity-100" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// MAIN LEAD DETAIL PAGE COMPONENT
// ==========================================
interface LeadDetailPageProps {
  lead: Lead;
  onBack: () => void;
  onUpdateLeadStage: (leadId: string, newStage: LeadStage) => Promise<void>;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => Promise<void>;
  onNavigateLead?: (direction: 'prev' | 'next') => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const LeadDetailPage: React.FC<LeadDetailPageProps> = ({
  lead,
  onBack,
  onUpdateLeadStage,
  onEditLead,
  onDeleteLead,
  onNavigateLead,
  onLeadUpdated,
  onNavigateToTab,
}) => {
  const { currentOrg, currencySymbol, currentUser, getModuleLayout, addModuleRecord } = useTenant();

  // Local lead state so inline edits reflect instantly without waiting
  const [currentLead, setCurrentLead] = useState<Lead>(lead);

  useEffect(() => {
    setCurrentLead(lead);
  }, [lead]);

  // Dynamic Module Layout for Leads (Reflects live Settings / Layout Builder)
  const [layoutSections, setLayoutSections] = useState<LayoutSectionItem[]>(() =>
    getModuleLayout('leads')
  );

  // Sync layout whenever organization changes
  useEffect(() => {
    setLayoutSections(getModuleLayout('leads'));
  }, [currentOrg, getModuleLayout]);

  // Real-time listener for layout updates saved in Settings Studio
  useEffect(() => {
    const handleLayoutUpdate = (e: any) => {
      if (e.detail?.moduleSlug === 'leads' && e.detail.sections) {
        setLayoutSections(e.detail.sections);
      }
    };
    window.addEventListener('module_layout_updated', handleLayoutUpdate);
    return () => window.removeEventListener('module_layout_updated', handleLayoutUpdate);
  }, []);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (secId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Helper to extract field value dynamically from lead or customFields
  const getFieldValue = useCallback((field: LayoutFieldItem) => {
    const k = field.key;
    if (k === 'name' || k === 'last_name') return currentLead.name || '';
    if (k === 'first_name') return currentLead.customFields?.first_name || (currentLead.name ? currentLead.name.split(' ')[0] : '');
    if (k === 'phone' || k === 'mobile') return currentLead.phone || '';
    if (k === 'alt_phone') return currentLead.customFields?.alt_phone || '';
    if (k === 'email') return currentLead.email || '';
    if (k === 'company') return currentLead.company || '';
    if (k === 'value' || k === 'deal_value') return currentLead.value || 0;
    if (k === 'stage' || k === 'status') return currentLead.stage || 'new';
    if (k === 'source') return currentLead.source || 'website';
    if (k === 'assignedTo' || k === 'owner') return currentLead.assignedTo?.name || 'Aarav Kapoor';

    // Fallbacks for standard travel demo fields
    if (k === 'trip_type' && !currentLead.customFields?.[k]) return 'Customised Trip';
    if (k === 'inquiry_id' && !currentLead.customFields?.[k]) return 'WNDPQ535';
    if (k === 'country_code' && !currentLead.customFields?.[k]) return 'India(91)';
    if (k === 'costing_status' && !currentLead.customFields?.[k]) return 'Pending Costing';
    if (k === 'destination_type' && !currentLead.customFields?.[k]) return 'India';
    if (k === 'destination' && !currentLead.customFields?.[k]) return 'Bali Honeymoon';
    if (k === 'hotel_category' && !currentLead.customFields?.[k]) return 'Super Deluxe';
    if (k === 'lead_grading' && !currentLead.customFields?.[k]) return 'A+ Hot';
    if (k === 'travel_date' && !currentLead.customFields?.[k]) return '2026-10-20';
    if (k === 'city' && !currentLead.customFields?.[k]) return 'Mumbai';
    if (k === 'itinerary_name' && !currentLead.customFields?.[k]) return '7N/8Days Jawai Jodhpur Jaisalmer Jaipur';
    if (k === 'hotel_1_city' && !currentLead.customFields?.[k]) return 'Jawai';
    if (k === 'hotel_1_category' && !currentLead.customFields?.[k]) return 'Deluxe';
    if (k === 'hotel_1_nights' && !currentLead.customFields?.[k]) return '1';
    if (k === 'hotel_1_dates' && !currentLead.customFields?.[k]) return '20-Oct-2026 to 21-Oct-2026';

    return currentLead.customFields?.[k] ?? '';
  }, [currentLead]);

  // Top Tabs: Overview, Timeline, Data Privacy
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'privacy'>('overview');
  const [hideDetails, setHideDetails] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Related list left sub-sidebar (closed by default, open on user click)
  const [isRelatedListOpen, setIsRelatedListOpen] = useState(false);

  // Blueprint State
  const [currentState, setCurrentState] = useState(
    currentLead.stage === 'new'
      ? 'Inquiry'
      : currentLead.stage === 'contacted'
      ? 'Contacted'
      : currentLead.stage === 'meeting'
      ? 'Quotation In Progress'
      : currentLead.stage === 'won'
      ? 'Booking Confirmed'
      : 'Inquiry'
  );

  useEffect(() => {
    setCurrentState(
      currentLead.stage === 'new'
        ? 'Inquiry'
        : currentLead.stage === 'contacted'
        ? 'Contacted'
        : currentLead.stage === 'meeting'
        ? 'Quotation In Progress'
        : currentLead.stage === 'won'
        ? 'Booking Confirmed'
        : 'Inquiry'
    );
  }, [currentLead.stage]);

  // Related list active item
  const [activeRelatedItem, setActiveRelatedItem] = useState('Overview');

  // WhatsApp Launcher
  const handleLaunchWhatsApp = () => {
    const cleanPhone = (currentLead.phone || '').replace(/[^0-9]/g, '');
    const finalPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = `Hi ${currentLead.name}, greetings from ${currentOrg?.name || 'our team'}! How can we assist you with your inquiry today?`;
    window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Create Booking Transition
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  const handleCreateBooking = async () => {
    if (isCreatingBooking) return;
    try {
      setIsCreatingBooking(true);
      const bookingRef =
        currentLead.customFields?.booking_ref ||
        `BKG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const totalAmount = Number(currentLead.value) || 58550;
      const advancePaid =
        Number(currentLead.customFields?.advance_amount_paid) ||
        Math.round(totalAmount * 0.4);

      // 1. Create Booking Record in bookings module
      const bookingRecord = {
        booking_ref: bookingRef,
        customer_name: currentLead.name,
        itinerary:
          currentLead.customFields?.destination ||
          currentLead.customFields?.itinerary_name ||
          currentLead.company ||
          'Custom Travel Package',
        travel_date:
          currentLead.customFields?.travel_date ||
          new Date().toISOString().split('T')[0],
        total_amount: totalAmount,
        advance_paid: advancePaid,
        status: 'Advance Received',
        phone: currentLead.phone,
        email: currentLead.email || '',
        lead_id: currentLead._id,
        createdAt: new Date().toISOString(),
      };

      await addModuleRecord('bookings', bookingRecord);

      // 2. Mark Lead as Won & Converted to Booking
      await onUpdateLeadStage(currentLead._id, 'won');
      const updatedLead = {
        ...currentLead,
        stage: 'won' as LeadStage,
        customFields: {
          ...(currentLead.customFields || {}),
          booking_ref: bookingRef,
          converted_to_booking: true,
          booking_created_at: new Date().toISOString(),
        },
      };
      setCurrentLead(updatedLead);
      setCurrentState('Booking Confirmed');
      onLeadUpdated?.(updatedLead);

      // 3. Update in backend API
      try {
        await fetch(`/api/leads/${currentLead._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'won',
            customFields: updatedLead.customFields,
          }),
        });
      } catch (e) {
        console.error('Error updating lead status in DB:', e);
      }

      // 4. Confetti & Success Toast
      confetti({ particleCount: 150, spread: 85, origin: { y: 0.55 } });
      setBookingToast(`🎉 Booking ${bookingRef} Confirmed! Lead converted and transferred to Bookings page...`);

      // 5. Navigate to Bookings page
      setTimeout(() => {
        if (onNavigateToTab) {
          onNavigateToTab('module_bookings');
        } else {
          onBack();
        }
      }, 1200);
    } catch (err) {
      console.error('Error creating booking:', err);
    } finally {
      setIsCreatingBooking(false);
    }
  };

  // Generic Inline Field Update Function
  const handleUpdateField = useCallback(
    async (field: string, value: any, isCustomField = false) => {
      let updatedData: Partial<Lead> = {};

      if (isCustomField) {
        const mergedCustom = {
          ...(currentLead.customFields || {}),
          [field]: value,
        };
        updatedData = { customFields: mergedCustom };
        setCurrentLead((prev) => ({
          ...prev,
          customFields: mergedCustom,
        }));
      } else if (field === 'assignedTo') {
        const assignedObj = { _id: 'u_owner', name: value };
        updatedData = { assignedTo: assignedObj };
        setCurrentLead((prev) => ({
          ...prev,
          assignedTo: assignedObj,
        }));
      } else {
        updatedData = { [field]: value };
        setCurrentLead((prev) => ({
          ...prev,
          [field]: value,
        }));
      }

      try {
        const res = await fetch(`/api/leads/${currentLead._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData),
        });
        const json = await res.json();
        if (json.success && json.data) {
          setCurrentLead(json.data);
          onLeadUpdated?.(json.data);
        }
      } catch (err) {
        console.error('Failed to update lead field inline:', err);
      }
    },
    [currentLead, onLeadUpdated]
  );

  // Dynamic field save router
  const handleSaveDynamicField = useCallback(
    (field: LayoutFieldItem, newVal: any) => {
      const k = field.key;
      if (k === 'name' || k === 'last_name') {
        handleUpdateField('name', newVal);
      } else if (k === 'phone' || k === 'mobile') {
        handleUpdateField('phone', newVal);
      } else if (k === 'email') {
        handleUpdateField('email', newVal);
      } else if (k === 'stage' || k === 'status') {
        handleUpdateField('stage', newVal);
      } else if (k === 'value' || k === 'deal_value') {
        handleUpdateField('value', newVal);
      } else if (k === 'source') {
        handleUpdateField('source', newVal);
      } else if (k === 'assignedTo' || k === 'owner') {
        handleUpdateField('assignedTo', newVal);
      } else {
        handleUpdateField(k, newVal, true);
      }
    },
    [handleUpdateField]
  );

  return (
    <div className="flex flex-col flex-1 h-full bg-white overflow-hidden text-xs text-slate-800">
      {bookingToast && (
        <div className="bg-emerald-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold animate-in fade-in slide-in-from-top-2 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{bookingToast}</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded font-mono">Redirecting to Bookings...</span>
        </div>
      )}

      {/* 1. TOP ZOHO HEADER (Back, Avatar, Name, Add Tags, Action Buttons) */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-4 py-2 shrink-0 shadow-xs">
        {/* Left: Back & Lead Heading */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 rounded hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Leads"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Lead Avatar */}
          <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm">
            {currentLead.name ? currentLead.name.charAt(0).toUpperCase() : 'L'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 leading-tight">{currentLead.name}</h1>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition-colors mt-0.5">
              <Tag className="h-3 w-3" />
              <span>Add Tags</span>
            </button>
          </div>
        </div>

        {/* Right: Zoho Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              if (currentLead.email) {
                window.location.href = `mailto:${currentLead.email}?subject=Regarding Your Inquiry with ${currentOrg?.name}`;
              } else {
                alert('No email address saved for this lead.');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded text-xs shadow-xs transition-colors"
          >
            Send Email
          </button>

          <button
            onClick={handleCreateBooking}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded text-xs transition-colors hidden sm:inline-flex"
          >
            Convert
          </button>

          <button
            onClick={() => onEditLead(currentLead)}
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-2.5 py-1.5 rounded text-xs transition-colors"
          >
            Edit
          </button>

          {/* WhatsApp Chat Dropdown Button */}
          <button
            onClick={handleLaunchWhatsApp}
            className="flex items-center gap-1 border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold px-2.5 py-1.5 rounded text-xs transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp Chat</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {/* More options (...) */}
          <div className="relative">
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-600 transition-colors"
              title="More Actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {isMoreMenuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsMoreMenuOpen(false)} />
                <div className="absolute right-0 mt-1 z-30 w-44 rounded border border-slate-200 bg-white py-1 shadow-lg text-xs animate-in fade-in">
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      window.print();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Lead</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      onDeleteLead(currentLead._id);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Lead</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Pager (< >) */}
          <div className="flex items-center border border-slate-200 rounded overflow-hidden">
            <button
              onClick={() => (onNavigateLead ? onNavigateLead('prev') : onBack())}
              className="p-1.5 hover:bg-slate-50 text-slate-500 border-r border-slate-200 transition-colors"
              title="Previous Record"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => (onNavigateLead ? onNavigateLead('next') : onBack())}
              className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors"
              title="Next Record"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. BODY LAYOUT: Left Sub-Sidebar (Related List, Collapsible) + Main Detail Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SUB-SIDEBAR: Related List (Hidden by default, opens on user toggle) */}
        {isRelatedListOpen && (
          <aside className="w-52 shrink-0 flex flex-col justify-between border-r border-slate-200 bg-white p-3 text-xs overflow-y-auto animate-in slide-in-from-left-2 duration-150">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100">
                  <span>Related List</span>
                  <button
                    onClick={() => setIsRelatedListOpen(false)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Close Related List"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {[
                    { label: 'Connected Records' },
                    { label: 'Attachments' },
                    { label: 'Itineraries' },
                    { label: 'Open Activities' },
                    { label: 'Closed Activities' },
                    { label: 'Emails', count: 5 },
                    { label: 'Template Message' },
                    { label: 'Voice of the Customer' },
                    { label: 'Related List Label 1' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setActiveRelatedItem(item.label)}
                      className={`flex w-full items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                        activeRelatedItem === item.label
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.count !== undefined && (
                        <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 text-[10px] font-bold">
                          {item.count}
                        </span>
                      )}
                    </button>
                  ))}

                  <button className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 block">
                    + Add Related List
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Links
                </div>
                <button className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 block">
                  + Add Link
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* MAIN DETAIL CANVAS (Scrollable, takes 100% width when Related List is closed) */}
        <div className="flex-1 overflow-y-auto bg-white p-3 sm:p-5 space-y-4">
          {/* Top Segmented Tabs: Overview, Timeline, Data Privacy + Related List Toggle */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2">
              {/* Related List Toggle Button */}
              <button
                onClick={() => setIsRelatedListOpen(!isRelatedListOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  isRelatedListOpen
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                title={isRelatedListOpen ? 'Hide Related List' : 'Open Related List'}
              >
                <Layers className="h-3.5 w-3.5 text-blue-600" />
                <span>Related List</span>
                <ChevronDown
                  className={`h-3 w-3 text-slate-400 transition-transform ${
                    isRelatedListOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div className="inline-flex rounded-full bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'timeline'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    activeTab === 'privacy'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Data Privacy
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              🕒 Last Update: {formatRelativeTime(currentLead.updatedAt || currentLead.createdAt)}
            </div>
          </div>

          {/* BLUEPRINT STATE / TRANSITIONS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[11px] text-slate-500">Current State:</span>
                <span className="ml-1.5 font-bold text-slate-900 text-xs">{currentState}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Transitions:</span>
                <button
                  onClick={handleCreateBooking}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1 rounded text-xs shadow-xs transition-colors"
                >
                  Create Booking
                </button>
              </div>
            </div>
            <button className="text-[11px] text-blue-600 hover:text-blue-800 font-medium">
              View configured actions
            </button>
          </div>

          {/* TOP 4-FIELD BUSINESS CARD (Editable Inline) */}
          <div className="rounded border border-slate-200 bg-white p-3 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <InlineField
                label="Lead Owner"
                value={currentLead.assignedTo?.name || 'Aarav Kapoor'}
                type="text"
                onSave={(val) => handleUpdateField('assignedTo', val)}
              />
              <InlineField
                label="Email"
                value={currentLead.email}
                type="text"
                placeholder="Enter email..."
                onSave={(val) => handleUpdateField('email', val)}
              />
              <InlineField
                label="Mobile"
                value={currentLead.phone}
                type="text"
                onSave={(val) => handleUpdateField('phone', val)}
              />
              <InlineField
                label="Lead Status"
                value={currentLead.stage}
                type="select"
                options={['new', 'contacted', 'meeting', 'proposal', 'won', 'lost']}
                onSave={(val) => handleUpdateField('stage', val)}
              />
            </div>
          </div>

          {/* DYNAMIC MODULE LAYOUT SECTIONS (Synced Live with Settings / Layout Builder) */}
          {layoutSections.map((sec) => {
            const isCollapsed = !!collapsedSections[sec.id];
            return (
              <div key={sec.id} className="rounded border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
                {/* Section Header with Collapse Toggle */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => toggleSection(sec.id)}
                    className="font-bold text-slate-900 text-xs flex items-center gap-2 hover:text-blue-600 transition-colors"
                  >
                    <span>{sec.title}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({sec.leftFields.length + sec.rightFields.length} fields)
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                  </button>

                  <span className="text-[11px] text-slate-400">Click any field to edit directly</span>
                </div>

                {/* 2-Column Grid of Fields (Exact order, columns, and properties from Layout Studio) */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    {/* Left Column */}
                    <div className="space-y-1.5 flex flex-col">
                      {sec.leftFields.map((field) => {
                        const isSelect = field.type === 'select' || field.iconType.includes('pick');
                        const isNumber = field.type === 'number' || field.iconType === 'number';
                        const isDate = field.type === 'date' || field.iconType === 'date';
                        const badge = field.key.includes('status')
                          ? 'amber'
                          : field.key.includes('grading')
                          ? 'emerald'
                          : 'none';

                        return (
                          <InlineField
                            key={field.id}
                            label={field.label}
                            value={getFieldValue(field)}
                            type={isSelect ? 'select' : isNumber ? 'number' : isDate ? 'date' : 'text'}
                            options={
                              isSelect
                                ? field.options && field.options.length > 0
                                  ? field.options
                                  : ['Option 1', 'Option 2']
                                : undefined
                            }
                            badgeStyle={badge as any}
                            salutation={field.salutation}
                            onSave={(newVal) => handleSaveDynamicField(field, newVal)}
                          />
                        );
                      })}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-1.5 flex flex-col">
                      {sec.rightFields.map((field) => {
                        const isSelect = field.type === 'select' || field.iconType.includes('pick');
                        const isNumber = field.type === 'number' || field.iconType === 'number';
                        const isDate = field.type === 'date' || field.iconType === 'date';
                        const badge = field.key.includes('status')
                          ? 'amber'
                          : field.key.includes('grading')
                          ? 'emerald'
                          : 'none';

                        return (
                          <InlineField
                            key={field.id}
                            label={field.label}
                            value={getFieldValue(field)}
                            type={isSelect ? 'select' : isNumber ? 'number' : isDate ? 'date' : 'text'}
                            options={
                              isSelect
                                ? field.options && field.options.length > 0
                                  ? field.options
                                  : ['Option 1', 'Option 2']
                                : undefined
                            }
                            badgeStyle={badge as any}
                            salutation={field.salutation}
                            onSave={(newVal) => handleSaveDynamicField(field, newVal)}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 4. CUSTOMISED COSTING REQUEST (Editable Quotation Values) */}
          <div className="rounded border border-slate-200 bg-white p-4 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="font-bold text-slate-900 text-xs">Customised Costing Request</div>
              <span className="text-[11px] text-slate-400">Click to edit costing figures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <InlineField
                label="Final Quotation Amount"
                value={currentLead.customFields?.final_quotation_amount || '58,550.00'}
                type="text"
                prefix="INR "
                badgeStyle="amber"
                onSave={(val) => handleUpdateField('final_quotation_amount', val, true)}
              />
              <InlineField
                label="Balance / Pending Amount"
                value={currentLead.customFields?.balance_pending_amount || '–'}
                type="text"
                onSave={(val) => handleUpdateField('balance_pending_amount', val, true)}
              />

              <InlineField
                label="Per Adult Cost"
                value={currentLead.customFields?.per_adult_cost || '58,550.00'}
                type="text"
                prefix="INR "
                badgeStyle="amber"
                onSave={(val) => handleUpdateField('per_adult_cost', val, true)}
              />
              <InlineField
                label="Advance Amount Paid"
                value={currentLead.customFields?.advance_amount_paid || '–'}
                type="text"
                onSave={(val) => handleUpdateField('advance_amount_paid', val, true)}
              />

              <InlineField
                label="Per Child Cost"
                value={currentLead.customFields?.per_child_cost || '58,500.00'}
                type="text"
                prefix="INR "
                badgeStyle="amber"
                onSave={(val) => handleUpdateField('per_child_cost', val, true)}
              />
              <InlineField
                label="Description / Notes"
                value={currentLead.customFields?.description || '–'}
                type="text"
                onSave={(val) => handleUpdateField('description', val, true)}
              />
            </div>

            {/* Details for Operation & Finance Team */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="font-bold text-slate-900 text-xs">Details for Operation & Finance Team</div>
              <div className="max-w-md">
                <InlineField
                  label="Payment Mode"
                  value={currentLead.customFields?.payment_mode || 'Bank Transfer (NEFT/IMPS)'}
                  type="select"
                  options={[
                    'Bank Transfer (NEFT/IMPS)',
                    'UPI / QR Code',
                    'Credit Card / Debit Card',
                    'Razorpay Gateway',
                    'Cash Deposit',
                    'Cheque',
                  ]}
                  onSave={(val) => handleUpdateField('payment_mode', val, true)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
