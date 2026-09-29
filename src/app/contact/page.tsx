"use client";

import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

type State = "idle" | "sending" | "sent" | "error";

export default function ContactPage() {
  const [state, setState] = useState<State>("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setState("error");
        return;
      }

      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <SiteNav />
      <main className="container page">
        <section className="page-hero">
          <p className="eyebrow">CONTACT</p>
          <h1>Let&apos;s build something useful.</h1>
          <p className="lead">
            For opportunities, collaboration, or a thoughtful technical conversation.
          </p>
        </section>

        <section className="section">
          <div className="surface cta-panel">
            <form onSubmit={submit} className="form-stack" aria-describedby="contact-status">
              <div className="grid-2">
                <Field name="name" label="Name" required autoComplete="name" />
                <Field name="email" label="Email" type="email" required autoComplete="email" />
                <Field name="company" label="Company" autoComplete="organization" />
                <Field name="role" label="Role" autoComplete="organization-title" />
              </div>

              <label className="field">
                <span>Message</span>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={8}
                  placeholder="Tell me what you are working on."
                />
              </label>

              <div id="contact-status" aria-live="polite">
                {state === "sent" && (
                  <p className="status-success" role="status">
                    Message sent successfully. Thanks for reaching out.
                  </p>
                )}
                {state === "error" && (
                  <p className="status-error" role="alert">
                    Something went wrong. Please check your details and try again.
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" type="submit" disabled={state === "sending"}>
                  {state === "sending" ? "Sending…" : "Send message"}
                </button>
                <span className="muted">Your message is stored securely for follow-up.</span>
              </div>
            </form>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  autoComplete,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="field">
      <span>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <input name={name} type={type} required={required} autoComplete={autoComplete} />
    </label>
  );
}
