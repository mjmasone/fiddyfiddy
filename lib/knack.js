/**
 * Knack API Wrapper
 * Handles all database operations
 */

const KNACK_APP_ID = process.env.KNACK_APP_ID;
const KNACK_API_KEY = process.env.KNACK_API_KEY;
const BASE_URL = 'https://api.knack.com/v1';

const OBJECTS = {
  settings: 'object_4',
  users: 'object_5',
  raffles: 'object_6',
  tickets: 'object_7',
  drawLog: 'object_8',
  transactions: 'object_9',
};

// Standard headers for all requests
const headers = {
  'X-Knack-Application-Id': KNACK_APP_ID,
  'X-Knack-REST-API-Key': KNACK_API_KEY,
  'Content-Type': 'application/json',
};

/**
 * Generic API request handler
 */
async function knackRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Knack API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ===========================================
// SETTINGS
// ===========================================

export async function getSettings() {
  const data = await knackRequest(`/objects/${OBJECTS.settings}/records`);
  return data.records[0] || null;
}

// ===========================================
// USERS
// ===========================================

export async function getUserByEmail(email) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [{ field: 'field_57', operator: 'is', value: email }]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.users}/records?filters=${filters}`);
  
  if (data.records[0]) {
    // Map Knack fields to friendly names
    const user = data.records[0];
    return {
      id: user.id,
      email: user.field_57_raw?.email || user.field_57_raw || user.field_57?.replace?.(/<[^>]*>/g, '') || user.field_57,
      password: user.field_58,
      role: user.field_59,
      name: user.field_60,
      venmo_handle: user.field_61,
      phone: user.field_62,
      status: user.field_63,
    };
  }
  return null;
}

export async function getUserById(id) {
  const user = await knackRequest(`/objects/${OBJECTS.users}/records/${id}`);
  return {
    id: user.id,
    email: user.field_57_raw?.email || user.field_57_raw || user.field_57?.replace?.(/<[^>]*>/g, '') || user.field_57,
    password: user.field_58,
    role: user.field_59,
    name: user.field_60,
    venmo_handle: user.field_61,
    phone: user.field_62,
    status: user.field_63,
  };
}

export async function getAllUsers() {
  const data = await knackRequest(`/objects/${OBJECTS.users}/records?rows_per_page=1000`);
  return data.records;
}

export async function createUser(userData) {
  return knackRequest(`/objects/${OBJECTS.users}/records`, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function updateUser(id, userData) {
  return knackRequest(`/objects/${OBJECTS.users}/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
}

// ===========================================
// RAFFLES
// ===========================================

