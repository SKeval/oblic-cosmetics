import React, { useEffect, useState } from "react";
import { getFaqs } from "../api";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openId, setOpenId] = useState(null);

  useEffect(() => { getFaqs().then(setFaqs).catch(() => {}); }, []);

  return (
    <section className="container py-20" data-testid="faq-section">
      <div className="grid md:grid-cols-[0.9fr_1.4fr] gap-10 md:gap-16">
        <h2 className="font-display text-5xl md:text-6xl leading-[0.95]">Frequently<br />Asked<br />Questions</h2>
        <div className="border-t border-line">
          {faqs.map((f) => {
            const isOpen = openId === f.id;
            return (
              <div key={f.id} className="border-b border-line" data-testid={`faq-${f.id}`}>
                <button
                  onClick={() => setOpenId(isOpen ? null : f.id)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                  data-testid="faq-toggle"
                >
                  <span className="font-display text-[21px] md:text-2xl leading-snug pr-4">{f.question}</span>
                  {isOpen ? <Minus size={20} className="shrink-0" /> : <Plus size={20} className="shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-ink-soft text-[15px] leading-relaxed pb-6 max-w-2xl">{f.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
