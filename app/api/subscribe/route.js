// Storm alert subscribe endpoint, the family Resend pattern from
// i80pass as carried by the newest sisters (grapevinepass, 395live):
// a dedicated segment env var if set, else the Resend General
// segment as the fallback. The i80pass Storm Alerts segment ID
// from the master is NOT carried over; it belongs to i80pass alone.
//
// Set STORM_ALERTS_SEGMENT_ID in the environment to point this
// route at a dedicated i15pass segment once one exists. Until
// then, signups fall back to the network General segment id
// below. RESEND_API_KEY (the network Resend key) is set in the
// Amplify console at app and branch level and forwarded by
// amplify.yml, the same wiring as the sister sites.
//
// Consent is captured on the signup form: the form copy states
// what subscribers will receive and that they can unsubscribe at
// any time, and every alert email carries an unsubscribe link.

const FALLBACK_SEGMENT_ID = "2f6c3b99-6863-4b2f-a6ee-a403d5c11cf2";

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return Response.json({ ok: false, error: "A valid email address is required" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ ok: false, error: "Signup is not configured" }, { status: 500 });
  }

  const segmentId = process.env.STORM_ALERTS_SEGMENT_ID || FALLBACK_SEGMENT_ID;

  let res;
  try {
    res = await fetch("https://api.resend.com/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Cloudflare rejects non-browser signatures (error 1010).
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({
        email,
        unsubscribed: false,
        segments: [{ id: segmentId }],
      }),
    });
  } catch {
    return Response.json({ ok: false, error: "Subscribe failed" }, { status: 502 });
  }

  if (!res.ok) {
    return Response.json({ ok: false, error: "Subscribe failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
