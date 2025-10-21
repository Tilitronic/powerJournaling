import { ComponentBuilder } from "src/services/ComponentBuilder";

export function mementoMori() {
  const componentName = "mementoMori";
  const cb = new ComponentBuilder(componentName);

  cb._md("## ☠️ Memento Mori: What Truly Matters (💡 OPTIONAL - 2-3 min)");

  cb._guidance(
    `**Remember You Will Die** — The ultimate clarifying lens

Memento Mori means "remember death." This isn't morbid — it's LIBERATING.

**The Problem** — we live as if we have infinite time. We postpone what matters. We stress over trivialities. We forget what's truly important.

**The Stoic Solution** — use death as a focusing tool. When you remember you will die, suddenly you see clearly.

**What this practice does:**
- **Clarifies priorities** — cuts through noise to what actually matters
- **Dissolves petty concerns** — that argument? That embarrassment? Irrelevant.
- **Motivates action** — tomorrow isn't guaranteed. Act NOW on what matters.
- **Creates gratitude** — every day alive is a gift to use well
- **Builds courage** — fear of judgment fades when you remember death

**The Four Pillars of Life** (from Stoic philosophy):
1. **Happiness & Peace of Mind** — inner tranquility and joy
2. **Body & Health** — physical wellbeing and vitality  
3. **People & Relationships** — love, connection, community
4. **Meaningful Work** — contributing something valuable

**How to practice:**
Ask yourself: "If today were my last day, would I waste it worrying about ___?" 
Usually, the answer is no. Then stop worrying about it.

_"You could leave life right now. Let that determine what you do and say and think."_ — Marcus Aurelius`,
    "Stoic Memento Mori"
  );

  cb._md(
    '> **The Death Question**: "If I died tonight, would I regret not doing _____ today?"'
  );

  cb._md("**Which of the four pillars needs your attention today?**");
  cb._text(
    "priority_area_today",
    "",
    "e.g., 'Relationships - I'll call my mom tonight and tell her I love her'"
  );

  return cb.render();
}
