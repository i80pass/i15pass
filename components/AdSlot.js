"use client";

import { useEffect } from "react";

// Google AdSense manual ad unit (approved by Tracy Nov 15, 2026:
// Google ads only, fixed manual slots only, never Auto Ads).
//
// GATING: this component renders NOTHING unless both of these build
// time environment variables are set:
//   NEXT_PUBLIC_ADSENSE_ID                    the publisher ID, in the
//                                             full "ca-pub-..." form
//   NEXT_PUBLIC_ADSENSE_SLOT_BELOW_CAMERAS    the ad unit slot ID for
//   NEXT_PUBLIC_ADSENSE_SLOT_LOWER            the two placements
// With either unset it returns null and the page is byte-identical to
// the pre-ads site: no markup, no space reserved, no script effect.
// The matching loader script lives in app/layout.js under the same
// NEXT_PUBLIC_ADSENSE_ID gate, mirroring the GA pattern there.
//
// ZERO LAYOUT SHIFT: the container reserves a fixed 280px height
// (the large rectangle, the tallest common responsive display unit)
// before any ad loads, and clips overflow, so an ad filling, or an
// ad failing to fill, can never move the page. CLS stays zero with
// ads on or off.
//
// Each process.env access below is a separate static member access
// on purpose: Next.js only inlines NEXT_PUBLIC_ variables into the
// client bundle when they are written exactly this way.
const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_ID || null;
const SLOT_IDS = {
  belowCameras: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BELOW_CAMERAS || null,
  lowerPage: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LOWER || null,
};

export default function AdSlot({ slot }) {
  const slotId = SLOT_IDS[slot] || null;
  const active = Boolean(ADSENSE_CLIENT && slotId);

  useEffect(() => {
    if (!active) return;
    try {
      // Pushes made before adsbygoogle.js finishes loading are queued
      // on the array and processed when the library arrives.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  }, [active]);

  if (!active) return null;

  return (
    <div className="mb-10 h-[280px] overflow-hidden" data-ad-position={slot}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
