import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789')
const FROM = process.env.EMAIL_FROM || 'noreply@golfgive.com'

interface SendOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail({ to, subject, html }: SendOptions) {
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[Email Error]', err)
  }
}

export async function sendWelcomeEmail(to: string, name: string, charityName: string) {
  await sendEmail({
    to,
    subject: 'Welcome to GolfGive — Play. Give. Win.',
    html: `
      <h1>Welcome, ${name}!</h1>
      <p>You're now part of GolfGive. Every score you submit enters you into our monthly prize draw.</p>
      <p>10% of your subscription is automatically donated to <strong>${charityName}</strong>.</p>
      <p><a href="${process.env.CLIENT_URL}/dashboard">Go to your dashboard →</a></p>
    `,
  })
}

export async function sendDrawResultEmail(
  to: string,
  name: string,
  drawNumbers: number[],
  matched: number,
  prize?: number
) {
  const won = prize !== undefined && prize > 0
  await sendEmail({
    to,
    subject: won ? `🎉 You won £${prize?.toFixed(2)} in this month's draw!` : "This month's draw results",
    html: `
      <h1>Monthly Draw Results</h1>
      <p>Hi ${name},</p>
      <p>This month's winning numbers: <strong>${drawNumbers.join(', ')}</strong></p>
      <p>You matched <strong>${matched} number${matched !== 1 ? 's' : ''}</strong>.</p>
      ${won ? `<p>🏆 You've won <strong>£${prize?.toFixed(2)}</strong>! Please upload your proof of score in your dashboard.</p>` : '<p>Better luck next month! Keep logging your scores.</p>'}
      <p><a href="${process.env.CLIENT_URL}/dashboard/winnings">View your winnings →</a></p>
    `,
  })
}

export async function sendWinnerAlertEmail(to: string, name: string, prize: number) {
  await sendEmail({
    to,
    subject: `Action required: Claim your £${prize.toFixed(2)} prize`,
    html: `
      <h1>You're a winner! 🏆</h1>
      <p>Hi ${name}, congratulations — you won £${prize.toFixed(2)} in this month's GolfGive draw.</p>
      <p>Please upload your proof of score within 7 days to claim your prize.</p>
      <p><a href="${process.env.CLIENT_URL}/dashboard/winnings">Upload proof →</a></p>
    `,
  })
}

export async function sendSubscriptionEmail(to: string, name: string, plan: string, renewalDate: string) {
  await sendEmail({
    to,
    subject: 'Your GolfGive subscription is active',
    html: `
      <h1>Subscription confirmed ✓</h1>
      <p>Hi ${name}, your <strong>${plan}</strong> subscription is now active.</p>
      <p>Next renewal: ${renewalDate}</p>
      <p><a href="${process.env.CLIENT_URL}/dashboard">Start logging your scores →</a></p>
    `,
  })
}

export async function sendRenewalReminderEmail(to: string, name: string, renewalDate: string) {
  await sendEmail({
    to,
    subject: 'Your GolfGive subscription renews soon',
    html: `
      <h1>Renewal reminder</h1>
      <p>Hi ${name}, your subscription renews on <strong>${renewalDate}</strong>.</p>
      <p><a href="${process.env.CLIENT_URL}/dashboard/settings">Manage subscription →</a></p>
    `,
  })
}

export async function sendPayoutEmail(to: string, name: string, amount: number) {
  await sendEmail({
    to,
    subject: `Payment of £${amount.toFixed(2)} sent — GolfGive`,
    html: `
      <h1>Payment confirmed 💰</h1>
      <p>Hi ${name}, we've processed your prize payment of <strong>£${amount.toFixed(2)}</strong>.</p>
      <p>Thank you for playing GolfGive!</p>
    `,
  })
}
