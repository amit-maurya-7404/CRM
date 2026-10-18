'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTenant } from '@/context/TenantContext';
import { CustomFieldDefinition } from '@/types';
import {
  Sliders,
  Plus,
  Trash2,
  Save,
  Building,
  Sparkles,
  Layers,
  Search,
  ArrowLeft,
  User,
  Users,
  Settings2,
  Check,
  X,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  ChevronDown,
  Pencil,
  AlertCircle,
  Tag,
  Type,
  AlignLeft,
  List,
  Calendar,
  Hash,
  DollarSign,
  CheckSquare,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  MoreHorizontal,
  FolderPlus,
  Compass,
  Car,
  CalendarCheck,
  Eye,
  CheckCheck,
  HelpCircle,
  GripVertical,
} from 'lucide-react';

interface LayoutFieldItem {
  id: string;
  label: string;
  key: string;
  type: string;
  iconType: string;
  required?: boolean;
  options?: string[];
  hint?: string;
  salutation?: boolean;
}

interface LayoutSectionItem {
  id: string;
  title: string;
  leftFields: LayoutFieldItem[];
  rightFields: LayoutFieldItem[];
}

export const SettingsView: React.FC = () => {
  const {
    currentOrg,
    currentUser,
    updateOrgSettings,
    updateUserProfile,
    modules,
    updateModuleLayout,
    getModuleLayout,
    saveModuleLayout,
  } = useTenant();

  // Navigation View: 'home' | 'modules_list' | 'layout_editor' | 'personal'
  const [currentView, setCurrentView] = useState<'home' | 'modules_list' | 'layout_editor' | 'personal'>('home');
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('leads');
  const [moduleSearchQuery, setModuleSearchQuery] = useState('');

  // Synchronize view with URL query parameters so refresh keeps user in the right screen
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view') as any;
    const modParam = params.get('module');

    if (viewParam === 'modules') {
      setCurrentView('modules_list');
    } else if (viewParam === 'layout') {
      setCurrentView('layout_editor');
      if (modParam) setSelectedModuleSlug(modParam);
    } else if (viewParam === 'personal') {
      setCurrentView('personal');
    } else {
      setCurrentView('home');
    }
  }, []);

  const navigateTo = (view: 'home' | 'modules_list' | 'layout_editor' | 'personal', moduleSlug?: string) => {
    setCurrentView(view);
    if (moduleSlug) setSelectedModuleSlug(moduleSlug);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (view === 'home') {
        url.searchParams.delete('view');
        url.searchParams.delete('module');
      } else if (view === 'modules_list') {
        url.searchParams.set('view', 'modules');
        url.searchParams.delete('module');
      } else if (view === 'layout_editor') {
        url.searchParams.set('view', 'layout');
        url.searchParams.set('module', moduleSlug || selectedModuleSlug);
      } else if (view === 'personal') {
        url.searchParams.set('view', 'personal');
        url.searchParams.delete('module');
      }
      window.history.pushState({}, '', url.toString());
    }
  };

  // =========================================================================
  // 1. MODULES LIST (Screenshot 1: crm.zoho.in/crm/wanderphilia/settings/modules)
  // =========================================================================
  const [modulesList, setModulesList] = useState([
    { slug: 'leads', name: 'Leads', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 16, 2026', status: true, icon: 'Table' },
    { slug: 'itineraries', name: 'Itineraries', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 13, 2026', status: true, icon: 'Compass' },
    { slug: 'hotels', name: 'Hotels', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 17, 2026', status: true, icon: 'Building' },
    { slug: 'vehicles', name: 'Vehicles', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 15, 2026', status: true, icon: 'Car' },
    { slug: 'bookings', name: 'Bookings', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 16, 2026', status: true, icon: 'CalendarCheck' },
    { slug: 'customers', name: 'Customers', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 8, 2026', status: true, icon: 'Users' },
    { slug: 'quotes', name: 'Quotes', teamspace: 'No Teamspace', sharedTo: 'All Profiles', lastModified: 'Dec 4, 2025', status: false, icon: 'DollarSign' },
    { slug: 'tasks', name: 'Tasks', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Sep 2, 2026', status: true, icon: 'CheckSquare' },
    { slug: 'meetings', name: 'Meetings', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Jul 8, 2026', status: true, icon: 'Calendar' },
    { slug: 'calls', name: 'Calls', teamspace: '1 Teamspaces', sharedTo: 'All Profiles', lastModified: 'Oct 1, 2026', status: true, icon: 'Phone' },
    { slug: 'reports', name: 'Reports', teamspace: 'No Teamspace', sharedTo: 'All Profiles', lastModified: 'Oct 10, 2026', status: true, icon: 'Sliders' },
  ]);

  const filteredModulesList = useMemo(() => {
    if (!moduleSearchQuery.trim()) return modulesList;
    const q = moduleSearchQuery.toLowerCase();
    return modulesList.filter((m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
  }, [moduleSearchQuery, modulesList]);

  const toggleModuleStatus = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setModulesList((prev) =>
      prev.map((m) => (m.slug === slug ? { ...m, status: !m.status } : m))
    );
  };

  // =========================================================================
  // 2. LAYOUT & FORM EDITOR STUDIO (Screenshots 2 & 3: 1:1 Zoho Layout Studio)
  // =========================================================================
  const defaultLeadSections: LayoutSectionItem[] = [
    {
      id: 'sec_lead_info',
      title: 'Lead Information',
      leftFields: [
        { id: 'f_fn', label: 'First Name', key: 'first_name', type: 'text', iconType: 'single_line', salutation: true },
        { id: 'f_ln', label: 'Last Name', key: 'name', type: 'text', iconType: 'single_line', required: true },
        { id: 'f_tt', label: 'Trip Type', key: 'trip_type', type: 'select', iconType: 'pick_list', options: ['Customised Trip', 'Honeymoon', 'Family Vacation', 'Group Tour'] },
        { id: 'f_cc', label: 'Country Code', key: 'country_code', type: 'select', iconType: 'pick_list', options: ['India(91)', 'UAE(971)', 'USA(1)', 'UK(44)'] },
        { id: 'f_mob', label: 'Mobile', key: 'phone', type: 'text', iconType: 'phone' },
        { id: 'f_ph', label: 'Phone', key: 'alt_phone', type: 'text', iconType: 'phone' },
        { id: 'f_dt', label: 'Destination Type', key: 'destination_type', type: 'select', iconType: 'pick_list', options: ['India', 'International'] },
        { id: 'f_dest', label: 'Destinations', key: 'destination', type: 'select', iconType: 'pick_list', options: ['Bali Honeymoon', 'Dubai 5N/6D', 'Ladakh Expedition', 'Rajasthan Circuit'] },
        { id: 'f_itin_uid', label: 'Itinerary Unique id', key: 'itinerary_uid', type: 'text', iconType: 'single_line' },
        { id: 'f_itin_name', label: 'Pick Itinerary', key: 'itinerary_name', type: 'select', iconType: 'pick_list', options: ['7N/8Days Jawai Jodhpur Jaisalmer Jaipur', '5N/6D Dubai Luxury', '6N/7D Bali Private Villa'] },
        { id: 'f_hc', label: 'Hotel Category', key: 'hotel_category', type: 'select', iconType: 'pick_list', options: ['Super Deluxe', 'Deluxe', '4 Star Premium', '3 Star Budget'] },
        { id: 'f_tsd', label: 'Travel Start Date', key: 'travel_date', type: 'date', iconType: 'date' },
        { id: 'f_ted', label: 'Travel End Date', key: 'travel_end_date', type: 'date', iconType: 'date' },
        { id: 'f_dep_city', label: 'Departure City', key: 'departure_city', type: 'text', iconType: 'single_line' },
        { id: 'f_pref_room', label: 'Preferred Room Category', key: 'preferred_room', type: 'select', iconType: 'pick_list', options: ['Deluxe Room', 'Pool Villa', 'Suite'] },
      ],
      rightFields: [
        { id: 'f_owner', label: 'Lead Owner', key: 'assignedTo', type: 'text', iconType: 'user' },
        { id: 'f_inq_id', label: 'Inquiry ID', key: 'inquiry_id', type: 'text', iconType: 'single_line', hint: 'This field will be hidden during creation/editing' },
        { id: 'f_cost_status', label: 'Costing Request Status', key: 'costing_status', type: 'select', iconType: 'pick_list', options: ['Pending Costing', 'Costing Shared', 'Approved'] },
        { id: 'f_source', label: 'Lead Source', key: 'source', type: 'select', iconType: 'pick_list', options: ['Website', 'Instagram', 'WhatsApp', 'Referral'] },
        { id: 'f_create_book', label: 'Create Booking', key: 'create_booking', type: 'text', iconType: 'single_line' },
        { id: 'f_email', label: 'Email', key: 'email', type: 'text', iconType: 'email' },
        { id: 'f_status', label: 'Lead Status', key: 'stage', type: 'select', iconType: 'pick_list', options: ['new', 'contacted', 'meeting', 'proposal', 'won', 'lost'] },
        { id: 'f_grading', label: 'Lead Grading', key: 'lead_grading', type: 'select', iconType: 'pick_list', options: ['A+ Hot', 'A Warm', 'B Normal', 'C Cold'] },
        { id: 'f_created_by', label: 'Created By', key: 'created_by', type: 'text', iconType: 'user' },
        { id: 'f_lost_reason', label: 'Reasons for Lost Deals', key: 'lost_reason', type: 'select', iconType: 'pick_list', options: ['Price High', 'Competitor Chosen', 'Trip Postponed'] },
        { id: 'f_city', label: 'City', key: 'city', type: 'text', iconType: 'single_line' },
        { id: 'f_spec_req', label: 'Specific Requirements', key: 'notes', type: 'text', iconType: 'multi_line' },
        { id: 'f_camp', label: 'Campaign', key: 'campaign', type: 'text', iconType: 'single_line' },
      ],
    },
    {
      id: 'sec_hotel_details',
      title: 'Hotel Details',
      leftFields: [
        { id: 'f_h1_city', label: '1st Hotel City', key: 'hotel_1_city', type: 'select', iconType: 'pick_list', options: ['Jawai', 'Udaipur', 'Jodhpur', 'Jaipur', 'Dubai', 'Bali'] },
        { id: 'f_h1_cat', label: 'Hotel 1 Category', key: 'hotel_1_category', type: 'select', iconType: 'pick_list', options: ['Deluxe', 'Super Deluxe', 'Luxury Resort'] },
        { id: 'f_h1_name', label: '1st Hotel', key: 'hotel_1_name', type: 'select', iconType: 'pick_list', options: ['Jawai Leopard Camp', 'Suján Jawai', 'Heritage Resort'] },
        { id: 'f_h1_nights', label: '1st Hotel Nights', key: 'hotel_1_nights', type: 'number', iconType: 'number' },
        { id: 'f_h1_dates', label: '1st Hotel Stay Dates', key: 'hotel_1_dates', type: 'text', iconType: 'single_line' },
        { id: 'f_h2_city', label: '2nd Hotel City', key: 'hotel_2_city', type: 'select', iconType: 'pick_list', options: ['Jodhpur', 'Jaisalmer', 'Jaipur'] },
        { id: 'f_h2_cat', label: 'Hotel 2 Category', key: 'hotel_2_category', type: 'select', iconType: 'pick_list', options: ['Deluxe', 'Super Deluxe', 'Luxury Resort'] },
        { id: 'f_h2_name', label: '2nd Hotel', key: 'hotel_2_name', type: 'select', iconType: 'pick_list', options: ['Umaid Bhawan', 'Ajit Bhawan Palace', 'Indana Palace'] },
        { id: 'f_h2_nights', label: '2nd Hotel Nights', key: 'hotel_2_nights', type: 'number', iconType: 'number' },
        { id: 'f_h2_dates', label: '2nd Hotel Stay Dates', key: 'hotel_2_dates', type: 'text', iconType: 'single_line' },
      ],
      rightFields: [
        { id: 'f_h4_city', label: '4th Hotel City', key: 'hotel_4_city', type: 'select', iconType: 'pick_list', options: ['Jaipur', 'Jodhpur', 'Jaisalmer'] },
        { id: 'f_h4_cat', label: 'Hotel 4 Category', key: 'hotel_4_category', type: 'select', iconType: 'pick_list', options: ['Deluxe', 'Super Deluxe', 'Luxury Resort'] },
        { id: 'f_h4_name', label: '4th Hotel', key: 'hotel_4_name', type: 'select', iconType: 'pick_list', options: ['Rambagh Palace', 'Jai Mahal Palace', 'Fairmont Jaipur'] },
        { id: 'f_h4_nights', label: '4th Hotel Nights', key: 'hotel_4_nights', type: 'number', iconType: 'number' },
        { id: 'f_h4_dates', label: '4th Hotel Stay Dates', key: 'hotel_4_dates', type: 'text', iconType: 'single_line' },
        { id: 'f_h5_city', label: '5th Hotel City', key: 'hotel_5_city', type: 'select', iconType: 'pick_list', options: ['–', 'Delhi', 'Agra'] },
        { id: 'f_h5_cat', label: 'Hotel 5 Category', key: 'hotel_5_category', type: 'select', iconType: 'pick_list', options: ['–', 'Deluxe', 'Super Deluxe'] },
        { id: 'f_h5_name', label: '5th Hotel', key: 'hotel_5_name', type: 'select', iconType: 'pick_list', options: ['–'] },
        { id: 'f_h5_nights', label: '5th Hotel Nights', key: 'hotel_5_nights', type: 'text', iconType: 'single_line' },
        { id: 'f_h5_dates', label: '5th Hotel Stay Dates', key: 'hotel_5_dates', type: 'text', iconType: 'single_line' },
      ],
    },
  ];

  const [layoutSections, setLayoutSections] = useState<LayoutSectionItem[]>(() =>
    getModuleLayout(selectedModuleSlug)
  );

  // Sync layout whenever selected module or org changes
  useEffect(() => {
    setLayoutSections(getModuleLayout(selectedModuleSlug));
  }, [selectedModuleSlug, getModuleLayout]);

  const [selectedFieldForEdit, setSelectedFieldForEdit] = useState<LayoutFieldItem | null>(null);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
  const [newFieldIconType, setNewFieldIconType] = useState('single_line');
  const [newFieldNameInput, setNewFieldNameInput] = useState('');
  const [newFieldOptionsInput, setNewFieldOptionsInput] = useState('');
  const [newFieldRequiredInput, setNewFieldRequiredInput] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('sec_lead_info');
  const [targetColumn, setTargetColumn] = useState<'left' | 'right'>('left');
  const [targetInsertIndex, setTargetInsertIndex] = useState<number | null>(null);
  const [layoutSaveNotice, setLayoutSaveNotice] = useState(false);
  const [dragNotice, setDragNotice] = useState<string | null>(null);

  // Drag and Drop States
  const [draggedItem, setDraggedItem] = useState<
    | { type: 'new_palette_field'; fieldTypeId: string; label: string }
    | {
        type: 'existing_field';
        fieldId: string;
        sourceSectionId: string;
        sourceColumn: 'left' | 'right';
        sourceIndex: number;
      }
    | null
  >(null);

  const [dropIndicator, setDropIndicator] = useState<{
    sectionId: string;
    column: 'left' | 'right';
    index: number;
  } | null>(null);

  // Left Palette Field Types (24 Tiles exact from Screenshot 2)
  const paletteFieldTypes = [
    { id: 'single_line', label: 'Single Line', icon: <Type className="h-3.5 w-3.5" /> },
    { id: 'multi_line', label: 'Multi-Line', icon: <AlignLeft className="h-3.5 w-3.5" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-3.5 w-3.5" /> },
    { id: 'phone', label: 'Phone', icon: <Phone className="h-3.5 w-3.5" /> },
    { id: 'pick_list', label: 'Pick List', icon: <List className="h-3.5 w-3.5" /> },
    { id: 'multi_select', label: 'Multi-Select', icon: <List className="h-3.5 w-3.5" /> },
    { id: 'date', label: 'Date', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'date_time', label: 'Date/Time', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'number', label: 'Number', icon: <Hash className="h-3.5 w-3.5" /> },
    { id: 'auto_number', label: 'Auto-Number', icon: <Hash className="h-3.5 w-3.5" /> },
    { id: 'currency', label: 'Currency', icon: <DollarSign className="h-3.5 w-3.5" /> },
    { id: 'decimal', label: 'Decimal', icon: <Hash className="h-3.5 w-3.5" /> },
    { id: 'percent', label: 'Percent', icon: <span className="font-bold text-[11px]">%</span> },
    { id: 'long_integer', label: 'Long Integer', icon: <Hash className="h-3.5 w-3.5" /> },
    { id: 'checkbox', label: 'Checkbox', icon: <CheckSquare className="h-3.5 w-3.5" /> },
    { id: 'url', label: 'URL', icon: <LinkIcon className="h-3.5 w-3.5" /> },
    { id: 'lookup', label: 'Lookup', icon: <Search className="h-3.5 w-3.5" /> },
    { id: 'user', label: 'User', icon: <User className="h-3.5 w-3.5" /> },
    { id: 'file_upload', label: 'File Upload', icon: <FolderPlus className="h-3.5 w-3.5" /> },
    { id: 'address', label: 'Address ✨', icon: <Building className="h-3.5 w-3.5 text-amber-500" /> },
  ];

  // Helper to get field icon for rendering in Layout Canvas
  const renderFieldIcon = (iconType: string) => {
    switch (iconType) {
      case 'single_line':
        return <span className="font-mono text-[11px] text-slate-400 font-bold">|þ</span>;
      case 'multi_line':
        return <AlignLeft className="h-3.5 w-3.5 text-slate-400" />;
      case 'email':
        return <Mail className="h-3.5 w-3.5 text-slate-400" />;
      case 'phone':
        return <Phone className="h-3.5 w-3.5 text-slate-400" />;
      case 'pick_list':
      case 'multi_select':
        return <List className="h-3.5 w-3.5 text-slate-400" />;
      case 'date':
      case 'date_time':
        return <Calendar className="h-3.5 w-3.5 text-slate-400" />;
      case 'number':
      case 'decimal':
      case 'currency':
        return <span className="font-mono text-[11px] text-slate-400 font-bold">123</span>;
      case 'user':
        return <User className="h-3.5 w-3.5 text-slate-400" />;
      default:
        return <span className="font-mono text-[11px] text-slate-400 font-bold">|þ</span>;
    }
  };

  // Open Add Field dialog for clicked field type
  const handlePaletteFieldClick = (
    fieldTypeDef: { id: string; label: string },
    secId?: string,
    col?: 'left' | 'right',
    insertIdx?: number
  ) => {
    setNewFieldIconType(fieldTypeDef.id);
    setNewFieldNameInput(`New ${fieldTypeDef.label}`);
    setNewFieldOptionsInput(fieldTypeDef.id.includes('pick') ? 'Option 1, Option 2, Option 3' : '');
    setNewFieldRequiredInput(false);
    if (secId) setTargetSectionId(secId);
    if (col) setTargetColumn(col);
    setTargetInsertIndex(insertIdx !== undefined ? insertIdx : null);
    setIsAddFieldModalOpen(true);
  };

  // Drag handlers for Palette Items
  const handlePaletteDragStart = (
    e: React.DragEvent,
    fieldTypeDef: { id: string; label: string }
  ) => {
    const payload = {
      type: 'new_palette_field' as const,
      fieldTypeId: fieldTypeDef.id,
      label: fieldTypeDef.label,
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItem(payload);
  };

  // Drag handlers for Existing Canvas Fields
  const handleExistingFieldDragStart = (
    e: React.DragEvent,
    field: LayoutFieldItem,
    sectionId: string,
    column: 'left' | 'right',
    index: number
  ) => {
    const payload = {
      type: 'existing_field' as const,
      fieldId: field.id,
      sourceSectionId: sectionId,
      sourceColumn: column,
      sourceIndex: index,
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(payload);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropIndicator(null);
  };

  // Universal Drop Handler (Handles both new field insertion and existing field reordering)
  const handleDrop = (
    targetSecId: string,
    targetCol: 'left' | 'right',
    targetIdx: number,
    e: React.DragEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    let data: any = null;
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (raw) data = JSON.parse(raw);
    } catch {
      // fallback to state
    }
    if (!data && draggedItem) {
      data = draggedItem;
    }

    setDropIndicator(null);
    setDraggedItem(null);

    if (!data) return;

    if (data.type === 'new_palette_field') {
      // User dropped a new field from the palette!
      // Immediately open the configuration modal at the target location and position
      setNewFieldIconType(data.fieldTypeId);
      setNewFieldNameInput(`New ${data.label}`);
      setNewFieldOptionsInput(data.fieldTypeId.includes('pick') ? 'Option 1, Option 2, Option 3' : '');
      setNewFieldRequiredInput(false);
      setTargetSectionId(targetSecId);
      setTargetColumn(targetCol);
      setTargetInsertIndex(targetIdx);
      setIsAddFieldModalOpen(true);
    } else if (data.type === 'existing_field') {
      // User reordered an existing field!
      const { fieldId, sourceSectionId, sourceColumn, sourceIndex } = data;
      setLayoutSections((prev) => {
        // Find the field
        let fieldToMove: LayoutFieldItem | null = null;
        for (const s of prev) {
          if (s.id === sourceSectionId) {
            const col = sourceColumn === 'left' ? s.leftFields : s.rightFields;
            fieldToMove = col.find((f) => f.id === fieldId) || null;
            break;
          }
        }
        if (!fieldToMove) return prev;

        // Step 1: Remove field from source
        const cleaned = prev.map((s) => {
          if (s.id === sourceSectionId) {
            if (sourceColumn === 'left') {
              return { ...s, leftFields: s.leftFields.filter((f) => f.id !== fieldId) };
            } else {
              return { ...s, rightFields: s.rightFields.filter((f) => f.id !== fieldId) };
            }
          }
          return s;
        });

        // Step 2: Insert field into target
        return cleaned.map((s) => {
          if (s.id === targetSecId) {
            const targetList = targetCol === 'left' ? [...s.leftFields] : [...s.rightFields];
            let adjustedIdx = targetIdx;
            // If moved within the same column and dropped lower, adjust index by -1
            if (sourceSectionId === targetSecId && sourceColumn === targetCol && targetIdx > sourceIndex) {
              adjustedIdx = Math.max(0, targetIdx - 1);
            }
            // Clamp within bounds
            adjustedIdx = Math.min(Math.max(0, adjustedIdx), targetList.length);
            targetList.splice(adjustedIdx, 0, fieldToMove!);

            return targetCol === 'left'
              ? { ...s, leftFields: targetList }
              : { ...s, rightFields: targetList };
          }
          return s;
        });
      });

      setDragNotice('Field position updated successfully!');
      setTimeout(() => setDragNotice(null), 2500);
    }
  };

  // Save new field into layout at targetInsertIndex
  const handleConfirmAddField = () => {
    if (!newFieldNameInput.trim()) return;

    const newFieldObj: LayoutFieldItem = {
      id: `f_cust_${Date.now()}`,
      label: newFieldNameInput.trim(),
      key: newFieldNameInput.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30),
      type: newFieldIconType.includes('pick') ? 'select' : newFieldIconType === 'number' ? 'number' : newFieldIconType === 'date' ? 'date' : 'text',
      iconType: newFieldIconType,
      required: newFieldRequiredInput,
      options: newFieldOptionsInput
        ? newFieldOptionsInput.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    setLayoutSections((prev) =>
      prev.map((sec) => {
        if (sec.id === targetSectionId) {
          const list = targetColumn === 'left' ? [...sec.leftFields] : [...sec.rightFields];
          if (targetInsertIndex !== null && targetInsertIndex >= 0 && targetInsertIndex <= list.length) {
            list.splice(targetInsertIndex, 0, newFieldObj);
          } else {
            list.push(newFieldObj);
          }

          return targetColumn === 'left'
            ? { ...sec, leftFields: list }
            : { ...sec, rightFields: list };
        }
        return sec;
      })
    );

    setIsAddFieldModalOpen(false);
    setTargetInsertIndex(null);
  };

  // Remove field from layout
  const handleRemoveField = (fieldId: string) => {
    setLayoutSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        leftFields: sec.leftFields.filter((f) => f.id !== fieldId),
        rightFields: sec.rightFields.filter((f) => f.id !== fieldId),
      }))
    );
  };

  // Toggle required state on field
  const handleToggleRequired = (fieldId: string) => {
    setLayoutSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        leftFields: sec.leftFields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f)),
        rightFields: sec.rightFields.map((f) => (f.id === fieldId ? { ...f, required: !f.required } : f)),
      }))
    );
  };

  // Save Layout to Backend and sync with frontend
  const handleSaveLayout = async (andClose = false) => {
    // 1. Save full structured layoutSections (positions, reorders, new fields)
    await saveModuleLayout(selectedModuleSlug, layoutSections);

    // 2. Extract custom fields to sync with organization customFields
    const allFields: CustomFieldDefinition[] = [];
    layoutSections.forEach((sec) => {
      [...sec.leftFields, ...sec.rightFields].forEach((f) => {
        allFields.push({
          id: f.id,
          label: f.label,
          key: f.key,
          type: f.type as any,
          required: f.required,
          options: f.options,
        });
      });
    });

    if (selectedModuleSlug === 'leads') {
      await updateOrgSettings({ customFields: allFields });
    } else {
      await updateModuleLayout(selectedModuleSlug, allFields);
    }

    setLayoutSaveNotice(true);
    setTimeout(() => setLayoutSaveNotice(false), 3000);

    if (andClose) {
      navigateTo('modules_list');
    }
  };

  // =========================================================================
  // 3. PERSONAL SETTINGS (General)
  // =========================================================================
  const [personalName, setPersonalName] = useState(currentUser?.name || 'Administrator');
  const [personalEmail, setPersonalEmail] = useState(currentUser?.email || '');
  const [personalPhone, setPersonalPhone] = useState(currentUser?.phone || '');
  const [personalTimezone, setPersonalTimezone] = useState('Asia/Kolkata (IST)');
  const [personalSignature, setPersonalSignature] = useState(
    `Warm regards,\n${currentUser?.name || 'Administrator'}\n${currentOrg?.name || 'Business Workspace'}`
  );
  const [personalSaveNotice, setPersonalSaveNotice] = useState(false);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: personalName,
      email: personalEmail,
      phone: personalPhone,
    });
    setPersonalSaveNotice(true);
    setTimeout(() => setPersonalSaveNotice(false), 3000);
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-slate-50 overflow-hidden text-xs text-slate-800">
      {/* ========================================================================= */}
      {/* 1. SETUP HOME (ONLY Modules & Fields + Personal Settings as requested)    */}
      {/* ========================================================================= */}
      {currentView === 'home' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">CRM Setup</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your modules, custom fields layouts, and user profile settings.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              {currentOrg?.name || 'Business Workspace'}
            </span>
          </div>

          {/* Clean 2-Card Focus (Modules & Fields + Personal Settings) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 1: Modules and Fields (Customization) */}
            <div
              onClick={() => navigateTo('modules_list')}
              className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Settings2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-blue-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>Manage Modules</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Modules and Fields
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    View active CRM modules (Leads, Itineraries, Hotels, Vehicles, Bookings) and customize their form fields, layout, and sections in the visual layout editor.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Leads, Itineraries, Hotels & Custom Modules</span>
                <span className="font-bold text-slate-700">{modulesList.length} Modules</span>
              </div>
            </div>

            {/* CARD 2: Personal Settings (General) */}
            <div
              onClick={() => navigateTo('personal')}
              className="group cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-emerald-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>Manage Profile</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Personal Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Update your personal profile details, official phone number, email address, timezone, and your outbound email signature.
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>User: {currentUser?.name || 'Aarav Kapoor'}</span>
                <span className="font-bold text-slate-700">Administrator</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODULES LIST (1:1 with Screenshot 1: settings/modules)                 */}
      {/* ========================================================================= */}
      {currentView === 'modules_list' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Top Bar with Back to Setup Home */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Setup Home</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-900 text-sm">Modules and Fields</span>
            </div>

            <button
              onClick={() => navigateTo('personal')}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              Personal Settings →
            </button>
          </div>

          {/* Zoho Module Tabs (Modules, Web Tabs, Global Sets, etc.) */}
          <div className="border-b border-slate-200 bg-white px-4 pt-2 shrink-0">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <button className="pb-2.5 border-b-2 border-blue-600 text-blue-600">
                Modules
              </button>
              <button className="pb-2.5 text-slate-500 hover:text-slate-800">
                Web Tabs
              </button>
              <button className="pb-2.5 text-slate-500 hover:text-slate-800">
                Global Sets
              </button>
              <button className="pb-2.5 text-slate-500 hover:text-slate-800">
                Booking Management
              </button>
              <button className="pb-2.5 text-slate-500 hover:text-slate-800">
                Preferences
              </button>
            </div>
          </div>

          {/* Module Table Toolbar */}
          <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={moduleSearchQuery}
                    onChange={(e) => setModuleSearchQuery(e.target.value)}
                    placeholder="Search Module..."
                    className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 bg-white text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="hidden md:flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Custom Module
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Team Module
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo('layout_editor', 'leads')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-1.5 rounded text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create New Module</span>
                </button>
              </div>
            </div>

            {/* Modules Table (Exact 1:1 with Screenshot 1) */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Displayed In Tabs As</th>
                    <th className="px-4 py-2.5">Module Name</th>
                    <th className="px-4 py-2.5">Teamspace</th>
                    <th className="px-4 py-2.5">Shared To</th>
                    <th className="px-4 py-2.5">Last Modified</th>
                    <th className="px-4 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredModulesList.map((mod) => (
                    <tr
                      key={mod.slug}
                      onClick={() => navigateTo('layout_editor', mod.slug)}
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      title={`Click to edit ${mod.name} layout & fields`}
                    >
                      {/* Displayed In Tabs As */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 font-semibold text-blue-600 group-hover:underline">
                          <GripVertical className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover:opacity-100" />
                          <span>{mod.name}</span>
                        </div>
                      </td>

                      {/* Module Name */}
                      <td className="px-4 py-2.5 font-medium text-slate-700">
                        {mod.name}
                      </td>

                      {/* Teamspace */}
                      <td className="px-4 py-2.5 text-blue-600">
                        {mod.teamspace}
                      </td>

                      {/* Shared To */}
                      <td className="px-4 py-2.5 text-slate-600">
                        {mod.sharedTo}
                      </td>

                      {/* Last Modified */}
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          {mod.lastModified}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={(e) => toggleModuleStatus(mod.slug, e)}
                          className={`p-1 transition-colors ${
                            mod.status ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                          title={mod.status ? 'Active Module' : 'Inactive Module'}
                        >
                          {mod.status ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              💡 Tip: Click on any module name (e.g. <b>Leads</b>) to open its visual Form & Layout Builder Studio.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODULE LAYOUT STUDIO (Screenshots 2 & 3: 1:1 Zoho Layout Studio)       */}
      {/* ========================================================================= */}
      {currentView === 'layout_editor' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          {/* Top Dark Navy Header (Exact Zoho Style) */}
          <div className="flex items-center justify-between bg-[#1e293b] text-white px-4 py-2.5 shrink-0 shadow-md">
            {/* Left: Back & Layout Selector */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('modules_list')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
                title="Back to Modules"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="capitalize">{selectedModuleSlug}</span>
              </button>

              <span className="text-slate-500">•</span>

              <div className="flex items-center gap-1.5 text-xs bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700">
                <span className="font-semibold text-white">Standard</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </div>
            </div>

            {/* Center Tabs: Create | Quick Create | Detail View */}
            <div className="hidden sm:flex items-center gap-5 text-xs font-semibold">
              <button className="text-white border-b-2 border-blue-400 pb-0.5">
                Create
              </button>
              <button className="text-slate-400 hover:text-white pb-0.5">
                Quick Create
              </button>
              <button className="text-slate-400 hover:text-white pb-0.5">
                Detail View
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              {dragNotice && (
                <span className="text-xs text-blue-400 font-medium flex items-center gap-1 animate-in fade-in">
                  <Sparkles className="h-3.5 w-3.5" /> {dragNotice}
                </span>
              )}

              {layoutSaveNotice && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-in fade-in">
                  <CheckCheck className="h-3.5 w-3.5" /> Saved!
                </span>
              )}

              <button
                onClick={() => navigateTo('modules_list')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-3 py-1 rounded text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleSaveLayout(true)}
                className="border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-3 py-1 rounded text-xs transition-colors hidden md:inline-flex"
              >
                Save and Close
              </button>

              <button
                onClick={() => handleSaveLayout(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1 rounded text-xs shadow-xs transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          {/* Main Layout Studio Workspace (Left Palette + Right Canvas) */}
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT PALETTE: New Fields (Exact 2-Column Tiles from Screenshot 2) */}
            <aside className="w-56 shrink-0 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col justify-between overflow-y-auto p-3 text-xs select-none">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>New Fields</span>
                  <ChevronDown className="h-3 w-3" />
                </div>

                {/* 2-Column Grid of 20 Field Types (Draggable & Clickable) */}
                <div className="grid grid-cols-2 gap-1.5">
                  {paletteFieldTypes.map((ft) => (
                    <button
                      key={ft.id}
                      draggable={true}
                      onDragStart={(e) => handlePaletteDragStart(e, ft)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handlePaletteFieldClick(ft)}
                      className="flex items-center gap-1.5 p-2 rounded bg-slate-800/80 hover:bg-blue-600 hover:text-white border border-slate-700/60 text-[11px] font-medium text-slate-200 transition-all text-left shadow-2xs truncate cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-95"
                      title={`Drag onto layout or click to add ${ft.label}`}
                    >
                      <span className="shrink-0">{ft.icon}</span>
                      <span className="truncate">{ft.label}</span>
                    </button>
                  ))}
                </div>

                {/* Section Creator Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const title = prompt('Enter New Section Title:', 'Custom Information');
                      if (title && title.trim()) {
                        setLayoutSections([
                          ...layoutSections,
                          {
                            id: `sec_${Date.now()}`,
                            title: title.trim(),
                            leftFields: [],
                            rightFields: [],
                          },
                        ]);
                      }
                    }}
                    className="w-full flex items-center justify-center gap-1.5 p-2 rounded border border-dashed border-slate-600 hover:border-blue-400 text-slate-300 hover:text-blue-400 font-semibold text-xs transition-colors"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>+ NEW SECTION</span>
                  </button>
                </div>
              </div>

              {/* Drag & Drop Guidance Footer */}
              <div className="pt-3 border-t border-slate-800 text-[10px] space-y-1">
                <div className="flex items-center gap-1 text-blue-400 font-semibold">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span>Drag & Drop Enabled</span>
                </div>
                <p className="text-slate-400 leading-tight">
                  Drag any field tile from here and drop directly onto the form. Or drag existing fields to reorder!
                </p>
              </div>
            </aside>

            {/* MAIN CANVAS: Visual Form Layout (2-Column Grid with full Drag & Drop Reordering) */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {layoutSections.map((sec) => (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-300/80 bg-white p-4 shadow-xs space-y-3"
                >
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h3 className="font-bold text-xs text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{sec.title}</span>
                      <span className="text-[10px] font-normal text-slate-400">
                        ({sec.leftFields.length + sec.rightFields.length} fields)
                      </span>
                    </h3>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setTargetSectionId(sec.id);
                          handlePaletteFieldClick({ id: 'single_line', label: 'Single Line' }, sec.id, 'left', 0);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded hover:bg-blue-50"
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>

                  {/* 2-Column Grid of Fields (Exact Zoho Layout Studio UI) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    {/* LEFT COLUMN */}
                    <div className="space-y-1.5 flex flex-col">
                      {sec.leftFields.map((field, idx) => (
                        <React.Fragment key={field.id}>
                          {/* Visual Drop Insertion Line (Before item) */}
                          {dropIndicator?.sectionId === sec.id &&
                            dropIndicator.column === 'left' &&
                            dropIndicator.index === idx && (
                              <div className="h-1 bg-blue-600 rounded-full shadow-md my-0.5 animate-pulse relative flex items-center">
                                <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                              </div>
                            )}

                          <div
                            draggable={true}
                            onDragStart={(e) => handleExistingFieldDragStart(e, field, sec.id, 'left', idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const isUpper = e.clientY < rect.top + rect.height / 2;
                              const insertIdx = isUpper ? idx : idx + 1;
                              if (
                                !dropIndicator ||
                                dropIndicator.sectionId !== sec.id ||
                                dropIndicator.column !== 'left' ||
                                dropIndicator.index !== insertIdx
                              ) {
                                setDropIndicator({ sectionId: sec.id, column: 'left', index: insertIdx });
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const isUpper = e.clientY < rect.top + rect.height / 2;
                              const insertIdx = isUpper ? idx : idx + 1;
                              handleDrop(sec.id, 'left', insertIdx, e);
                            }}
                            className={`group relative flex items-center justify-between min-h-[36px] rounded border bg-white px-2.5 py-1.5 transition-all shadow-2xs select-none cursor-grab active:cursor-grabbing ${
                              draggedItem?.type === 'existing_field' && draggedItem.fieldId === field.id
                                ? 'opacity-30 border-dashed border-blue-400 bg-blue-50/50 scale-[0.98]'
                                : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                            }`}
                          >
                            {/* Red bar on left if mandatory (exact Zoho style from screenshot 2) */}
                            {field.required && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l" />
                            )}

                            <div className="flex items-center gap-2 truncate pl-1">
                              <span
                                className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </span>
                              <span className="shrink-0">{renderFieldIcon(field.iconType)}</span>
                              <span className="font-medium text-slate-800 truncate">
                                {field.label}
                              </span>
                              {field.salutation && (
                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                                  Mr. ▾
                                </span>
                              )}
                            </div>

                            {/* Options dots menu on hover */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleRequired(field.id)}
                                className={`p-1 rounded text-[10px] font-bold ${
                                  field.required
                                    ? 'text-rose-600 bg-rose-50'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={field.required ? 'Make Optional' : 'Make Required'}
                              >
                                *
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveField(field.id)}
                                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                title="Delete Field"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}

                      {/* Drop indicator if hovering at the bottom */}
                      {dropIndicator?.sectionId === sec.id &&
                        dropIndicator.column === 'left' &&
                        dropIndicator.index === sec.leftFields.length && (
                          <div className="h-1 bg-blue-600 rounded-full shadow-md my-0.5 animate-pulse relative flex items-center">
                            <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                          </div>
                        )}

                      {/* Designated Bottom Drop Zone Box */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            !dropIndicator ||
                            dropIndicator.sectionId !== sec.id ||
                            dropIndicator.column !== 'left' ||
                            dropIndicator.index !== sec.leftFields.length
                          ) {
                            setDropIndicator({ sectionId: sec.id, column: 'left', index: sec.leftFields.length });
                          }
                        }}
                        onDrop={(e) => handleDrop(sec.id, 'left', sec.leftFields.length, e)}
                        className={`min-h-[34px] rounded border border-dashed flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                          dropIndicator?.sectionId === sec.id &&
                          dropIndicator?.column === 'left' &&
                          dropIndicator.index === sec.leftFields.length
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold py-2 scale-[1.01]'
                            : 'border-slate-200/90 text-slate-400 hover:border-slate-300 hover:bg-slate-50/50 py-1.5'
                        }`}
                        onClick={() => {
                          setTargetSectionId(sec.id);
                          setTargetColumn('left');
                          setTargetInsertIndex(sec.leftFields.length);
                          handlePaletteFieldClick({ id: 'single_line', label: 'Single Line' }, sec.id, 'left', sec.leftFields.length);
                        }}
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3 w-3" />
                          {sec.leftFields.length === 0 ? 'Drop field here or click to add' : 'Drop field here at bottom'}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="space-y-1.5 flex flex-col">
                      {sec.rightFields.map((field, idx) => (
                        <React.Fragment key={field.id}>
                          {/* Visual Drop Insertion Line (Before item) */}
                          {dropIndicator?.sectionId === sec.id &&
                            dropIndicator.column === 'right' &&
                            dropIndicator.index === idx && (
                              <div className="h-1 bg-blue-600 rounded-full shadow-md my-0.5 animate-pulse relative flex items-center">
                                <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                              </div>
                            )}

                          <div
                            draggable={true}
                            onDragStart={(e) => handleExistingFieldDragStart(e, field, sec.id, 'right', idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const isUpper = e.clientY < rect.top + rect.height / 2;
                              const insertIdx = isUpper ? idx : idx + 1;
                              if (
                                !dropIndicator ||
                                dropIndicator.sectionId !== sec.id ||
                                dropIndicator.column !== 'right' ||
                                dropIndicator.index !== insertIdx
                              ) {
                                setDropIndicator({ sectionId: sec.id, column: 'right', index: insertIdx });
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const isUpper = e.clientY < rect.top + rect.height / 2;
                              const insertIdx = isUpper ? idx : idx + 1;
                              handleDrop(sec.id, 'right', insertIdx, e);
                            }}
                            className={`group relative flex items-center justify-between min-h-[36px] rounded border bg-white px-2.5 py-1.5 transition-all shadow-2xs select-none cursor-grab active:cursor-grabbing ${
                              draggedItem?.type === 'existing_field' && draggedItem.fieldId === field.id
                                ? 'opacity-30 border-dashed border-blue-400 bg-blue-50/50 scale-[0.98]'
                                : 'border-slate-200 hover:border-blue-400 hover:shadow-xs'
                            }`}
                          >
                            {field.required && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l" />
                            )}

                            <div className="flex items-center gap-2 truncate pl-1">
                              <span
                                className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-0.5 shrink-0"
                                title="Drag to reorder"
                              >
                                <GripVertical className="h-3.5 w-3.5" />
                              </span>
                              <span className="shrink-0">{renderFieldIcon(field.iconType)}</span>
                              <div className="truncate">
                                <span className="font-medium text-slate-800 truncate block">
                                  {field.label}
                                </span>
                                {field.hint && (
                                  <span className="text-[10px] text-slate-400 italic block truncate">
                                    {field.hint}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button
                                type="button"
                                onClick={() => handleToggleRequired(field.id)}
                                className={`p-1 rounded text-[10px] font-bold ${
                                  field.required
                                    ? 'text-rose-600 bg-rose-50'
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                                title={field.required ? 'Make Optional' : 'Make Required'}
                              >
                                *
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveField(field.id)}
                                className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                                title="Delete Field"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </React.Fragment>
                      ))}

                      {/* Drop indicator if hovering at the bottom */}
                      {dropIndicator?.sectionId === sec.id &&
                        dropIndicator.column === 'right' &&
                        dropIndicator.index === sec.rightFields.length && (
                          <div className="h-1 bg-blue-600 rounded-full shadow-md my-0.5 animate-pulse relative flex items-center">
                            <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                          </div>
                        )}

                      {/* Designated Bottom Drop Zone Box */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (
                            !dropIndicator ||
                            dropIndicator.sectionId !== sec.id ||
                            dropIndicator.column !== 'right' ||
                            dropIndicator.index !== sec.rightFields.length
                          ) {
                            setDropIndicator({ sectionId: sec.id, column: 'right', index: sec.rightFields.length });
                          }
                        }}
                        onDrop={(e) => handleDrop(sec.id, 'right', sec.rightFields.length, e)}
                        className={`min-h-[34px] rounded border border-dashed flex items-center justify-center text-[11px] transition-all cursor-pointer ${
                          dropIndicator?.sectionId === sec.id &&
                          dropIndicator?.column === 'right' &&
                          dropIndicator.index === sec.rightFields.length
                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold py-2 scale-[1.01]'
                            : 'border-slate-200/90 text-slate-400 hover:border-slate-300 hover:bg-slate-50/50 py-1.5'
                        }`}
                        onClick={() => {
                          setTargetSectionId(sec.id);
                          setTargetColumn('right');
                          setTargetInsertIndex(sec.rightFields.length);
                          handlePaletteFieldClick({ id: 'single_line', label: 'Single Line' }, sec.id, 'right', sec.rightFields.length);
                        }}
                      >
                        <span className="flex items-center gap-1.5">
                          <Plus className="h-3 w-3" />
                          {sec.rightFields.length === 0 ? 'Drop field here or click to add' : 'Drop field here at bottom'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </main>
          </div>

          {/* Add Field Modal (Instant Pop-up on Drop or Click) */}
          {isAddFieldModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Configure Field ({newFieldIconType.replace('_', ' ')})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Enter the field details to place into layout
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddFieldModalOpen(false);
                      setTargetInsertIndex(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Target Drop Position Indicator */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[11px] text-blue-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    Placement:{' '}
                    <b>{layoutSections.find((s) => s.id === targetSectionId)?.title || 'Section'}</b> →{' '}
                    <span className="capitalize">{targetColumn} column</span>{' '}
                    {targetInsertIndex !== null ? `(Position #${targetInsertIndex + 1})` : ''}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Field Name / Label *</label>
                    <input
                      type="text"
                      autoFocus
                      value={newFieldNameInput}
                      onChange={(e) => setNewFieldNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleConfirmAddField();
                        }
                      }}
                      placeholder="e.g. Visa Status, Emergency Contact, Meal Plan"
                      className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs font-medium"
                    />
                  </div>

                  {newFieldIconType.includes('pick') && (
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Dropdown Options (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newFieldOptionsInput}
                        onChange={(e) => setNewFieldOptionsInput(e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                        className="w-full rounded border border-slate-300 p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 shadow-2xs"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Section</label>
                      <select
                        value={targetSectionId}
                        onChange={(e) => setTargetSectionId(e.target.value)}
                        className="w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900"
                      >
                        {layoutSections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Column</label>
                      <select
                        value={targetColumn}
                        onChange={(e) => setTargetColumn(e.target.value as any)}
                        className="w-full rounded border border-slate-300 p-1.5 text-xs text-slate-900"
                      >
                        <option value="left">Left Column</option>
                        <option value="right">Right Column</option>
                      </select>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1 font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newFieldRequiredInput}
                      onChange={(e) => setNewFieldRequiredInput(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Mark as Mandatory / Required (red bar)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsAddFieldModalOpen(false);
                      setTargetInsertIndex(null);
                    }}
                    className="px-3 py-1.5 rounded text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAddField}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Insert Field into Layout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PERSONAL SETTINGS (Clean User Profile Screen)                          */}
      {/* ========================================================================= */}
      {currentView === 'personal' && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Top Bar with Back to Setup Home */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigateTo('home')}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Setup Home</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="font-bold text-slate-900 text-sm">Personal Settings</span>
            </div>

            <button
              onClick={() => navigateTo('modules_list')}
              className="text-xs text-slate-600 hover:text-blue-600 font-medium"
            >
              Modules and Fields →
            </button>
          </div>

          <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
            <div className="max-w-2xl mx-auto bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Personal Details</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage your CRM profile name, official email, phone, and outbound signature.
                  </p>
                </div>
                {personalSaveNotice && (
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded flex items-center gap-1 animate-in fade-in">
                    <CheckCheck className="h-3.5 w-3.5" /> Saved!
                  </span>
                )}
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={personalName}
                      onChange={(e) => setPersonalName(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={personalEmail}
                      onChange={(e) => setPersonalEmail(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Phone</label>
                    <input
                      type="text"
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                    <select
                      value={personalTimezone}
                      onChange={(e) => setPersonalTimezone(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                    >
                      <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST +5:30)</option>
                      <option value="Asia/Dubai (GST)">Asia/Dubai (GST +4:00)</option>
                      <option value="Europe/London (GMT)">Europe/London (GMT +0:00)</option>
                      <option value="America/New_York (EST)">America/New_York (EST -5:00)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Signature</label>
                  <textarea
                    rows={4}
                    value={personalSignature}
                    onChange={(e) => setPersonalSignature(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Appended automatically to outbound emails sent from the CRM.
                  </p>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded text-xs shadow-xs transition-colors"
                  >
                    Save Personal Details
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
