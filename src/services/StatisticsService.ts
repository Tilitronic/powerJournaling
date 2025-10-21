import {
  mean,
  median,
  mode,
  standardDeviation,
  variance,
  min,
  max,
  quantile,
  sum,
} from "simple-statistics";
import * as asciichart from "asciichart";
import sparkly from "sparkly";
import { useLogger, LNs } from "../globals";

const logger = useLogger(LNs.StatisticsService);

export interface DescriptiveStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number | number[];
  min: number;
  max: number;
  range: number;
  variance: number;
  standardDeviation: number;
  q1: number; // 25th percentile
  q3: number; // 75th percentile
  iqr: number; // Interquartile range
}

export interface BooleanStats {
  count: number;
  trueCount: number;
  falseCount: number;
  nullCount: number;
  truePercentage: number;
  falsePercentage: number;
  longestTrueStreak: number;
  longestFalseStreak: number;
  currentStreak: number;
  currentStreakType: "true" | "false" | null;
}

export class StatisticsService {
  /**
   * Calculate descriptive statistics for numeric data
   * @param values - Array of numeric values
   * @returns Descriptive statistics object with optional visualization
   */
  descriptiveStatistics(
    values: number[],
    options?: {
      includeVisualization?: boolean;
      chartHeight?: number;
    }
  ): (DescriptiveStats & { visualization?: string }) | null {
    // Filter out any NaN or invalid values
    const cleanValues = values.filter(
      (val) => typeof val === "number" && !isNaN(val)
    );

    if (cleanValues.length === 0) {
      logger.warn("No valid numeric values found for descriptive statistics");
      return null;
    }

    try {
      const q1 = quantile(cleanValues, 0.25);
      const q3 = quantile(cleanValues, 0.75);

      const stats: DescriptiveStats & { visualization?: string } = {
        count: cleanValues.length,
        sum: sum(cleanValues),
        mean: mean(cleanValues),
        median: median(cleanValues),
        mode: mode(cleanValues),
        min: min(cleanValues),
        max: max(cleanValues),
        range: max(cleanValues) - min(cleanValues),
        variance: variance(cleanValues),
        standardDeviation: standardDeviation(cleanValues),
        q1,
        q3,
        iqr: q3 - q1,
      };

      // Add visualization if requested
      if (options?.includeVisualization) {
        const chartHeight = options.chartHeight || 10;
        const sparkline = this.createSparkline(cleanValues);
        const chart = this.createLineChart(cleanValues, chartHeight);

        stats.visualization = `
**Sparkline:** ${sparkline}

**Trend Chart:**
\`\`\`
${chart}
\`\`\`
`.trim();
      }

      logger.dev("Calculated descriptive statistics", { stats });
      return stats;
    } catch (error) {
      logger.error("Error calculating descriptive statistics", { error });
      return null;
    }
  }

  /**
   * Calculate statistics for boolean (habit tracking) data
   * @param values - Array of boolean values (can include nulls for missing data)
   * @returns Boolean statistics object
   */
  booleanStatistics(values: (boolean | null)[]): BooleanStats {
    const trueCount = values.filter((val) => val === true).length;
    const falseCount = values.filter((val) => val === false).length;
    const nullCount = values.filter((val) => val === null).length;
    const total = values.length;

    // Calculate streaks
    let longestTrueStreak = 0;
    let longestFalseStreak = 0;
    let currentStreak = 0;
    let currentStreakType: "true" | "false" | null = null;

    let tempTrueStreak = 0;
    let tempFalseStreak = 0;

    for (const val of values) {
      if (val === true) {
        tempTrueStreak++;
        tempFalseStreak = 0;
      } else if (val === false) {
        tempFalseStreak++;
        tempTrueStreak = 0;
      }

      longestTrueStreak = Math.max(longestTrueStreak, tempTrueStreak);
      longestFalseStreak = Math.max(longestFalseStreak, tempFalseStreak);
    }

    // Current streak (most recent)
    const lastVal = values[values.length - 1];
    if (lastVal === true) {
      currentStreak = tempTrueStreak;
      currentStreakType = "true";
    } else if (lastVal === false) {
      currentStreak = tempFalseStreak;
      currentStreakType = "false";
    }

    const stats: BooleanStats = {
      count: total,
      trueCount,
      falseCount,
      nullCount,
      truePercentage: total > 0 ? (trueCount / total) * 100 : 0,
      falsePercentage: total > 0 ? (falseCount / total) * 100 : 0,
      longestTrueStreak,
      longestFalseStreak,
      currentStreak,
      currentStreakType,
    };

    logger.dev("Calculated boolean statistics", { stats });
    return stats;
  }

  /**
   * Format descriptive statistics as markdown
   */
  formatDescriptiveStats(stats: DescriptiveStats): string {
    return `
**Count:** ${stats.count}
**Sum:** ${stats.sum.toFixed(2)}
**Mean:** ${stats.mean.toFixed(2)}
**Median:** ${stats.median.toFixed(2)}
**Mode:** ${Array.isArray(stats.mode) ? stats.mode.join(", ") : stats.mode}
**Min:** ${stats.min.toFixed(2)}
**Max:** ${stats.max.toFixed(2)}
**Range:** ${stats.range.toFixed(2)}
**Std Dev:** ${stats.standardDeviation.toFixed(2)}
**Variance:** ${stats.variance.toFixed(2)}
**Q1 (25%):** ${stats.q1.toFixed(2)}
**Q3 (75%):** ${stats.q3.toFixed(2)}
**IQR:** ${stats.iqr.toFixed(2)}
`.trim();
  }