// Helper to parse Knack currency values 
// Knack returns currency as "$1.00" string OR as raw number OR as object with raw value
function parseCurrency(value) {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  // If it's an object with a raw value (Knack sometimes does this)
  if (typeof value === 'object' && value !== null) {
    if (value.raw !== undefined) return parseFloat(value.raw) || 0;
    if (value.value !== undefined) return parseFloat(String(value.value).replace(/[$,]/g, '')) || 0;
  }
  // Remove $ and commas, then parse
  const cleaned = String(value).replace(/[$,]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Helper to map Knack raffle record to friendly names
function mapRaffleFields(record) {
  if (!record) return null;
  return {
    id: record.id,
    raffle_name: record.field_117,
    beneficiary_name: record.field_64,
    beneficiary_type: record.field_65,
    beneficiary_venmo: record.field_118,
    // Try raw value first, then formatted
    ticket_price: parseCurrency(record.field_66_raw ?? record.field_66),
    max_tickets: parseInt(record.field_67_raw ?? record.field_67) || 0,
    tickets_sold: parseInt(record.field_68_raw ?? record.field_68) || 0,
    status: record.field_69,
    draw_trigger: record.field_70 || 'Manual',
    draw_time: record.field_71,
    draw_ticket_count: parseInt(record.field_72_raw ?? record.field_72) || 0,
    is_public: record.field_73 === true || record.field_73 === 'Yes' || record.field_73 === 'yes',
    ticket_prefix: record.field_74,
    organizer_venmo: record.field_75,
    logo: record.field_76,
    logo_url: record.field_119,
    theme_color: record.field_120,
    state_restrictions: record.field_77,
    owner_prime: parseInt(record.field_78_raw ?? record.field_78) || 11,
    min_tickets_enabled: record.field_79 === true || record.field_79 === 'Yes' || record.field_79 === 'yes',
    min_tickets: parseInt(record.field_80_raw ?? record.field_80) || 11,
    redraw_count: parseInt(record.field_81_raw ?? record.field_81) || 0,
    drawn_at: record.field_82,
    organizer: record.field_83_raw?.[0]?.id || record.field_83,
    winning_ticket: record.field_84_raw?.[0]?.id || record.field_84,
    payout_confirmed: record.field_85 === true || record.field_85 === 'Yes' || record.field_85 === 'yes',
    payout_confirmed_at: record.field_86,
    jackpot_current: record.field_87,
    tickets_remaining: record.field_88,
    suggested_max: record.field_89,
    redraws_remaining: record.field_90,
  };
}

export async function getRaffles(filters = {}) {
  let endpoint = `/objects/${OBJECTS.raffles}/records?sort_field=field_64&sort_order=desc`;
  
  if (filters.status) {
    const filterObj = encodeURIComponent(JSON.stringify({
      match: 'and',
      rules: [{ field: 'field_69', operator: 'is', value: filters.status }]
    }));
    endpoint += `&filters=${filterObj}`;
  }

  const data = await knackRequest(endpoint);
  return data.records.map(mapRaffleFields);
}

export async function getActivePublicRaffles() {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [
      { field: 'field_69', operator: 'is', value: 'Active' },
      { field: 'field_73', operator: 'is', value: true }
    ]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.raffles}/records?filters=${filters}`);
  return data.records.map(mapRaffleFields);
}

export async function getRaffleById(id, debug = false) {
  const record = await knackRequest(`/objects/${OBJECTS.raffles}/records/${id}`);
  if (debug) {
    // Return raw Knack data for debugging
    return { _raw: record, _mapped: mapRaffleFields(record) };
  }
  return mapRaffleFields(record);
}

export async function getRafflesByOrganizer(organizerId) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [{ field: 'field_83', operator: 'is', value: organizerId }]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.raffles}/records?filters=${filters}`);
  return data.records.map(mapRaffleFields);
}

// Helper to map friendly raffle names back to Knack field IDs
function mapRaffleToKnack(data) {
  const mapping = {
    raffle_name: 'field_117',
    beneficiary_name: 'field_64',
    beneficiary_type: 'field_65',
    beneficiary_venmo: 'field_118',
    ticket_price: 'field_66',
    max_tickets: 'field_67',
    tickets_sold: 'field_68',
    status: 'field_69',
    draw_trigger: 'field_70',
    draw_time: 'field_71',
    draw_ticket_count: 'field_72',
    is_public: 'field_73',
    ticket_prefix: 'field_74',
    organizer_venmo: 'field_75',
    logo: 'field_76',
    logo_url: 'field_119',
    theme_color: 'field_120', 
    state_restrictions: 'field_77',
    owner_prime: 'field_78',
    min_tickets_enabled: 'field_79',
    min_tickets: 'field_80',
    redraw_count: 'field_81',
    drawn_at: 'field_82',
    organizer: 'field_83',
    winning_ticket: 'field_84',
    payout_confirmed: 'field_85',
    payout_confirmed_at: 'field_86',
  };
  
  // Connection fields that need array format
  const connectionFields = ['organizer', 'winning_ticket'];
  
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (mapping[key]) {
      // Connection fields need to be sent as array of IDs
      if (connectionFields.includes(key) && value) {
        result[mapping[key]] = [value];
      } else {
        result[mapping[key]] = value;
      }
    }
  }
  return result;
}

export async function createRaffle(raffleData) {
  const knackData = mapRaffleToKnack(raffleData);
  return knackRequest(`/objects/${OBJECTS.raffles}/records`, {
    method: 'POST',
    body: JSON.stringify(knackData),
  });
}

