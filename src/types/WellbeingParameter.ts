export interface WellbeingParameter {
  id: string; // unique key, e.g. "positiveEmotions"
  label: string; // human-readable name
  info: string; // description of the parameter
  active: boolean; // whether it is tracked
}
