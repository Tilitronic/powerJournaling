import { ComponentBuilder } from "src/services/ComponentBuilder";

export function morningReflection() {
  const componentName = "morningReflection";
  const cb = new ComponentBuilder(componentName);

  cb._md("## 🧘 Morning Reflection (⭐ RECOMMENDED - 2-3 min)");

  cb._foldable(
    `**What This Practice Does:**
This is the foundational Stoic exercise that eliminates suffering by training you to focus only on what you can control.

**The Core Principle:**
The Stoics discovered that **all suffering comes from desiring things outside your control**. When you stop struggling against the unchangeable and channel your energy into what you CAN control, you gain peace of mind.

**✅ COMPLETELY IN YOUR CONTROL:**
- Your judgments, opinions, and interpretations
- Your responses and reactions to events
- Your character, virtues, and values
- Your effort, attention, and choices
- How you treat others
- What you pursue and avoid

**❌ OUTSIDE YOUR CONTROL:**
- Other people's opinions, actions, and judgments
- Outcomes, results, and consequences
- Past events and future circumstances
- Your reputation and what others think
- External events (weather, traffic, delays)
- Natural processes (aging, sickness, death)

**How to Practice:**
When faced with any situation today, ask yourself: "Is this within my control?" If yes, take action. If no, accept it and focus on your response instead.

_"Make the best use of what is in your power, and take the rest as it happens."_ — Epictetus`,
    "Stoic Practice: The Dichotomy of Control"
  );

  cb._boolean(
    "dichotomy_of_control_practiced",
    "📋 I practiced the Dichotomy of Control (separating what I can/cannot control)"
  );

  cb._foldable(
    `**What This Practice Does:**
Wu Wei teaches effortless action – responding to life's obstacles with flexibility rather than rigid resistance.

**The Core Principle:**
From Taoism comes the wisdom of "flowing like water." Water doesn't fight obstacles – it adapts, flows around them, and finds a way through. When you stop resisting what you cannot change, you conserve energy and discover creative solutions.

**How to Practice Wu Wei Today:**

1. **When you encounter an obstacle, pause and ask:**
   - "Can I change this?" → If yes, take calm action. If no, accept it.
   - "What can I learn from this?"
   - "How would water respond to this?"

2. **Remember:** Fighting against unchangeable circumstances drains your energy. Flowing with them preserves it.

3. **The shift:** From "This shouldn't be happening" to "This IS happening – how do I respond skillfully?"

_"The rigid tree breaks in the wind. The flexible tree bends and survives."_ — Taoist wisdom`,
    "Taoist Practice: Wu Wei (Effortless Action)"
  );

  cb._boolean(
    "wu_wei_practiced",
    "🌊 I practiced Wu Wei (accepting what I cannot change and flowing like water)"
  );

  cb._foldable(
    `**What This Practice Does:**
Transforms obstacles from problems into opportunities for growth, creativity, and building character.

**The Core Principle:**
Marcus Aurelius taught: **"The impediment to action advances action. What stands in the way becomes the way."**

This means every obstacle contains hidden opportunity:
- **Blocked plan?** → Forces you to become more creative and resourceful
- **Frustrating person?** → Opportunity to practice patience and understanding
- **Failure?** → Valuable data for learning and improvement
- **Delay?** → Gift of time to prepare better or rest

**The Reframe:**
Stop seeing obstacles as enemies. Start seeing them as **training equipment** for your character. Each challenge makes you stronger, wiser, more resilient.

**How to Practice:**
When you face a setback today, ask: "What opportunity is hidden in this obstacle? How is this making me better?"

_"The obstacle is not blocking your path – it IS your path. It's revealing where you need to grow."_ — Ryan Holiday`,
    "Stoic Practice: The Obstacle Is The Way"
  );

  cb._boolean(
    "obstacle_is_way_practiced",
    "🏔️ I practiced 'The Obstacle Is The Way' (reframing obstacles as opportunities)"
  );

  return cb.render();
}
