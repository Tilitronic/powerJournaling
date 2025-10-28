/**
 * Central export point for all input definitions
 *
 * This folder organizes all user inputs by category:
 * - habits: Daily/weekly/monthly habit tracking (with Habit type & PeriodicityUnit)
 * - wellbeing: PERMA+ wellbeing parameters (with WellbeingParameter type)
 * - practices: Meditation and contemplative practices (with MeditationPractice type)
 * - otherInputs: All remaining inputs (planning, reflection, awareness, etc.) - REFERENCE ONLY
 */

// Data exports
export * from "./habits";
export * from "./wellbeing";
export * from "./practices";
export * from "./inputsCollection";
export * from "./types";

// // Type exports
// export type { Habit } from "./habits";
// export type { MeditationPractice } from "./practices";
// export type { InputConfig } from "./inputsCollection";
