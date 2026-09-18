import { Resend } from 'resend';

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendOtpEmail(email: string, otp: string) {
  await getResend().emails.send({
    from: 'GarbaBuddy <login@garbabuddy.lol>',
    to: email,
    subject: `Your GarbaBuddy login code: ${otp}`,
    html: `<p>Your login code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
  });
}
