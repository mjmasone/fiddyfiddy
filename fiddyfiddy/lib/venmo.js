/**
 * Venmo Deep Link Generator
 * Generates payment links with pre-filled data
 */

/**
 * Generate a Venmo payment link
 * @param {string} recipient - Venmo username (without @)
 * @param {number} amount - Dollar amount
 * @param {string} ticketNumber - Ticket ID for the note
 * @returns {string} Venmo deep link URL
 */
export function generateVenmoLink(recipient, amount, ticketNumber) {
  const note = encodeURIComponent(`FIDDYFIDDY-${ticketNumber}`);
  return `https://venmo.com/${recipient}?txn=pay&amount=${amount}&note=${note}&audience=private`;
}

/**
 * Determine payment recipient based on prime number routing
 * First ticket ALWAYS goes to Organizer
 * Every Nth ticket (where N = prime) goes to Owner
 * 
 * @param {number} sequenceNumber - Ticket sequence (1-based)
 * @param {number} ownerPrime - Prime number for owner split
 * @param {string} ownerVenmo - Owner's Venmo handle
 * @param {string} organizerVenmo - Organizer's Venmo handle
 * @returns {object} { recipient: string, recipientType: 'Owner' | 'Organizer' }
 */
export function getPaymentRecipient(sequenceNumber, ownerPrime, ownerVenmo, organizerVenmo) {
  // First ticket ALWAYS goes to Organizer
  if (sequenceNumber === 1) {
    return {
      recipient: organizerVenmo,
      recipientType: 'Organizer',
    };
  }
  
  // Every Nth ticket goes to Owner
  if (sequenceNumber % ownerPrime === 0) {
    return {
      recipient: ownerVenmo,
      recipientType: 'Owner',
    };
  }
  
  // All other tickets go to Organizer
  return {
    recipient: organizerVenmo,
    recipientType: 'Organizer',
  };
}

/**
 * Calculate owner percentage from prime number
 * @param {number} prime - The prime number
 * @returns {number} Percentage (0-100)
 */
export function calculateOwnerPercentage(prime) {
  return ((1 / prime) * 100).toFixed(2);
}

/**
 * Generate the complete Venmo link for a ticket purchase
 * @param {object} raffle - Raffle object
 * @param {number} sequenceNumber - Ticket sequence
 * @param {string} ticketNumber - Full ticket number
 * @param {string} ownerVenmo - Owner's Venmo handle
 * @returns {object} { url: string, recipient: string, recipientType: string }
 */
export function generateTicketPaymentLink(raffle, sequenceNumber, ticketNumber, ownerVenmo) {
  const { recipient, recipientType } = getPaymentRecipient(
    sequenceNumber,
    raffle.owner_prime || 11,
    ownerVenmo,
    raffle.organizer_venmo
  );
  
  const url = generateVenmoLink(recipient, raffle.ticket_price, ticketNumber);
  
  return {
    url,
    recipient,
    recipientType,
  };
}

/**
 * Validate a Venmo handle format
 * @param {string} handle - Venmo handle (with or without @)
 * @returns {string|null} Cleaned handle or null if invalid
 */
export function validateVenmoHandle(handle) {
  if (!handle) return null;
  
  // Remove @ if present
  let cleaned = handle.trim().replace(/^@/, '');
  
  // Venmo handles: 5-30 chars, alphanumeric + underscores + hyphens
  const validPattern = /^[a-zA-Z0-9_-]{5,30}$/;
  
  if (!validPattern.test(cleaned)) {
    return null;
  }
  
  return cleaned;
}
