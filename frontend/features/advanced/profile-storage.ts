export type LifestyleProfile = {
  physical_activity_level: string;
  exercise_frequency: string;
  average_daily_step_count: string;
  type_of_activity: string;
  overall_diet_quality: string;
  sugar_intake: string;
  junk_processed_food_frequency: string;
  daily_water_intake: string;
  fruit_vegetable_intake: string;
  sugary_drinks_per_week: string;
  average_sleep_duration: string;
  sleep_quality: string;
  sleep_consistency: string;
  stress_level: string;
  work_study_pressure: string;
  screen_time_per_day: string;
  smoking: string;
  alcohol_consumption: string;
  family_history_of_diabetes: string;
  previous_diagnosis_of_diabetes: string;
  history_of_prediabetes: string;
  hypertension: string;
  obesity: string;
  pcos: string;
  current_medications: string;
  resting_heart_rate: string;
  waist_circumference: string;
  cholesterol_level: string;
  triglycerides: string;
  frequent_thirst: string;
  frequent_urination: string;
  fatigue_level: string;
  unexplained_weight_changes: string;
  blurred_vision: string;
  meal_timing_consistency: string;
  late_night_eating: string;
  daily_sedentary_hours: string;
};

export const STORAGE_KEY = "glucox.advanced.lifestyle-profile";
const LEGACY_STORAGE_KEY = "diasense.advanced.lifestyle-profile";

export function createEmptyLifestyleProfile(): LifestyleProfile {
  return {
    physical_activity_level: "",
    exercise_frequency: "",
    average_daily_step_count: "",
    type_of_activity: "",
    overall_diet_quality: "",
    sugar_intake: "",
    junk_processed_food_frequency: "",
    daily_water_intake: "",
    fruit_vegetable_intake: "",
    sugary_drinks_per_week: "",
    average_sleep_duration: "",
    sleep_quality: "",
    sleep_consistency: "",
    stress_level: "",
    work_study_pressure: "",
    screen_time_per_day: "",
    smoking: "",
    alcohol_consumption: "",
    family_history_of_diabetes: "",
    previous_diagnosis_of_diabetes: "",
    history_of_prediabetes: "",
    hypertension: "",
    obesity: "",
    pcos: "",
    current_medications: "",
    resting_heart_rate: "",
    waist_circumference: "",
    cholesterol_level: "",
    triglycerides: "",
    frequent_thirst: "",
    frequent_urination: "",
    fatigue_level: "",
    unexplained_weight_changes: "",
    blurred_vision: "",
    meal_timing_consistency: "",
    late_night_eating: "",
    daily_sedentary_hours: "",
  };
}

export function loadLifestyleProfile(): LifestyleProfile {
  const emptyProfile = createEmptyLifestyleProfile();

  if (typeof window === "undefined") {
    return emptyProfile;
  }

  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY);

    if (!raw) {
      return emptyProfile;
    }

    return { ...emptyProfile, ...(JSON.parse(raw) as Partial<LifestyleProfile>) };
  } catch {
    return emptyProfile;
  }
}

export function saveLifestyleProfile(profile: LifestyleProfile) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function getFilledLifestyleProfile(profile: LifestyleProfile) {
  return Object.entries(profile).filter(([, value]) => value.trim().length > 0) as Array<
    [keyof LifestyleProfile, string]
  >;
}

export function countFilledLifestyleProfileFields(profile: LifestyleProfile) {
  return getFilledLifestyleProfile(profile).length;
}

export function normalizeLifestyleValue(value: string) {
  if (!value) return "Not provided";
  return value.replaceAll("_", " ");
}
