# Power Journal

An automated wellbeing-focused journaling system for Obsidian that combines philosophical practices, modern psychology tracking (PERMA wellbeing model), and data analytics.

## What is Power Journal

Power Journal is configured to run automatically using Daily Note and Templater plugins for Obsidian. It creates daily notes (which are essentially forms in markdown), collects data from previous notes, saves it all in a local database, and uses this data to show statistics in every new report. This helps you monitor your state and track your progress over time.

## How It Works

1. **Build Process:** Vite bundles all TypeScript code into a single JavaScript file, externalizing dependencies (except those provided by Node.js in Templater's Obsidian environment)

2. **Daily Execution:** The bundled script is copied to your Obsidian vault and runs automatically each day when you open your daily note

3. **Form Generation:** The script builds a markdown file as an interactive form using invisible HTML tags (<span>) to capture

   - text inputs
   - number inputs
   - checkbox inputs

     **Important.** Do not modify these HTML tags manually, as it will cause errors in data collection.

4. **Data Collection.** When creating a new note, the script:

   - collects data from the previous day's note,
   - saves it to a local database using [lowdb](https://github.com/typicode/lowdb),
   - uses the collected data to display statistics and trends in the new note.

5. **Progressive Tracking:** Over time, you build a rich dataset that powers insights about your wellbeing patterns and progress

## Who It's For

If you're interested in wellbeing, have tried manual journaling and found it too much work, or have tried journaling/habits/mood tracking apps and found them lacking, **and** you know some JavaScript/TypeScript - this is the perfect app for you.

## Features

### Expanded PERMA Wellbeing Model

Track a wide range of wellbeing parameters with simple checkboxes.

### Habits Tracking System

Add and monitor custom habits in your daily notes.

### Easy Customization

Customize habits, wellbeing parameters and your entire daily note structure.

- **Friendly markdown note building services**. Simple TypeScript builders for creating report components
- **Input config object system**. Declarative configuration for all your tracking inputs
- No need to write complex markdown - just configure objects, run `npm run build`, and let the system handle the formatting

### Advanced Scheduling System

Configure scheduling for habits, inputs, and any report fragment:

- display every N days/weeks;
- show on specific days;
- set goals or limits to stop displaying after a certain number of completions per time period;
- highly flexible and customizable;

### Descriptive Statistics in Daily Notes

View basic descriptive statistics directly in your daily notes, such as:

- average physical condition, sleep quality and more;
- trend direction visualization

## How to Configure

### 1. Clone the Repository

```bash
git clone https://github.com/Tilitronic/powerJournaling.git
cd powerJournaling
```

### 2. Set Up Environment Variables

Create a `.env` file in the root folder and add your Obsidian vault path:

```properties
OBSIDIAN_VAULT=W:/DOCUMENTS/ObsidianSync/.ObsidianSF
```

### 3. Install and Build

```bash
npm install
npm run build
```

The script will automatically:

- create `powerJournal/core/` folder in your vault if it doesn't exist,
- copy `runPowerJournal.js` to the core folder (replacing old version),
- copy `powerJournal.tp.md` template to the core folder (only on first run).

### 4. Configure Obsidian Plugins

#### Daily Notes Plugin

1. Install the **Daily Notes** plugin
2. Configure settings as described below.
   - **Date format:** `DD.MM.YYYY`
   - **New file location:** `powerJournal/core`
   - **Template file location:** `powerJournal/core/powerJournal.tp`
   - Enable **"Open daily note on startup"**

#### Templater Plugin

1. Install the **Templater** plugin
2. Configure settings as described below.
   - Enable **"Trigger Templater on new file creation"** (this will detect and execute the script inside daily notes)
   - In **"User script functions"** section, set **"Script folder location"** to `powerJournal/core`

### 5. Start Using Power Journal!

Your daily notes will now be automatically generated with all the tracking features and statistics.

## Planned Features

- Monthly summary reports
- More advanced statistics
- Use ML models for dependency analysis
- Use LLM models for summaries and personalized advice
- Add sources citation for approaches journal uses
- Get a psychologist to review the project

## License

This project is licensed under [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](LICENSE.md).

- 2025 Rostyslav Lukan ([Tilitronic](https://github.com/Tilitronic))\*

* Free for personal and non-commercial use
* Attribution required
* Commercial use prohibited

For commercial licensing inquiries, please contact the author.

---

**Made with ❤️ for better wellbeing tracking and improvement**