export async function updateRaffle(id, raffleData) {
  const knackData = mapRaffleToKnack(raffleData);
  return knackRequest(`/objects/${OBJECTS.raffles}/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(knackData),
  });
}

export async function deleteRaffle(id) {
  return knackRequest(`/objects/${OBJECTS.raffles}/records/${id}`, {
    method: 'DELETE',
  });
}

// ===========================================
// TICKETS
// ===========================================

// Helper to strip HTML from Knack fields (email fields return HTML)
function stripHtml(value) {
  if (!value) return '';
  if (typeof value !== 'string') return String(value);
  // Remove HTML tags
  return value.replace(/<[^>]*>/g, '');
}

// Helper to map Knack ticket record to friendly names
function mapTicketFields(record) {
  if (!record) return null;
  
  // Extract email - Knack returns HTML like <a href="mailto:x@y.com">x@y.com</a>
  let email = record.field_94_raw?.email || record.field_94_raw || record.field_94 || '';
  email = stripHtml(email);
  
  return {
    id: record.id,
    raffle: record.field_91_raw?.[0]?.id || record.field_91,
    ticket_number: record.field_92,
    sequence_number: parseInt(record.field_93) || 0,
    player_email: email,
    player_venmo: stripHtml(record.field_95),
    venmo_note: record.field_96,
    venmo_txn_id: record.field_97,
    status: record.field_98 || 'Pending',
    payment_recipient: record.field_99,
    created_at: record.field_100,
    verified_at: record.field_101,
  };
}

// Helper to map friendly ticket names back to Knack field IDs
function mapTicketToKnack(data) {
  const mapping = {
    raffle: 'field_91',           // Connection to Raffles
    ticket_number: 'field_92',
    sequence_number: 'field_93',
    player_email: 'field_94',
    player_venmo: 'field_95',
    venmo_note: 'field_96',
    venmo_txn_id: 'field_97',
    status: 'field_98',
    payment_recipient: 'field_99',
    // field_100 = created_at (auto-managed by Knack)
    // field_101 = verified_at
  };
  
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (mapping[key] && value !== undefined && value !== null) {
      // Connection fields (raffle) need to be sent as array of IDs
      if (key === 'raffle' && value) {
        result[mapping[key]] = [value]; // Knack expects array for connections
      } else {
        result[mapping[key]] = value;
      }
    }
  }
  return result;
}

export async function getTicketsByRaffle(raffleId) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [{ field: 'field_91', operator: 'is', value: raffleId }]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.tickets}/records?filters=${filters}`);
  return data.records.map(mapTicketFields);
}

export async function getTicketByNumber(ticketNumber) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [{ field: 'field_92', operator: 'is', value: ticketNumber }]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.tickets}/records?filters=${filters}`);
  return data.records[0] ? mapTicketFields(data.records[0]) : null;
}

export async function getTicketById(id) {
  const record = await knackRequest(`/objects/${OBJECTS.tickets}/records/${id}`);
  return mapTicketFields(record);
}

export async function getPendingTickets(raffleId) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [
      { field: 'field_91', operator: 'is', value: raffleId },
      { field: 'field_98', operator: 'is', value: 'Pending' }
    ]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.tickets}/records?filters=${filters}`);
  return data.records.map(mapTicketFields);
}

export async function getEligibleTickets(raffleId) {
  // Tickets that are Verified or Confirmed
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [
      { field: 'field_91', operator: 'is', value: raffleId },
      { field: 'field_98', operator: 'is not', value: 'Pending' },
      { field: 'field_98', operator: 'is not', value: 'Invalid' }
    ]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.tickets}/records?filters=${filters}`);
  return data.records.map(mapTicketFields);
}

export async function createTicket(ticketData) {
  const knackData = mapTicketToKnack(ticketData);
  return knackRequest(`/objects/${OBJECTS.tickets}/records`, {
    method: 'POST',
    body: JSON.stringify(knackData),
  });
}

export async function updateTicket(id, ticketData) {
  const knackData = mapTicketToKnack(ticketData);
  return knackRequest(`/objects/${OBJECTS.tickets}/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(knackData),
  });
}

export async function countTicketsByRaffle(raffleId) {
  const tickets = await getTicketsByRaffle(raffleId);
  return tickets.length;
}

// ===========================================
// DRAW LOG
// ===========================================

