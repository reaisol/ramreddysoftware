export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required.' });
    }

    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = process.env.TO_EMAIL || 'wockridgeitsolutions@gmail.com';
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'RESEND_API_KEY environment variable is not configured.' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Wockridge Website <${fromEmail}>`,
        to: toEmail,
        subject: `New Lead: ${name}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #0B1220;">
            <h2 style="border-bottom: 1px solid #E5EAF1; padding-bottom: 10px;">New Inquiry</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Mobile Number:</strong> ${phone}</p>
            <p><strong>Message / Project Scope:</strong></p>
            <blockquote style="background: #F8FAFC; border-left: 4px solid #2563EB; padding: 12px; margin: 10px 0;">
              ${message ? message.replace(/\n/g, '<br>') : 'No details provided.'}
            </blockquote>
            <hr style="border: 0; border-top: 1px solid #E5EAF1; margin: 20px 0;" />
            <small style="color: #64748B;">Submitted from the Wockridge IT Solutions website contact form.</small>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errDetail = await response.text();
      return res.status(500).json({ error: 'Resend API error', details: errDetail });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
