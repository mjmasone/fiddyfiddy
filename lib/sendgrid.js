/**
 * SendGrid Email Functions
 * Handles all email notifications
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@fiddyfiddy.org';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Fiddyfiddy';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fiddyfiddy.org';

/**
 * Send an email
 */
async function sendEmail(to, subject, html, text = null) {
  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('SendGrid Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send ticket confirmation email
 */
export async function sendTicketConfirmation(ticket, raffle) {
  const subject = `Your Fiddyfiddy Ticket: ${ticket.ticket_number}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">🎟️ You're in the raffle!</h1>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666;">Ticket Number</p>
        <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #1f2937;">${ticket.ticket_number}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Raffle</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${raffle.beneficiary_name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Current Jackpot</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #10b981;">$${raffle.jackpot_current || 0}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Drawing</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${getDrawInfo(raffle)}</td>
        </tr>
      </table>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>⚠️ Important:</strong> Your ticket is only valid if your payment is confirmed before the drawing. 
          If payment cannot be verified, your ticket will not be eligible and another ticket will be drawn.
        </p>
      </div>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${SITE_URL}/ticket/${ticket.ticket_number}" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">Check Ticket Status</a>
      </p>
      
      <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">Good luck! 🍀</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">
        Fiddyfiddy - 50/50 Digital Raffles<br>
        <a href="${SITE_URL}" style="color: #7c3aed;">fiddyfiddy.org</a>
      </p>
    </div>
  `;

  return sendEmail(ticket.player_email, subject, html);
}

/**
 * Send winner notification
 */
export async function sendWinnerNotification(ticket, raffle) {
  const subject = `🎉 YOU WON! Fiddyfiddy Raffle`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981; text-align: center;">🎉 CONGRATULATIONS!</h1>
      
      <p style="text-align: center; font-size: 18px;">You won the <strong>${raffle.beneficiary_name}</strong> raffle!</p>
      
      <div style="background: #d1fae5; padding: 30px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #065f46;">Your Prize</p>
        <p style="margin: 10px 0 0; font-size: 48px; font-weight: bold; color: #047857;">$${raffle.jackpot_current}</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Your Ticket</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${ticket.ticket_number}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Your Venmo</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">@${ticket.player_venmo}</td>
        </tr>
      </table>
      
      <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af;">
          Your winnings will be sent to your Venmo <strong>@${ticket.player_venmo}</strong> within 48 hours.
        </p>
      </div>
      
      <p style="text-align: center; color: #666;">Thank you for supporting <strong>${raffle.beneficiary_name}</strong>!</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">
        Fiddyfiddy - 50/50 Digital Raffles<br>
        <a href="${SITE_URL}" style="color: #7c3aed;">fiddyfiddy.org</a>
      </p>
    </div>
  `;

  return sendEmail(ticket.player_email, subject, html);
}

/**
 * Send drawing report to all players
 */
export async function sendDrawingReport(players, raffle, drawLog, winningTicket) {
  const subject = `Fiddyfiddy Results: ${raffle.beneficiary_name}`;
  
  // Build draw log HTML
  let drawLogHtml = '';
  drawLog.forEach((entry, index) => {
    const isWinner = entry.result === 'Winner';
    const color = isWinner ? '#10b981' : '#ef4444';
    const icon = isWinner ? '✓' : '✗';
    drawLogHtml += `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Draw ${entry.draw_number}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${entry.ticket_number}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: ${color}; font-weight: bold;">
          ${icon} ${entry.result}${entry.reason ? ` (${entry.reason})` : ''}
        </td>
      </tr>
    `;
  });

  // Send to each player
  const results = [];
  for (const player of players) {
    const isWinner = player.ticket_number === winningTicket.ticket_number;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Thanks for playing!</h1>
        
        <p>The <strong>${raffle.beneficiary_name}</strong> raffle is complete.</p>
        
        <h2 style="color: #1f2937; margin-top: 30px;">Drawing Results</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 10px; text-align: left;">Draw</th>
            <th style="padding: 10px; text-align: left;">Ticket</th>
            <th style="padding: 10px; text-align: left;">Result</th>
          </tr>
          ${drawLogHtml}
        </table>
        
        <div style="background: ${isWinner ? '#d1fae5' : '#f3f4f6'}; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          ${isWinner ? `
            <p style="margin: 0; font-size: 18px; color: #047857;">🎉 <strong>Your ticket (${player.ticket_number}) WON!</strong></p>
            <p style="margin: 10px 0 0; font-size: 24px; font-weight: bold; color: #047857;">$${raffle.jackpot_current}</p>
          ` : `
            <p style="margin: 0; color: #666;">Your ticket (${player.ticket_number}) was not selected this time.</p>
            <p style="margin: 10px 0 0; font-weight: bold;">Winning Ticket: ${winningTicket.ticket_number}</p>
            <p style="margin: 5px 0 0; color: #10b981;">Jackpot: $${raffle.jackpot_current}</p>
          `}
        </div>
        
        ${!isWinner ? `
          <p style="text-align: center; margin-top: 30px;">
            <a href="${SITE_URL}/lobby" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">🎟️ Try Another Raffle</a>
          </p>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          Fiddyfiddy - 50/50 Digital Raffles<br>
          <a href="${SITE_URL}" style="color: #7c3aed;">fiddyfiddy.org</a>
        </p>
      </div>
    `;

    const result = await sendEmail(player.player_email, subject, html);
    results.push({ email: player.player_email, ...result });
  }

  return results;
}

/**
 * Send payout notification to organizer
 */
export async function sendPayoutNotification(organizer, raffle, winner) {
  const subject = `⚡ ACTION REQUIRED: Pay Raffle Winner (48hr deadline)`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #f59e0b;">⚡ PAYOUT REQUIRED</h1>
      
      <p>The <strong>${raffle.beneficiary_name}</strong> raffle has completed!</p>
      
      <h2 style="color: #1f2937;">Winner Details</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Ticket</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">${winner.ticket_number}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Email</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${winner.player_email}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Venmo</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold;">@${winner.player_venmo}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #666;">Amount Due</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 24px; font-weight: bold; color: #10b981;">$${raffle.jackpot_current}</td>
        </tr>
      </table>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 10px; margin: 20px 0;">
        <p style="margin: 0; color: #92400e;">
          <strong>⏰ DEADLINE:</strong> You must pay within <strong>48 hours</strong>.
        </p>
      </div>
      
      <h3 style="color: #1f2937;">Instructions</h3>
      <ol style="color: #666; line-height: 1.8;">
        <li>Open Venmo</li>
        <li>Pay <strong>@${winner.player_venmo}</strong> the amount of <strong>$${raffle.jackpot_current}</strong></li>
        <li>Include note: <code>Fiddyfiddy Winner - ${winner.ticket_number}</code></li>
        <li>Click below to confirm payment sent</li>
      </ol>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="${SITE_URL}/raffle/${raffle.id}/payout" style="background: #10b981; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 18px;">CONFIRM PAYMENT SENT</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">
        Fiddyfiddy Admin
      </p>
    </div>
  `;

  return sendEmail(organizer.email, subject, html);
}

/**
 * Send payout reminder (at 24 hours)
 */
export async function sendPayoutReminder(organizer, raffle, winner) {
  const subject = `⚠️ REMINDER: Pay Raffle Winner - 24 hours remaining`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">⚠️ PAYMENT REMINDER</h1>
      
      <p>You have <strong>24 hours remaining</strong> to pay the winner of the <strong>${raffle.beneficiary_name}</strong> raffle.</p>
      
      <div style="background: #fee2e2; border: 1px solid #ef4444; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 18px; color: #dc2626;">Pay <strong>@${winner.player_venmo}</strong></p>
        <p style="margin: 10px 0 0; font-size: 36px; font-weight: bold; color: #dc2626;">$${raffle.jackpot_current}</p>
      </div>
      
      <p style="text-align: center;">
        <a href="${SITE_URL}/raffle/${raffle.id}/payout" style="background: #10b981; color: white; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">CONFIRM PAYMENT SENT</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">Fiddyfiddy Admin</p>
    </div>
  `;

  return sendEmail(organizer.email, subject, html);
}

// Helper function
function getDrawInfo(raffle) {
  switch (raffle.draw_trigger) {
    case 'Time':
      return raffle.draw_time ? new Date(raffle.draw_time).toLocaleString() : 'Scheduled';
    case 'TicketCount':
      return `When ${raffle.draw_ticket_count} tickets sold`;
    case 'Manual':
    default:
      return 'Organizer will draw';
  }
}

/**
 * Send raffle cancellation notification to all players
 */
export async function sendRaffleCancellation(players, raffle, reason, organizerEmail) {
  const subject = `Raffle Cancelled: ${raffle.raffle_name || raffle.beneficiary_name}`;
  
  const results = [];
  for (const player of players) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Raffle Cancelled</h1>
        
        <p>We're sorry to inform you that the <strong>${raffle.raffle_name || raffle.beneficiary_name}</strong> raffle has been cancelled.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #666;">Your Ticket</p>
          <p style="margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #1f2937;">${player.ticket_number}</p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 10px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            <strong>Reason from Organizer:</strong><br>
            ${reason}
          </p>
        </div>
        
        <h3 style="color: #1f2937;">Refund Information</h3>
        <p style="color: #666;">
          If you made a payment via Venmo, please contact the organizer directly for a refund:
        </p>
        <p style="color: #666;">
          <strong>Organizer Email:</strong> ${organizerEmail}
        </p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${SITE_URL}/lobby" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">🎟️ Find Another Raffle</a>
        </p>
        
        <p style="color: #666; margin-top: 20px;">We apologize for any inconvenience.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #888; font-size: 12px; text-align: center;">
          Fiddyfiddy - 50/50 Digital Raffles<br>
          <a href="${SITE_URL}" style="color: #7c3aed;">fiddyfiddy.org</a>
        </p>
      </div>
    `;

    const result = await sendEmail(player.player_email, subject, html);
    results.push({ email: player.player_email, ...result });
  }

  return results;
}

/**
 * Send new organizer registration notification to platform owner
 */
export async function sendNewOrganizerNotification(organizer) {
  const ownerEmail = process.env.OWNER_EMAIL || 'info@fiddyfiddy.org';
  const subject = `New Organizer Registration: ${organizer.name}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7c3aed;">🎉 New Organizer Signup!</h1>
      
      <p>A new organizer has registered on Fiddyfiddy.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">Name</td>
            <td style="padding: 8px 0; font-weight: bold;">${organizer.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${organizer.email}">${organizer.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Venmo</td>
            <td style="padding: 8px 0;">@${organizer.venmo_handle}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Phone</td>
            <td style="padding: 8px 0;">${organizer.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">Status</td>
            <td style="padding: 8px 0;"><span style="background: #10b981; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">Auto-Approved</span></td>
          </tr>
        </table>
      </div>
      
      <p style="text-align: center;">
        <a href="${SITE_URL}/admin/users" style="background: #7c3aed; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold;">View All Users</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="color: #888; font-size: 12px; text-align: center;">Fiddyfiddy Admin</p>
    </div>
  `;

  return sendEmail(ownerEmail, subject, html);
}
