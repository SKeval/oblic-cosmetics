import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from "../pages/About";

const EMAIL = "Obliccosmetics@gmail.com";

export default function PolicyLayout({ title, intro, sections, contactLabel }) {
  useEffect(() => window.scrollTo(0, 0), []);
  return (
    <div className="container py-14 max-w-3xl" data-testid="policy-page">
      <Link to="/" className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink mb-8 transition-colors">
        <ArrowLeft size={14} /> Back to Home
      </Link>
      <p className="text-[12px] tracking-[0.25em] uppercase text-muted mb-4">Legal, Oblic Cosmetic</p>
      <h1 className="font-display text-5xl md:text-6xl leading-[0.98]" data-testid="policy-title">{title}</h1>
      <p className="text-muted text-[13px] mt-4">Effective Date: June 2026 · Last Updated: June 2026</p>
      <p className="text-ink-soft mt-6 text-[15px] leading-relaxed">{intro}</p>

      <div className="mt-12 space-y-10">
        {sections.map((s, i) => (
          <section key={i} data-testid={`policy-section-${i + 1}`}>
            <div className="flex items-baseline gap-3 mb-3">
              <span className="font-display text-plum text-[15px]">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-display text-2xl md:text-3xl">{s.title}</h2>
            </div>
            <div className="space-y-3">
              {s.blocks.map((b, j) =>
                Array.isArray(b) ? (
                  <ul key={j} className="list-disc pl-5 space-y-1.5 text-ink-soft text-[15px] leading-relaxed">
                    {b.map((li, k) => <li key={k}>{li}</li>)}
                  </ul>
                ) : (
                  <p key={j} className="text-ink-soft text-[15px] leading-relaxed">{b}</p>
                )
              )}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-line pt-8">
        <p className="text-ink-soft text-[15px] leading-relaxed">
          {contactLabel} Contact us at{" "}
          <a className="underline underline-offset-2 hover:text-ink" href={`mailto:${EMAIL}`}>{EMAIL}</a>{" "}
          or WhatsApp us at{" "}
          <a className="underline underline-offset-2 hover:text-ink" href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">{WHATSAPP_DISPLAY}</a>.
        </p>
      </div>
    </div>
  );
}
