import { LayoutSectionItem, LayoutFieldItem, CustomFieldDefinition } from '@/types';

export const defaultLeadSections: LayoutSectionItem[] = [
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

export function getDefaultSectionsForModule(
  moduleSlug: string,
  moduleName?: string,
  fields?: CustomFieldDefinition[]
): LayoutSectionItem[] {
  if (moduleSlug === 'leads') {
    return defaultLeadSections;
  }

  if (fields && fields.length > 0) {
    const left: LayoutFieldItem[] = [];
    const right: LayoutFieldItem[] = [];
    fields.forEach((f, idx) => {
      const item: LayoutFieldItem = {
        id: f.id || `f_${idx}`,
        label: f.label,
        key: f.key,
        type: f.type,
        iconType: f.type === 'select' ? 'pick_list' : f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'single_line',
        required: f.required,
        options: f.options,
      };
      if (idx % 2 === 0) left.push(item);
      else right.push(item);
    });

    return [
      {
        id: `sec_${moduleSlug}_main`,
        title: `${moduleName || moduleSlug} Information`,
        leftFields: left,
        rightFields: right,
      },
    ];
  }

  // Generic fallback 2-column section
  return [
    {
      id: `sec_${moduleSlug}_general`,
      title: `${moduleName || 'Module'} Details`,
      leftFields: [
        { id: `f_${moduleSlug}_name`, label: 'Name', key: 'name', type: 'text', iconType: 'single_line', required: true },
        { id: `f_${moduleSlug}_code`, label: 'Code / ID', key: 'code', type: 'text', iconType: 'single_line' },
        { id: `f_${moduleSlug}_status`, label: 'Status', key: 'status', type: 'select', iconType: 'pick_list', options: ['Active', 'Pending', 'Inactive'] },
      ],
      rightFields: [
        { id: `f_${moduleSlug}_owner`, label: 'Owner / Manager', key: 'owner', type: 'text', iconType: 'user' },
        { id: `f_${moduleSlug}_notes`, label: 'Remarks', key: 'notes', type: 'text', iconType: 'multi_line' },
      ],
    },
  ];
}