export async function getDrawLogByRaffle(raffleId) {
  const filters = encodeURIComponent(JSON.stringify({
    match: 'and',
    rules: [{ field: 'field_raffle', operator: 'is', value: raffleId }]
  }));
  const data = await knackRequest(`/objects/${OBJECTS.drawLog}/records?filters=${filters}&sort_field=field_draw_number&sort_order=asc`);
  return data.records;
}

export async function createDrawLogEntry(logData) {
  return knackRequest(`/objects/${OBJECTS.drawLog}/records`, {
    method: 'POST',
    body: JSON.stringify(logData),
  });
}

// ===========================================
// TRANSACTIONS
// ===========================================

export async function createTransaction(transactionData) {
  return knackRequest(`/objects/${OBJECTS.transactions}/records`, {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
}

export async function updateTransaction(id, transactionData) {
  return knackRequest(`/objects/${OBJECTS.transactions}/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  });
}

// ===========================================
// FIELD MAPPING HELPERS
// ===========================================

/**
 * Maps friendly field names to Knack field IDs
 * Based on actual Knack schema - January 2025
 */
export const FIELD_MAP = {
  // Settings fields (field_49 - field_56)
  settings: {
    owner_venmo: 'field_49',
    owner_prime_default: 'field_50',
    restricted_states: 'field_51',
    refund_window_days: 'field_52',
    payout_deadline_hours: 'field_53',
    max_redraws: 'field_54',
    support_email: 'field_55',
    platform_name: 'field_56',
  },
  // User fields (field_57 - field_63)
  users: {
    email: 'field_57',
    password: 'field_58',
    role: 'field_59',
    name: 'field_60',
    venmo_handle: 'field_61',
    phone: 'field_62',
    status: 'field_63',
  },
  // Raffle fields (field_64 - field_90, field_117-118)
  raffles: {
    raffle_name: 'field_117',
    beneficiary_name: 'field_64',
    beneficiary_type: 'field_65',
    beneficiary_venmo: 'field_118',
    ticket_price: 'field_66',
    max_tickets: 'field_67',
    tickets_sold: 'field_68',
    status: 'field_69',
    draw_trigger: 'field_70',
    draw_time: 'field_71',
    draw_ticket_count: 'field_72',
    is_public: 'field_73',
    ticket_prefix: 'field_74',
    organizer_venmo: 'field_75',
    logo: 'field_76',
    state_restrictions: 'field_77',
    owner_prime: 'field_78',
    min_tickets_enabled: 'field_79',
    min_tickets: 'field_80',
    redraw_count: 'field_81',
    drawn_at: 'field_82',
    organizer: 'field_83',           // Connection to Users
    winning_ticket: 'field_84',      // Connection to Tickets
    payout_confirmed: 'field_85',
    payout_confirmed_at: 'field_86',
    // Calculated/Equation fields (read-only)
    jackpot_current: 'field_87',
    tickets_remaining: 'field_88',
    suggested_max: 'field_89',
    redraws_remaining: 'field_90',
  },
  // Ticket fields (field_91 - field_101)
  tickets: {
    raffle: 'field_91',              // Connection to Raffles
    ticket_number: 'field_92',
    sequence_number: 'field_93',
    player_email: 'field_94',
    player_venmo: 'field_95',
    venmo_note: 'field_96',
    venmo_txn_id: 'field_97',
    status: 'field_98',
    payment_recipient: 'field_99',
    created_at: 'field_100',         // Auto-managed date
    verified_at: 'field_101',
  },
  // Draw Log fields (field_102 - field_107)
  drawLog: {
    raffle: 'field_102',             // Connection to Raffles
    ticket: 'field_103',             // Connection to Tickets
    draw_number: 'field_104',
    result: 'field_105',
    reason: 'field_106',
    timestamp: 'field_107',
  },
  // Transaction fields (field_108 - field_116)
  transactions: {
    raffle: 'field_108',             // Connection to Raffles
    ticket: 'field_109',             // Connection to Tickets
    type: 'field_110',
    amount: 'field_111',
    from_venmo: 'field_112',
    to_venmo: 'field_113',
    status: 'field_114',
    confirmed_at: 'field_115',
    notes: 'field_116',
  },
};

export { OBJECTS };
