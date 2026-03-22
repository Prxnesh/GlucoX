"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, LoaderCircle, PencilLine } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { STORAGE_KEY, type LifestyleProfile } from "@/features/advanced/lifestyle-profile-form";

const emptyProfile: LifestyleProfile = {
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

const sections: Array<{
  title: string;
  fields: Array<{ key: keyof LifestyleProfile; label: string }>;
}> = [
  {
    title: "Lifestyle & Activity",
    fields: [
      { key: "physical_activity_level", label: "Physical activity level" },
      { key: "exercise_frequency", label: "Exercise frequency" },
      { key: "average_daily_step_count", label: "Average daily step count" },
      { key: "type_of_activity", label: "Type of activity" },
    ],
  },
  {
    title: "Diet & Nutrition",
    fields: [
      { key: "overall_diet_quality", label: "Overall diet quality" },
      { key: "sugar_intake", label: "Sugar intake" },
      { key: "junk_processed_food_frequency", label: "Junk/processed food frequency" },
      { key: "daily_water_intake", label: "Daily water intake" },
      { key: "fruit_vegetable_intake", label: "Fruit and vegetable intake" },
      { key: "sugary_drinks_per_week", label: "Sugary drinks per week" },
    ],
  },
  {
    title: "Sleep & Recovery",
    fields: [
      { key: "average_sleep_duration", label: "Average sleep duration" },
      { key: "sleep_quality", label: "Sleep quality" },
      { key: "sleep_consistency", label: "Sleep consistency" },
    ],
  },
  {
    title: "Stress & Mental Factors",
    fields: [
      { key: "stress_level", label: "Stress level" },
      { key: "work_study_pressure", label: "Work or study pressure" },
      { key: "screen_time_per_day", label: "Screen time per day" },
    ],
  },
  {
    title: "Habits",
    fields: [
      { key: "smoking", label: "Smoking" },
      { key: "alcohol_consumption", label: "Alcohol consumption" },
    ],
  },
  {
    title: "Medical Background",
    fields: [
      { key: "family_history_of_diabetes", label: "Family history of diabetes" },
      { key: "previous_diagnosis_of_diabetes", label: "Previous diagnosis of diabetes" },
      { key: "history_of_prediabetes", label: "History of prediabetes" },
      { key: "hypertension", label: "Hypertension" },
      { key: "obesity", label: "Obesity" },
      { key: "pcos", label: "PCOS" },
      { key: "current_medications", label: "Current medications" },
    ],
  },
  {
    title: "Additional Health Metrics",
    fields: [
      { key: "resting_heart_rate", label: "Resting heart rate" },
      { key: "waist_circumference", label: "Waist circumference" },
      { key: "cholesterol_level", label: "Cholesterol level" },
      { key: "triglycerides", label: "Triglycerides" },
    ],
  },
  {
    title: "Symptoms",
    fields: [
      { key: "frequent_thirst", label: "Frequent thirst" },
      { key: "frequent_urination", label: "Frequent urination" },
      { key: "fatigue_level", label: "Fatigue level" },
      { key: "unexplained_weight_changes", label: "Unexplained weight changes" },
      { key: "blurred_vision", label: "Blurred vision" },
    ],
  },
  {
    title: "Daily Routine Patterns",
    fields: [
      { key: "meal_timing_consistency", label: "Meal timing consistency" },
      { key: "late_night_eating", label: "Late-night eating" },
      { key: "daily_sedentary_hours", label: "Daily sedentary hours" },
    ],
  },
];

function normalize(value: string) {
  if (!value) return "Not provided";
  return value.replaceAll("_", " ");
}

export function ProfileView() {
  const router = useRouter();
  const { ready, token, user } = useAuth();
  const [profile, setProfile] = useState<LifestyleProfile>(emptyProfile);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<LifestyleProfile>;
        setProfile({ ...emptyProfile, ...parsed });
      }
    } catch {
      setProfile(emptyProfile);
    } finally {
      setLoaded(true);
    }
  }, [ready, token, router]);

  const filledCount = useMemo(
    () => Object.values(profile).filter((value) => value.trim().length > 0).length,
    [profile]
  );

  if (!ready || !loaded) {
    return (
      <div className="mx-auto flex min-h-[58vh] max-w-7xl items-center justify-center px-4 md:px-8">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-[var(--shadow-card)] dark:bg-white/10">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="dashboard-grid overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/50 px-6 py-8 shadow-[var(--shadow-soft)] dark:border-white/12 dark:bg-white/6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Profile</div>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {user ? `${user.name.split(" ")[0]}'s Health Profile` : "Health Profile"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base">
              This page shows all data collected from your Advanced assessment form.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral">{filledCount} / 37 fields filled</Badge>
            <Button asChild size="sm" variant="secondary">
              <Link href="/advanced">
                <PencilLine className="h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {filledCount === 0 ? (
        <section className="mt-8">
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto h-6 w-6 text-muted-foreground" />
              <h2 className="mt-3 font-[var(--font-display)] text-2xl font-semibold">No profile data saved yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">Complete the Advanced assessment once, then your collected data will appear here.</p>
              <div className="mt-5">
                <Button asChild>
                  <Link href="/advanced">Open Advanced Assessment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="mt-8 space-y-6">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="font-[var(--font-display)] text-2xl">{section.title}</CardTitle>
                <CardDescription>Collected entries from your latest saved assessment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {section.fields.map((field) => (
                    <div key={field.key} className="rounded-[1.2rem] border border-white/65 bg-white/70 p-4 dark:border-white/12 dark:bg-white/6">
                      <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{field.label}</div>
                      <div className="mt-2 text-sm font-medium text-foreground">{normalize(profile[field.key])}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </div>
  );
}
