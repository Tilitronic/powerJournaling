import { ComponentBuilder } from "src/services/ComponentBuilder";

export function morningReflection() {
  const componentName = "morningReflection";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🧘 Morning Reflection (⭐ RECOMMENDED - 2-3 min)");

  cb._guidance(
    `**The Dichotomy of Control** — The foundation of Stoic peace

**From Stoicism** — the Stoics teach that **all suffering comes from desiring things outside your control**. This morning meditation trains you to recognize what you can and cannot control, so you waste no energy on the unchangeable.

**Why this matters:**
- **Focus your power** — stop struggling against things you cannot change
- **Reduce anxiety** — let go of outcomes beyond your influence  
- **Build resilience** — accept reality as it is, not as you wish it were
- **Increase effectiveness** — channel all your energy into what you CAN control

_"Make the best use of what is in your power, and take the rest as it happens."_ — Epictetus`,
    "Stoic Discipline of Desire"
  );

  cb._guidance(
    `**✅ COMPLETELY IN YOUR CONTROL:**
- Your judgments and opinions
- Your responses to events
- Your character and virtues
- Your effort and attention
- How you treat others
- What you value

**❌ NOT IN YOUR CONTROL:**
- Other people's opinions and actions
- Outcomes and results
- Past and future events
- Your reputation
- The weather, traffic, luck
- Sickness, aging, death`,
    "The Dichotomy of Control"
  );

  cb._guidance(
    `**🌊 The Way of Water** (from Taoism - Wu Wei)

When you face obstacles today, ask:
- "Can I change this?" → If yes, take action. If no, accept it.
- "What can I learn from this obstacle?"
- "How would water flow around this?"

Water doesn't fight obstacles; it flows around them. Be like water.`,
    "Wu Wei — The Way of Water"
  );

  cb._guidance(
    `**🏔️ The Obstacle Is The Way** (from Stoicism)

Marcus Aurelius taught: **"The impediment to action advances action. What stands in the way becomes the way."**

Every obstacle contains an opportunity:
- **Obstacle blocks your plan?** → forces you to become more creative and resourceful
- **Person frustrates you?** → chance to practice patience and understanding  
- **Failure happens?** → data for learning and growth
- **Delay occurs?** → time to prepare better or rest

**The shift** — stop seeing obstacles as problems; start seeing them as **training equipment** for your character.

**Remember** — the obstacle is not the enemy; your resistance to it is.`,
    "The Obstacle Is The Way"
  );

  cb._md("### Mindset Practices Completed");
  cb._md("*Track which practices you engaged with today:*");

  cb._boolean(
    "dichotomy_of_control_practiced",
    "📋 Reviewed Dichotomy of Control (what I can/cannot control)",
    false
  );

  cb._boolean(
    "wu_wei_practiced",
    "🌊 Reflected on Wu Wei (flowing like water around obstacles)",
    false
  );

  cb._boolean(
    "obstacle_is_way_practiced",
    "🏔️ Contemplated 'The Obstacle Is The Way' mindset",
    false
  );

  return cb.render();
}
