export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { name, phone, message } = body;

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Name and Phone are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use Resend to send the email notification
    // If FROM_EMAIL is not configured, we default to onboarding@resend.dev (Resend's default testing address)
    const fromEmail = env.FROM_EMAIL || 'onboarding@resend.dev';
    const toEmail = env.TO_EMAIL || 'wockridgeitsolutions@gmail.com';
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY secret is not configured in Cloudflare Pages dashboard.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
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

    if (!res.ok) {
      const errDetail = await res.text();
      return new Response(JSON.stringify({ error: 'Resend API error', details: errDetail }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
