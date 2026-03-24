const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY is not defined in environment variables');
} else if (!SENDGRID_API_KEY.startsWith('SG.')) {
  console.error('❌ SENDGRID_API_KEY does not start with "SG." - please check your API key');
} else {
  console.log('✅ SendGrid API key loaded successfully');
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@muzikax.com';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'MuzikaX';

/**
 * Send email using SendGrid
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>} SendGrid response
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
  try {
    const msg = {
      to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME
      },
      subject,
      html,
      text: text || stripHtml(html)
    };

    const response = await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}: ${subject}`);
    return {
      success: true,
      messageId: response[0]?.headers?.['x-message-id'] || 'unknown'
    };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    
    // Handle specific SendGrid errors
    if (error.response) {
      console.error('SendGrid error response:', {
        statusCode: error.response.statusCode,
        body: JSON.stringify(error.response.body, null, 2)
      });
      
      // Provide helpful error messages
      if (error.response.statusCode === 401 || error.response.statusCode === 403) {
        console.error('\n🔑 Authentication Error:');
        console.error('  - Check that your SENDGRID_API_KEY is valid and not expired');
        console.error('  - Verify sender email is authenticated in SendGrid dashboard');
        console.error('  - Ensure API key has "Mail Send" permissions');
        console.error('  - Get your API key from: https://app.sendgrid.com/settings/api_keys\n');
      } else if (error.response.statusCode === 400) {
        console.error('\n📧 Validation Error:');
        console.error('  - Check that sender email is verified in SendGrid');
        console.error('  - Verify recipient email address is valid');
        console.error('  - Check SendGrid activity logs for details\n');
      }
    } else if (error.code) {
      console.error('Network/System error:', error.code);
    }
    
    return {
      success: false,
      error: error.message,
      statusCode: error.response?.statusCode,
      details: error.response?.body
    };
  }
};

/**
 * Strip HTML tags for plain text version
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
const stripHtml = (html) => {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
};

/**
 * Send OTP email for 2FA
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 * @param {string} userName - User name
 * @returns {Promise<Object>} Send result
 */
const sendOTPEmail = async (to, otp, userName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 MuzikaX Two-Factor Authentication</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You've requested a verification code to log in to your MuzikaX artist account.</p>
          
          <div class="otp-box">
            <p style="margin-bottom: 10px; color: #666;">Your One-Time Password (OTP):</p>
            <div class="otp-code">${otp}</div>
            <p style="margin-top: 15px; font-size: 14px; color: #999;">This code will expire in 10 minutes</p>
          </div>
          
          <p><strong>Important:</strong> This code is valid for 10 minutes only. Do not share this code with anyone.</p>
          
          <p>If you didn't request this code, please ignore this email or contact our support team if you have concerns.</p>
          
          <div style="text-align: center;">
            <a href="https://muzikax.com/login" class="button">Continue to Login</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>This is an automated message, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${userName},

    Your MuzikaX verification code is: ${otp}

    This code will expire in 10 minutes. Do not share this code with anyone.

    If you didn't request this code, please ignore this email.

    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `;

  return await sendEmail({
    to,
    subject: '🔐 Your MuzikaX Verification Code',
    html,
    text
  });
};

/**
 * Send new track notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User name
 * @param {string} options.artistName - Artist name
 * @param {string} options.trackTitle - Track title
 * @param {string} options.trackUrl - Track URL
 * @param {string} options.coverUrl - Cover art URL
 * @returns {Promise<Object>} Send result
 */
const sendNewTrackNotification = async ({ to, userName, artistName, trackTitle, trackUrl, coverUrl }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #FF4D67 0%, #FF6B6B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .track-card { background: white; border-radius: 10px; overflow: hidden; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .cover-art { width: 100%; height: 300px; object-fit: cover; }
        .track-info { padding: 20px; }
        .track-title { font-size: 24px; font-weight: bold; color: #333; margin-bottom: 5px; }
        .artist-name { color: #FF4D67; font-size: 16px; margin-bottom: 15px; }
        .button { display: inline-block; padding: 12px 30px; background: #FF4D67; color: white; text-decoration: none; border-radius: 5px; margin-top: 15px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎵 New Track Alert!</h1>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Your favorite artist just dropped a new track!</p>
          
          <div class="track-card">
            <img src="${coverUrl || 'https://via.placeholder.com/600x300?text=New+Track'}" alt="Cover Art" class="cover-art" />
            <div class="track-info">
              <div class="track-title">${trackTitle}</div>
              <div class="artist-name">by ${artistName}</div>
              <p>Be the first to listen and share your thoughts!</p>
              <a href="${trackUrl}" class="button">▶️ Listen Now</a>
            </div>
          </div>
          
          <p>Don't miss out on the latest beats from ${artistName}!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>You're receiving this because you follow ${artistName}.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${userName},

    Your favorite artist just dropped a new track!

    "${trackTitle}" by ${artistName}

    Listen now at: ${trackUrl}

    Don't miss out on the latest beats from ${artistName}!

    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `;

  return await sendEmail({
    to,
    subject: `🎵 New Track from ${artistName}: ${trackTitle}`,
    html,
    text
  });
};

/**
 * Send new playlist notification email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User name
 * @param {string} options.playlistName - Playlist name
 * @param {string} options.curatorName - Curator name
 * @param {number} options.trackCount - Number of tracks
 * @param {string} options.playlistUrl - Playlist URL
 * @param {string} options.description - Playlist description
 * @returns {Promise<Object>} Send result
 */
const sendNewPlaylistNotification = async ({ to, userName, playlistName, curatorName, trackCount, playlistUrl, description }) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .playlist-card { background: white; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .playlist-icon { font-size: 48px; text-align: center; margin-bottom: 15px; }
        .playlist-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .track-count { color: #666; font-size: 14px; margin-bottom: 15px; }
        .description { color: #555; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎶 New Playlist Curated For You</h1>
        </div>
        <div class="content">
          <p>Hey ${userName},</p>
          <p>Discover your next favorite song with this handpicked playlist!</p>
          
          <div class="playlist-card">
            <div class="playlist-icon">🎧</div>
            <div class="playlist-name">${playlistName}</div>
            <div class="track-count">📀 ${trackCount} tracks curated by ${curatorName}</div>
            <div class="description">${description || 'A perfect mix tailored just for you'}</div>
            <a href="${playlistUrl}" class="button">🎵 Explore Playlist</a>
          </div>
          
          <p>Dive into carefully selected tracks that match your taste!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>You're receiving this based on your music preferences.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hey ${userName},

    Discover your next favorite song with this handpicked playlist!

    "${playlistName}" - ${trackCount} tracks curated by ${curatorName}

    ${description || 'A perfect mix tailored just for you'}

    Explore now at: ${playlistUrl}

    Dive into carefully selected tracks that match your taste!

    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `;

  return await sendEmail({
    to,
    subject: `🎶 New Playlist: ${playlistName} (${trackCount} tracks)`,
    html,
    text
  });
};

/**
 * Send trending songs of the week email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User name
 * @param {Array} options.trendingTracks - Array of trending tracks
 * @param {string} options.weekLabel - Week label (e.g., "Week of March 24, 2026")
 * @returns {Promise<Object>} Send result
 */
const sendTrendingOfWeekEmail = async ({ to, userName, trendingTracks, weekLabel }) => {
  const trackRows = trendingTracks.slice(0, 10).map((track, index) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 15px 10px; text-align: center; font-weight: bold; color: #FF4D67; font-size: 18px;">#${index + 1}</td>
      <td style="padding: 15px 10px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <img src="${track.coverUrl || 'https://via.placeholder.com/80'}" alt="${track.title}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;" />
          <div>
            <div style="font-weight: bold; color: #333;">${track.title}</div>
            <div style="color: #667eea; font-size: 14px;">${track.artistName}</div>
            <div style="color: #999; font-size: 12px; margin-top: 5px;">▶️ ${(track.plays / 1000).toFixed(1)}K plays</div>
          </div>
        </div>
      </td>
      <td style="padding: 15px 10px; text-align: center;">
        <a href="${track.url}" style="display: inline-block; padding: 8px 20px; background: #FF4D67; color: white; text-decoration: none; border-radius: 5px; font-size: 14px;">Listen</a>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .chart-table { width: 100%; background: white; border-radius: 10px; overflow: hidden; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .cta-button { display: inline-block; padding: 15px 40px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔥 Trending This Week</h1>
          <p style="margin-top: 10px; opacity: 0.9;">${weekLabel}</p>
        </div>
        <div class="content">
          <p>Hi ${userName},</p>
          <p>Check out the hottest tracks taking over MuzikaX this week!</p>
          
          <table class="chart-table">
            ${trackRows}
          </table>
          
          <div style="text-align: center;">
            <a href="https://muzikax.com/charts" class="cta-button">View Full Charts 🎵</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>Stay tuned for more fire tracks every week!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hi ${userName},

    Check out the hottest tracks taking over MuzikaX this week!

    Top 5 Trending:
    ${trendingTracks.slice(0, 5).map((track, i) => 
      `#${i + 1}: ${track.title} by ${track.artistName} - ${(track.plays / 1000).toFixed(1)}K plays`
    ).join('\n')}

    View full charts at: https://muzikax.com/charts

    Stay tuned for more fire tracks every week!

    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `;

  return await sendEmail({
    to,
    subject: `🔥 Trending This Week: Top ${Math.min(trendingTracks.length, 10)} Tracks You Need to Hear`,
    html,
    text
  });
};

/**
 * Send recommended artists email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.userName - User name
 * @param {Array} options.recommendedArtists - Array of recommended artists
 * @param {string} options.reason - Recommendation reason
 * @returns {Promise<Object>} Send result
 */
const sendRecommendedArtistsEmail = async ({ to, userName, recommendedArtists, reason }) => {
  const artistCards = recommendedArtists.map(artist => `
    <div style="background: white; border-radius: 10px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display: flex; gap: 20px; align-items: center;">
        <img src="${artist.avatarUrl || 'https://via.placeholder.com/100'}" alt="${artist.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;" />
        <div style="flex: 1;">
          <div style="font-size: 20px; font-weight: bold; color: #333;">${artist.name}</div>
          <div style="color: #667eea; margin: 5px 0 10px;">${artist.genre || 'Artist'}</div>
          <div style="color: #666; font-size: 14px; margin-bottom: 15px;">${artist.bio || ''}</div>
          <a href="${artist.profileUrl}" style="display: inline-block; padding: 8px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-size: 14px;">Follow Artist</a>
        </div>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .reason-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Discover New Artists</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Based on your listening history, we think you'll love these artists!</p>
          
          <div class="reason-box">
            <strong>Why we're recommending these:</strong>
            <p style="margin: 10px 0 0;">${reason}</p>
          </div>
          
          ${artistCards}
          
          <p style="margin-top: 25px;">Expand your musical horizons and discover your next favorite artist!</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
          <p>Recommendations powered by AI 🤖</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Hello ${userName},

    Based on your listening history, we think you'll love these artists!

    Why we're recommending these: ${reason}

    ${recommendedArtists.map(artist => 
      `${artist.name} - ${artist.genre}\n${artist.profileUrl}`
    ).join('\n\n')}

    Expand your musical horizons and discover your next favorite artist!

    © ${new Date().getFullYear()} MuzikaX. All rights reserved.
  `;

  return await sendEmail({
    to,
    subject: `🌟 Discover Artists You'll Love`,
    html,
    text
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendNewTrackNotification,
  sendNewPlaylistNotification,
  sendTrendingOfWeekEmail,
  sendRecommendedArtistsEmail
};
