# Power Journal – Project Overview

## Purpose

Power Journal is a structured journaling system built on top of Obsidian. Its primary goals are to:

- Enable the creation of functional, interactive journal reports as Markdown files with embedded forms.
- Collect and normalize data from previous reports for analysis and automation.
- Store structured user inputs in a database to support analytics, aggregation, and AI-powered insights.
- Dynamically present statistics and trends within the forms themselves, based on collected data.

---

## Architecture & Development Environment

### Language & Tooling

- Developed in TypeScript for type safety and maintainability.
- Uses modern dependencies for parsing, data handling, and utilities.
- Built with Vite for a lightweight, dependency-free output script.

### Build & Deployment

- The app is bundled into a single, minimal script using Vite.
- No runtime dependencies are required in the final script, ensuring fast load and execution.

### Runtime Environment

- The built script is run inside Obsidian via the Templater plugin as a user script.
- Typically triggered from a note template (e.g., Daily Note) using Templater’s `tp.user.runPowerJournal(tp, config)`.
- The script interacts with Obsidian’s vault, reading and writing Markdown files.

---

## Workflow

### 1. Report Creation

- Users initiate journaling by running the `runPowerJournal` function, typically via an Obsidian Templater user script:
  ```js
  const config = { userName: "BoJack" };
  const report = await tp.user.runPowerJournal(tp, config);
  tR += report;
  ```
- `runPowerJournal` generates a new Markdown report file in the Obsidian vault.

### 2. Interactive Inputs & Dynamic Statistics

- Each report contains interactive form inputs, including:
  - Text
  - Number
  - Boolean (checkbox)
  - Rich text
  - Multicheckbox
- Every input is annotated with metadata:
  - `componentName`
  - `inputName`
  - `type`
  - Optional: `placeholder`, `hidden values`, etc.
- Forms can also dynamically present statistics, summaries, or trends from previously collected data, thanks to the underlying database.

### 3. Report Storage

- Generated reports are saved in dedicated folders, organized by report type.
- Markdown files serve as both readable documents and functional forms, allowing users to fill them manually or via automation.

### 4. Data Collection

- On subsequent runs, Power Journal:
  - Reads the latest report files for each report type.
  - Uses `InputCollectorService` to parse and extract input data.
  - Employs `ValueExtractor` to normalize values, including handling hidden values and multi-checkbox selections.

### 5. Database Storage

- Collected inputs are stored in a local JSON database (e.g., via lowdb).
- This enables:
  - Easy access to historical data.
  - Analytics and aggregation per report type.
  - AI-assisted insights, summaries, and trend analysis.
  - Dynamic presentation of statistics and progress within new forms.

---

## Key Features

- **Obsidian Integration:** Seamless use of Obsidian’s vault and Templater plugin.
- **Structured Data:** Consistent metadata and normalized input values.
- **Extensible Storage:** JSON-based database for flexible, local data management.
- **Automation Ready:** Designed for both manual and automated workflows.
- **Dynamic Statistics:** Forms can display up-to-date stats and trends from the database.
- **Analytics & AI:** Foundation for advanced analytics and AI-driven journaling insights.
