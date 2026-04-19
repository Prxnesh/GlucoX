"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createEmptyLifestyleProfile,
  loadLifestyleProfile,
  saveLifestyleProfile,
  type LifestyleProfile,
} from "@/features/advanced/profile-storage";

const initialValues = createEmptyLifestyleProfile();

const selectClassName =
  "flex h-12 w-full rounded-2xl border border-white/70 bg-white/78 px-4 py-3 text-sm shadow-[0_12px_30px_rgba(117,145,167,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/12 dark:bg-white/6 dark:shadow-[0_12px_30px_rgba(4,13,22,0.45)]";

export function LifestyleProfileForm() {
  const [values, setValues] = useState<LifestyleProfile>(initialValues);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setValues(loadLifestyleProfile());
  }, []);

  const updateField = (field: keyof LifestyleProfile, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveLifestyleProfile(values);
    setSavedAt(new Date().toLocaleString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-[var(--font-display)] text-2xl">Advanced lifestyle assessment</CardTitle>
        <CardDescription>
          Fill this profile to capture behavioral, clinical, and symptom context beyond standard lab inputs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <Section title="Lifestyle & Activity">
            <Field label="Physical activity level">
              <select className={selectClassName} value={values.physical_activity_level} onChange={(event) => updateField("physical_activity_level", event.target.value)}>
                <option value="">Select level</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Exercise frequency (days/week)">
              <Input value={values.exercise_frequency} onChange={(event) => updateField("exercise_frequency", event.target.value)} placeholder="e.g., 4" inputMode="numeric" />
            </Field>
            <Field label="Average daily step count">
              <Input value={values.average_daily_step_count} onChange={(event) => updateField("average_daily_step_count", event.target.value)} placeholder="e.g., 7500" inputMode="numeric" />
            </Field>
            <Field label="Type of activity">
              <Input value={values.type_of_activity} onChange={(event) => updateField("type_of_activity", event.target.value)} placeholder="Walking, strength training, cycling" />
            </Field>
          </Section>

          <Section title="Diet & Nutrition">
            <Field label="Overall diet quality">
              <Select5 value={values.overall_diet_quality} onChange={(value) => updateField("overall_diet_quality", value)} />
            </Field>
            <Field label="Sugar intake">
              <Select5 value={values.sugar_intake} onChange={(value) => updateField("sugar_intake", value)} />
            </Field>
            <Field label="Junk/processed food frequency">
              <Input value={values.junk_processed_food_frequency} onChange={(event) => updateField("junk_processed_food_frequency", event.target.value)} placeholder="e.g., 3 times/week" />
            </Field>
            <Field label="Daily water intake (liters)">
              <Input value={values.daily_water_intake} onChange={(event) => updateField("daily_water_intake", event.target.value)} placeholder="e.g., 2.5" inputMode="decimal" />
            </Field>
            <Field label="Fruit and vegetable intake">
              <Input value={values.fruit_vegetable_intake} onChange={(event) => updateField("fruit_vegetable_intake", event.target.value)} placeholder="e.g., 4 servings/day" />
            </Field>
            <Field label="Sugary drinks per week">
              <Input value={values.sugary_drinks_per_week} onChange={(event) => updateField("sugary_drinks_per_week", event.target.value)} placeholder="e.g., 2" inputMode="numeric" />
            </Field>
          </Section>

          <Section title="Sleep & Recovery">
            <Field label="Average sleep duration (hours)">
              <Input value={values.average_sleep_duration} onChange={(event) => updateField("average_sleep_duration", event.target.value)} placeholder="e.g., 7" inputMode="decimal" />
            </Field>
            <Field label="Sleep quality">
              <Select5 value={values.sleep_quality} onChange={(value) => updateField("sleep_quality", value)} />
            </Field>
            <Field label="Sleep consistency">
              <Select5 value={values.sleep_consistency} onChange={(value) => updateField("sleep_consistency", value)} />
            </Field>
          </Section>

          <Section title="Stress & Mental Factors">
            <Field label="Stress level">
              <Select5 value={values.stress_level} onChange={(value) => updateField("stress_level", value)} />
            </Field>
            <Field label="Work or study pressure">
              <Select5 value={values.work_study_pressure} onChange={(value) => updateField("work_study_pressure", value)} />
            </Field>
            <Field label="Screen time per day (hours)">
              <Input value={values.screen_time_per_day} onChange={(event) => updateField("screen_time_per_day", event.target.value)} placeholder="e.g., 8" inputMode="decimal" />
            </Field>
          </Section>

          <Section title="Habits">
            <Field label="Smoking">
              <YesNo value={values.smoking} onChange={(value) => updateField("smoking", value)} />
            </Field>
            <Field label="Alcohol consumption">
              <select className={selectClassName} value={values.alcohol_consumption} onChange={(event) => updateField("alcohol_consumption", event.target.value)}>
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="regular">Regular</option>
                <option value="high">High</option>
              </select>
            </Field>
          </Section>

          <Section title="Medical Background">
            <Field label="Family history of diabetes">
              <YesNo value={values.family_history_of_diabetes} onChange={(value) => updateField("family_history_of_diabetes", value)} />
            </Field>
            <Field label="Previous diagnosis of diabetes">
              <YesNo value={values.previous_diagnosis_of_diabetes} onChange={(value) => updateField("previous_diagnosis_of_diabetes", value)} />
            </Field>
            <Field label="History of prediabetes">
              <YesNo value={values.history_of_prediabetes} onChange={(value) => updateField("history_of_prediabetes", value)} />
            </Field>
            <Field label="Hypertension">
              <YesNo value={values.hypertension} onChange={(value) => updateField("hypertension", value)} />
            </Field>
            <Field label="Obesity">
              <YesNo value={values.obesity} onChange={(value) => updateField("obesity", value)} />
            </Field>
            <Field label="PCOS (if applicable)">
              <select className={selectClassName} value={values.pcos} onChange={(event) => updateField("pcos", event.target.value)}>
                <option value="">Select</option>
                <option value="not_applicable">Not applicable</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Field>
            <Field className="md:col-span-2" label="Current medications">
              <textarea
                className="min-h-24 w-full rounded-2xl border border-white/70 bg-white/78 px-4 py-3 text-sm shadow-[0_12px_30px_rgba(117,145,167,0.08)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/12 dark:bg-white/6 dark:shadow-[0_12px_30px_rgba(4,13,22,0.45)]"
                placeholder="List medication names or classes"
                value={values.current_medications}
                onChange={(event) => updateField("current_medications", event.target.value)}
              />
            </Field>
          </Section>

          <Section title="Additional Health Metrics">
            <Field label="Resting heart rate (bpm)">
              <Input value={values.resting_heart_rate} onChange={(event) => updateField("resting_heart_rate", event.target.value)} inputMode="numeric" placeholder="e.g., 72" />
            </Field>
            <Field label="Waist circumference (cm)">
              <Input value={values.waist_circumference} onChange={(event) => updateField("waist_circumference", event.target.value)} inputMode="decimal" placeholder="e.g., 90" />
            </Field>
            <Field label="Cholesterol level (mg/dL)">
              <Input value={values.cholesterol_level} onChange={(event) => updateField("cholesterol_level", event.target.value)} inputMode="decimal" placeholder="e.g., 188" />
            </Field>
            <Field label="Triglycerides (mg/dL)">
              <Input value={values.triglycerides} onChange={(event) => updateField("triglycerides", event.target.value)} inputMode="decimal" placeholder="e.g., 145" />
            </Field>
          </Section>

          <Section title="Symptoms">
            <Field label="Frequent thirst">
              <YesNo value={values.frequent_thirst} onChange={(value) => updateField("frequent_thirst", value)} />
            </Field>
            <Field label="Frequent urination">
              <YesNo value={values.frequent_urination} onChange={(value) => updateField("frequent_urination", value)} />
            </Field>
            <Field label="Fatigue level">
              <Select5 value={values.fatigue_level} onChange={(value) => updateField("fatigue_level", value)} />
            </Field>
            <Field label="Unexplained weight changes">
              <YesNo value={values.unexplained_weight_changes} onChange={(value) => updateField("unexplained_weight_changes", value)} />
            </Field>
            <Field label="Blurred vision">
              <YesNo value={values.blurred_vision} onChange={(value) => updateField("blurred_vision", value)} />
            </Field>
          </Section>

          <Section title="Daily Routine Patterns">
            <Field label="Meal timing consistency">
              <Select5 value={values.meal_timing_consistency} onChange={(value) => updateField("meal_timing_consistency", value)} />
            </Field>
            <Field label="Late-night eating">
              <select className={selectClassName} value={values.late_night_eating} onChange={(event) => updateField("late_night_eating", event.target.value)}>
                <option value="">Select</option>
                <option value="rarely">Rarely</option>
                <option value="sometimes">Sometimes</option>
                <option value="often">Often</option>
                <option value="daily">Daily</option>
              </select>
            </Field>
            <Field label="Daily sedentary hours">
              <Input value={values.daily_sedentary_hours} onChange={(event) => updateField("daily_sedentary_hours", event.target.value)} inputMode="decimal" placeholder="e.g., 7" />
            </Field>
          </Section>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-white/65 bg-white/65 p-4 dark:border-white/12 dark:bg-white/6">
            <p className="text-sm text-muted-foreground">{savedAt ? `Saved locally at ${savedAt}` : "Save this profile to keep your advanced responses on this device."}</p>
            <Button type="submit" size="lg">
              <CheckCircle2 className="h-4 w-4" />
              Save advanced profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">{title}</h3>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function YesNo({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select className={selectClassName} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select</option>
      <option value="no">No</option>
      <option value="yes">Yes</option>
    </select>
  );
}

function Select5({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select className={selectClassName} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">Select</option>
      <option value="very_low">Very low</option>
      <option value="low">Low</option>
      <option value="moderate">Moderate</option>
      <option value="high">High</option>
      <option value="very_high">Very high</option>
    </select>
  );
}
