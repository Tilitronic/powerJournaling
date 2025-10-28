import { config } from "src/globals";
import { ComponentBuilder } from "src/services/ComponentBuilder";
import { dbService } from "src/services/DbService";
import { statisticsService } from "src/services/StatisticsService";
import { scheduleEvaluator } from "src/services/ScheduleService/ScheduleEvaluator";
import { WellbeingConfig, wellbeingConfigs } from "src/inputs";
import { PeriodicityUnits as PU } from "src/services/ScheduleService";
import { ReportTypes } from "src/reportDefinitions";

export async function permaPlus() {
  const componentId = "permaPlus";
  const cb = new ComponentBuilder(componentId);

  // Use ScheduleEvaluator to filter parameters
  const parameterFilterPromises = wellbeingConfigs.map(async (param) => {
    const shouldShow = await scheduleEvaluator.shouldShowInput(param);
    return shouldShow ? param : null;
  });

  const parametersToShow = (await Promise.all(parameterFilterPromises)).filter(
    (p) => p !== null
  ) as WellbeingConfig[];

  // Store metadata about periodicity for later use when saving
  const periodicityMap = new Map<string, number>();
  parametersToShow.forEach((param) => {
    if (param.schedule?.showEvery?.unit === PU.Day) {
      periodicityMap.set(param.id, param.schedule.showEvery.count);
    }
  });

  // Get all parameters (not just ones to show) for statistics
  const allParameters = wellbeingConfigs.filter(
    (p) => !p.schedule || p.schedule.active !== false
  );

  // Fetch historical data for all parameters (last 20 FILLED reports, not calendar days)
  // Use ALL parameters for statistics, not just ones shown today
  const parameterIds = allParameters.map((p) => p.id);
  let historicalData: Map<string, number[]> = new Map();
  let last5DayAverages: Map<string, number> = new Map();
  let last20ReportAverages: Map<string, number> = new Map();
  let dateRange = { first: "", last: "", reportCount: 0 };

  try {
    const allData = await dbService.getInputsLastNReports(
      ReportTypes.ALMOST_DAILY,
      parameterIds,
      20
    );

    // Extract date range for context
    if (allData.length > 0) {
      const dates = Array.from(
        new Set(allData.map((input) => input.reportDate || ""))
      ).sort();
      dateRange = {
        first: dates[0],
        last: dates[dates.length - 1],
        reportCount: dates.length,
      };
    }

    // Group data by parameter
    allParameters.forEach((param) => {
      const paramData = allData
        .filter((input) => input.inputId === param.id)
        .map((input) => {
          // Convert string values to numbers, handling arrays from multicheckbox
          const val = Array.isArray(input.value) ? input.value[0] : input.value;
          return typeof val === "string" ? parseFloat(val) : (val as number);
        })
        .filter((v) => !isNaN(v));

      historicalData.set(param.id, paramData);

      // Calculate 5-report and 20-report averages
      if (paramData.length > 0) {
        const last5 = paramData.slice(-5);
        const avg5 = last5.reduce((a, b) => a + b, 0) / last5.length;
        last5DayAverages.set(param.id, avg5);

        const avg20 = paramData.reduce((a, b) => a + b, 0) / paramData.length;
        last20ReportAverages.set(param.id, avg20);
      }
    });
  } catch (error) {
    // If data fetch fails, continue without statistics
    console.error("Failed to fetch PERMA historical data:", error);
  }

  // Header and guidance
  cb._md("## 💚 PERMA+8 Wellbeing Check (📌 CORE - 2-3 min)");

  cb._foldable(
    `**PERMA+8 Model**: Comprehensive wellbeing framework covering 13 dimensions:

**Core PERMA:**
- Positive Emotions, Engagement, Relationships, Meaning, Accomplishment

**Body & Physical:**
- Sleep Quality, Embodiment (body acceptance), Physical Pleasure, Touch & Intimacy, Physical Condition

**Life Context:**
- Mindset, Environment, Economic Security

Rate honestly—awareness is the first step to change.

**Rate each dimension** (3 = Great, 2 = Adequate, 1 = Struggling):`
  );

  // Create rating options
  const ratingOptions = [
    { label: "3 - Great", value: "3" },
    { label: "2 - Adequate", value: "2" },
    { label: "1 - Struggling", value: "1" },
  ];

  // For each parameter TO SHOW TODAY, create a section with description, 5-report average, and rating
  parametersToShow.forEach((param) => {
    const avg5 = last5DayAverages.get(param.id);
    const avgDisplay =
      avg5 !== undefined ? ` (last 5 reports: ${avg5.toFixed(1)})` : "";

    // Add periodicity info if applicable
    const periodicityNote = param.schedule?.showEvery
      ? ` *(shown every ${param.schedule.showEvery.count} ${
          param.schedule.showEvery.unit
        }${param.schedule.showEvery.count > 1 ? "s" : ""})*`
      : "";

    cb._inputLabel(
      `${param.label}${avgDisplay}${periodicityNote}`,
      `*${param.description}*`
    );

    // Use multicheckbox with singleChoice for radio button behavior
    cb._input(param.inputOptions);
  });

  // Add summary statistics section if we have data
  if (
    historicalData.size > 0 &&
    Array.from(historicalData.values()).some((arr) => arr.length >= 3)
  ) {
    cb._themedDivider("Wellbeing Trends", "📊");

    // Calculate overall wellbeing score (average across all dimensions)
    const allValues: number[] = [];
    historicalData.forEach((values) => {
      allValues.push(...values);
    });

    if (allValues.length > 0) {
      const overallAvg =
        allValues.reduce((a, b) => a + b, 0) / allValues.length;
      const sparkline = statisticsService.createSparkline(
        Array.from(historicalData.values())[0] // Use first parameter's trend as proxy
      );

      cb._md(
        `**Overall Wellbeing (last ${
          dateRange.reportCount
        } reports): ${overallAvg.toFixed(1)}/3.0** ${sparkline}`
      );

      if (dateRange.first && dateRange.last) {
        cb._md(`*Data from ${dateRange.first} to ${dateRange.last}*`);
      }

      // Find areas needing attention and areas of strength
      const sortedByAverage = allParameters
        .map((param) => ({
          param,
          avg: last20ReportAverages.get(param.id) || 0,
          dataPoints: historicalData.get(param.id)?.length || 0,
        }))
        .filter((item) => item.dataPoints >= 3)
        .sort((a, b) => a.avg - b.avg);

      if (sortedByAverage.length > 0) {
        const weakest = sortedByAverage[0];
        const strongest = sortedByAverage[sortedByAverage.length - 1];

        cb._md("**Insights:**");

        if (weakest.avg < 2.0) {
          cb._md(
            `- ⚠️ **Needs attention**: ${
              weakest.param.label
            } (avg: ${weakest.avg.toFixed(
              1
            )}) — Consider prioritizing this area`
          );
        }

        if (strongest.avg >= 2.5) {
          cb._md(
            `- ✨ **Strength area**: ${
              strongest.param.label
            } (avg: ${strongest.avg.toFixed(1)}) — Keep up the good work!`
          );
        }

        // Show compact trends for each dimension
        cb._md(`**Trends (last ${dateRange.reportCount} reports):**`);
        allParameters.forEach((param) => {
          const data = historicalData.get(param.id);
          if (data && data.length >= 3) {
            const avg = last20ReportAverages.get(param.id) || 0;
            const sparkline = statisticsService.createSparkline(data);
            const trend =
              data.length >= 2
                ? data[data.length - 1] > data[data.length - 2]
                  ? "↗"
                  : data[data.length - 1] < data[data.length - 2]
                  ? "↘"
                  : "→"
                : "→";
            cb._md(`- ${param.label}: ${avg.toFixed(1)} ${sparkline} ${trend}`);
          }
        });
      }
    }
  }

  cb._divider();

  cb._inputLabel("Quick Reflection", "Which area needs attention tomorrow?");
  cb._text(
    "perma_focus_tomorrow",
    "",
    "e.g., Relationships, Physical Wellbeing..."
  );

  return cb.render();
}
