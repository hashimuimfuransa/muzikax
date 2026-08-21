/**
 * Two-factor authentication kill switch.
 *
 * 2FA is currently DISABLED for every account. The SendGrid account is over its
 * credit limit ("Maximum credits exceeded"), so OTP emails cannot be delivered
 * and every artist login was failing with a 500 instead of signing in.
 *
 * To turn 2FA back on once SendGrid has credits again, set the environment
 * variable TWO_FACTOR_ENABLED=true - no code change required.
 *
 * Note: admin 2FA stays off even when the flag is on (disabled by request).
 * To bring admins back in, add `|| user.role === 'admin'` to requiresTwoFactor.
 */

const isTwoFactorEnabled = () => process.env.TWO_FACTOR_ENABLED === 'true';

// Which accounts must complete an OTP challenge before login finishes.
const requiresTwoFactor = (user) =>
  isTwoFactorEnabled() && user.role === 'creator' && user.creatorType === 'artist';

module.exports = { isTwoFactorEnabled, requiresTwoFactor };
