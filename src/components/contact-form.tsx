"use client";

import { FormEvent, useState } from "react";

const input = {
  background: "#0a1019",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: 13,
  color: "var(--foreground)",
  font: "inherit",
};

export default function ContactForm() {
  const [status, setStatus] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Unable to send message");
      event.currentTarget.reset();
      setStatus("Message sent successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send message");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12, maxWidth: 650 }}>
      <input name="name" required placeholder="Name" style={input} />
      <input name="email" type="email" required placeholder="Email" style={input} />
      <input name="company" placeholder="Company" style={input} />
      <input name="role" placeholder="Role" style={input} />
      <textarea name="message" required placeholder="Message" rows={6} style={input} />
      <button disabled={busy} type="submit" style={{ background: "var(--accent)", border: 0, color: "white", padding: 14, borderRadius: 10, fontWeight: 600, opacity: busy ? 0.7 : 1 }}>
        {busy ? "Sending…" : "Send message"}
      </button>
      {status && <p className="muted" role="status" aria-live="polite">{status}</p>}
    </form>
  );
}
