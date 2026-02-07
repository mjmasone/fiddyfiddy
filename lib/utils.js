/**
 * Utility Functions
 * Common helpers used throughout the app
 */

import QRCode from 'qrcode';

// ===========================================
// TICKET NUMBER GENERATION
// ===========================================

/**
 * Generate a ticket number
 * Format: PREFIX-YYYYMMDD-SEQUENCE
 * @param {string} prefix - Ticket prefix (e.g., "TIGERS")
 * @param {number} sequence - Sequence number
 * @returns {string} Ticket number
 */
export function generateTicketNumber(prefix, sequence) {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seqStr = String(sequence).padStart(4, '0');
  return `${prefix.toUpperCase()}-${dateStr}-${seqStr}`;
}

// ===========================================
// JACKPOT CALCULATIONS
// ===========================================

/**
 * Calculate max tickets to keep jackpot under $600
 * @param {number} ticketPrice - Price per ticket
 * @returns {number} Maximum tickets allowed
 */
export function calculateMaxTickets(ticketPrice) {
  // Jackpot = 50% of gross
  // Max jackpot = $600
  // So max gross = $1200
  return Math.floor(1200 / ticketPrice);
}

/**
 * Calculate current jackpot
 * @param {number} ticketsSold - Number of tickets sold
 * @param {number} ticketPrice - Price per ticket
 * @returns {number} Current jackpot amount
 */
export function calculateJackpot(ticketsSold, ticketPrice) {
  return (ticketsSold * ticketPrice * 0.5).toFixed(2);
}

/**
 * Calculate tickets remaining
 * @param {number} maxTickets - Maximum tickets
 * @param {number} ticketsSold - Tickets already sold
 * @returns {number} Remaining tickets
 */
export function calculateTicketsRemaining(maxTickets, ticketsSold) {
  return Math.max(0, maxTickets - ticketsSold);
}

// ===========================================
// QR CODE GENERATION
// ===========================================

/**
 * Generate QR code as data URL
 * @param {string} url - URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<string>} Data URL
 */
export async function generateQRCode(url, options = {}) {
  const defaultOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff',
    },
  };
  
  return QRCode.toDataURL(url, { ...defaultOptions, ...options });
}

/**
 * Generate QR code as SVG string
 * @param {string} url - URL to encode
 * @returns {Promise<string>} SVG string
 */
export async function generateQRCodeSVG(url) {
  return QRCode.toString(url, { type: 'svg' });
}

// ===========================================
// STATE RESTRICTIONS
// ===========================================

const RESTRICTED_STATES = ['AL', 'HI', 'UT'];

/**
 * Check if a state is restricted
 * @param {string} stateCode - Two-letter state code
 * @param {array} additionalRestrictions - Additional restricted states
 * @returns {boolean} True if restricted
 */
export function isStateRestricted(stateCode, additionalRestrictions = []) {
  const allRestricted = [...RESTRICTED_STATES, ...additionalRestrictions];
  return allRestricted.includes(stateCode.toUpperCase());
}

/**
 * Get all US states
 * @returns {array} Array of { code, name }
 */
export function getUSStates() {
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];
}

// ===========================================
// DATE/TIME HELPERS
// ===========================================

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date and time
 */
export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Check if a time-based draw should trigger
 * @param {string} drawTime - Scheduled draw time
 * @returns {boolean} True if should trigger
 */
export function shouldTriggerTimeDraw(drawTime) {
  if (!drawTime) return false;
  return new Date() >= new Date(drawTime);
}

// ===========================================
// CURRENCY FORMATTING
// ===========================================

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// ===========================================
// VALIDATION
// ===========================================

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/**
 * Validate ticket prefix
 * @param {string} prefix - Prefix to validate
 * @returns {boolean} True if valid
 */
export function isValidPrefix(prefix) {
  // 1-10 uppercase alphanumeric characters
  const pattern = /^[A-Z0-9]{1,10}$/;
  return pattern.test(prefix.toUpperCase());
}

// ===========================================
// DRAW TRIGGER INFO
// ===========================================

/**
 * Get human-readable draw trigger info
 * @param {object} raffle - Raffle object
 * @returns {string} Draw trigger description
 */
export function getDrawTriggerInfo(raffle) {
  switch (raffle.draw_trigger) {
    case 'Time':
      return raffle.draw_time 
        ? `Scheduled for ${formatDateTime(raffle.draw_time)}`
        : 'Scheduled (time TBD)';
    case 'TicketCount':
      return `When ${raffle.draw_ticket_count} tickets sold (${raffle.tickets_sold || 0} so far)`;
    case 'Manual':
    default:
      return 'Organizer will draw manually';
  }
}

// ===========================================
// ERROR HANDLING
// ===========================================

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @returns {object} Error response object
 */
export function errorResponse(message, status = 400) {
  return {
    error: true,
    message,
    status,
  };
}

/**
 * Create a standardized success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @returns {object} Success response object
 */
export function successResponse(data, message = 'Success') {
  return {
    error: false,
    message,
    data,
  };
}
