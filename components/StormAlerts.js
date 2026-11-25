"use client";

import { useState } from "react";

export default function StormAlerts() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Only claim success when the server actually saved the signup.
      // Before Oct 28, 2026 this never checked the response, so the
      // form said "You're signed up" even when nothing was stored.
      if (!res.ok) throw new Error("Subscribe failed");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="mb-10">
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-800 to-indigo-950 border border-blue-700/30">
        <h2 className="text-xl font-bold text-white mb-1">Get Storm Alerts</h2>
        <p className="text-blue-200 text-sm mb-5 leading-relaxed">
          Incoming storms, road conditions, and resort news, straight to your inbox.
        </p>
        {status === "success" ? (
          <p className="text-emerald-300 font-bold text-sm">You&apos;re signed up! Stay safe out there.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder-blue-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white text-indigo-900 font-bold text-sm active:scale-[0.98] transition-transform"
            >
              Sign Up
            </button>
            {status === "error" && (
              <p className="text-red-300 text-xs">Something went wrong. Please try again.</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