  /**
   * Format boolean statistics as markdown
   */
  formatBooleanStats(stats: BooleanStats, habitName: string): string {
    const streakEmoji = stats.currentStreakType === "true" ? "✨" : "❄️";
    return `
**${habitName} Statistics**
- Total tracked: ${stats.count} days
- Success rate: ${stats.truePercentage.toFixed(1)}% (${stats.trueCount}/${
      stats.count
    })
- Longest streak: ${stats.longestTrueStreak} days 🏆
- Current streak: ${streakEmoji} ${stats.currentStreak} days
`.trim();
  }

  /**
   * Create ASCII line chart from numeric data
   * Perfect for showing trends in code blocks
   */
  createLineChart(
    values: number[],
    height: number = 10,
    width?: number
  ): string {
    if (values.length === 0) {
      return "No data to display";
    }

    const config: any = { height };
    if (width) config.width = width;

    return asciichart.plot(values, config);
  }

  /**
   * Create sparkline (inline mini-chart using Unicode block characters)
   * Perfect for inline trend indicators: ▁▂▃▅▆▇█
   */
  createSparkline(values: number[]): string {
    if (values.length === 0) {
      return "—";
    }
    return sparkly(values);
  }

  /**
   * Create visual bar chart for boolean data (habit tracking)
   * Shows last N days as checkmarks and X's
   */
  createBooleanBarChart(
    values: (boolean | null)[],
    maxWidth: number = 30
  ): string {
    const displayValues = values.slice(-maxWidth); // Show last N values
    const chars = displayValues.map((val) => {
      if (val === true) return "✅";
      if (val === false) return "❌";
      return "⬜"; // null/not tracked
    });
    return chars.join("");
  }

  /**
   * Create Mermaid pie chart for boolean data
   * Native Obsidian support - renders as SVG
   */
  createBooleanPieChart(stats: BooleanStats, title: string): string {
    return `\`\`\`mermaid
pie title ${title}
    "Completed" : ${stats.trueCount}
    "Skipped" : ${stats.falseCount}
    ${stats.nullCount > 0 ? `"Not Tracked" : ${stats.nullCount}` : ""}
\`\`\``;
  }

  /**
   * Create a complete visual report for boolean/habit data
   */
  createBooleanVisualReport(
    values: (boolean | null)[],
    habitName: string,
    options: {
      showSparkline?: boolean;
      showBarChart?: boolean;
      showAsciiChart?: boolean;
      showPieChart?: boolean;
      dates?: string[]; // Optional date labels for context
    } = {}
  ): string {
    const {
      showSparkline = true,
      showBarChart = true,
      showAsciiChart = true,
      showPieChart = false,
      dates = [],
    } = options;

    const stats = this.booleanStatistics(values);
    const numericValues = values.map((v) => (v === true ? 1 : 0));

    let report = `## 📊 ${habitName}\n\n`;

    // Stats summary
    report += this.formatBooleanStats(stats, habitName) + "\n\n";

    // Sparkline
    if (showSparkline) {
      report += `**Trend:** ${this.createSparkline(numericValues)}\n\n`;
    }

    // Bar chart (emoji)
    if (showBarChart) {
      report += `**Last ${Math.min(values.length, 30)} days:**\n`;
      report += this.createBooleanBarChart(values, 30) + "\n\n";

      // Add date range context if available
      if (dates.length > 0) {
        const firstDate = dates[0];
        const lastDate = dates[dates.length - 1];
        report += `*From ${firstDate} to ${lastDate}*\n\n`;
      }
    }

    // ASCII line chart - simple, no fancy axes
    if (showAsciiChart && numericValues.length >= 3) {
      report += "**Trend Chart:**\n```\n";
      report += this.createLineChart(numericValues, 6);
      report += "\n```\n\n";
    }

    // Mermaid pie chart
    if (showPieChart) {
      report +=
        this.createBooleanPieChart(stats, `${habitName} Distribution`) + "\n\n";
    }

    return report;
  }

  /**
   * Create a complete visual report for numeric data
   */
  createNumericVisualReport(
    values: number[],
    label: string,
    options: {
      showSparkline?: boolean;
      showAsciiChart?: boolean;
      showStats?: boolean;
    } = {}
  ): string {
    const {
      showSparkline = true,
      showAsciiChart = true,
      showStats = true,
    } = options;

    const stats = this.descriptiveStatistics(values);
    if (!stats) {
      return `## ${label}\n\nNo data available`;
    }

    let report = `## 📈 ${label}\n\n`;

    // Stats
    if (showStats) {
      report += this.formatDescriptiveStats(stats) + "\n\n";
    }

    // Sparkline
    if (showSparkline) {
      report += `**Trend:** ${this.createSparkline(values)}\n\n`;
    }

    // ASCII chart
    if (showAsciiChart) {
      report += "**Trend Chart:**\n```\n";
      report += this.createLineChart(values, 10);
      report += "\n```\n\n";
    }

    return report;
  }
}

export const statisticsService = new StatisticsService();
