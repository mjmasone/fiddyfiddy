/**
 * Drawing Logic
 * Handles random selection and redraw management
 */

import { 
  getEligibleTickets, 
  getDrawLogByRaffle, 
  createDrawLogEntry,
  updateTicket,
  updateRaffle,
  getTicketsByRaffle
} from './knack';

import {
  sendWinnerNotification,
  sendDrawingReport,
  sendPayoutNotification
} from './sendgrid';

/**
 * Select a random ticket from eligible tickets
 * @param {string} raffleId - Raffle ID
 * @returns {object|null} Selected ticket or null if none eligible
 */
export async function selectRandomTicket(raffleId) {
  const eligibleTickets = await getEligibleTickets(raffleId);
  
  if (eligibleTickets.length === 0) {
    return null;
  }
  
  // Use crypto for better randomness if available
  let randomIndex;
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    randomIndex = array[0] % eligibleTickets.length;
  } else {
    randomIndex = Math.floor(Math.random() * eligibleTickets.length);
  }
  
  return eligibleTickets[randomIndex];
}

/**
 * Execute a drawing for a raffle
 * @param {object} raffle - Raffle object
 * @param {object} settings - Platform settings
 * @returns {object} { success, ticket, drawNumber, error }
 */
export async function executeDraw(raffle, settings) {
  try {
    // Get current draw count
    const drawLog = await getDrawLogByRaffle(raffle.id);
    const drawNumber = drawLog.length + 1;
    
    // Check if max redraws exceeded
    const maxRedraws = settings?.max_redraws || 3;
    if (raffle.redraw_count >= maxRedraws) {
      return {
        success: false,
        error: 'Max redraws exceeded. Owner intervention required.',
        needsEscalation: true,
      };
    }
    
    // Select random ticket
    const ticket = await selectRandomTicket(raffle.id);
    
    if (!ticket) {
      return {
        success: false,
        error: 'No eligible tickets found.',
      };
    }
    
    return {
      success: true,
      ticket,
      drawNumber,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Confirm a winner
 * @param {object} raffle - Raffle object
 * @param {object} ticket - Winning ticket
 * @param {number} drawNumber - Draw number
 * @param {object} organizer - Organizer user object
 */
export async function confirmWinner(raffle, ticket, drawNumber, organizer) {
  // Create draw log entry
  await createDrawLogEntry({
    raffle: raffle.id,
    ticket: ticket.id,
    draw_number: drawNumber,
    result: 'Winner',
    reason: '',
    timestamp: new Date().toISOString(),
  });
  
  // Update ticket status
  await updateTicket(ticket.id, {
    status: 'Confirmed',
    verified_at: new Date().toISOString(),
  });
  
  // Update raffle
  await updateRaffle(raffle.id, {
    status: 'Complete',
    winning_ticket: ticket.id,
    drawn_at: new Date().toISOString(),
  });
  
  // Send notifications
  await sendWinnerNotification(ticket, raffle);
  await sendPayoutNotification(organizer, raffle, ticket);
  
  // Send report to all players
  const allTickets = await getTicketsByRaffle(raffle.id);
  const drawLog = await getDrawLogByRaffle(raffle.id);
  
  // Enrich draw log with ticket numbers
  const enrichedDrawLog = await Promise.all(drawLog.map(async (entry) => {
    const ticketInfo = allTickets.find(t => t.id === entry.ticket);
    return {
      ...entry,
      ticket_number: ticketInfo?.ticket_number || 'Unknown',
    };
  }));
  
  await sendDrawingReport(allTickets, raffle, enrichedDrawLog, ticket);
  
  return { success: true };
}

/**
 * Process a redraw (invalid ticket)
 * @param {object} raffle - Raffle object
 * @param {object} ticket - Invalid ticket
 * @param {number} drawNumber - Draw number
 * @param {string} reason - Reason for invalidation
 */
export async function processRedraw(raffle, ticket, drawNumber, reason = 'Payment not confirmed') {
  // Create draw log entry
  await createDrawLogEntry({
    raffle: raffle.id,
    ticket: ticket.id,
    draw_number: drawNumber,
    result: 'Invalid',
    reason: reason,
    timestamp: new Date().toISOString(),
  });
  
  // Update ticket status
  await updateTicket(ticket.id, {
    status: 'Invalid',
  });
  
  // Increment redraw count
  await updateRaffle(raffle.id, {
    redraw_count: (raffle.redraw_count || 0) + 1,
  });
  
  return { success: true };
}

/**
 * Check if raffle meets minimum ticket requirement
 * @param {object} raffle - Raffle object
 * @returns {object} { canDraw, message }
 */
export function checkMinimumTickets(raffle) {
  if (!raffle.min_tickets_enabled) {
    return { canDraw: true };
  }
  
  const minRequired = raffle.min_tickets || raffle.owner_prime || 11;
  const ticketsSold = raffle.tickets_sold || 0;
  
  if (ticketsSold < minRequired) {
    return {
      canDraw: false,
      message: `Minimum of ${minRequired} tickets required. Currently sold: ${ticketsSold}`,
    };
  }
  
  return { canDraw: true };
}

/**
 * Get drawing status info
 * @param {object} raffle - Raffle object
 * @param {object} settings - Platform settings
 * @returns {object} Drawing status info
 */
export async function getDrawingStatus(raffle, settings) {
  const drawLog = await getDrawLogByRaffle(raffle.id);
  const maxRedraws = settings?.max_redraws || 3;
  const redraws = raffle.redraw_count || 0;
  
  return {
    drawCount: drawLog.length,
    redraws: redraws,
    redrawsRemaining: maxRedraws - redraws,
    maxRedraws: maxRedraws,
    needsEscalation: redraws >= maxRedraws,
    drawLog: drawLog,
  };
}

/**
 * Format draw log for display
 * @param {array} drawLog - Array of draw log entries
 * @param {array} tickets - Array of tickets
 * @returns {array} Formatted draw log
 */
export function formatDrawLog(drawLog, tickets) {
  return drawLog.map(entry => {
    const ticket = tickets.find(t => t.id === entry.ticket);
    return {
      drawNumber: entry.draw_number,
      ticketNumber: ticket?.ticket_number || 'Unknown',
      result: entry.result,
      reason: entry.reason || null,
      timestamp: entry.timestamp,
    };
  });
}
