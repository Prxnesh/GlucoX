"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUp,
  Bot,
  LoaderCircle,
  Lock,
  Orbit,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { askHealthAssistant } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { HealthAssistantMessage } from "@/lib/types";
import {
  countFilledLifestyleProfileFields,
  getFilledLifestyleProfile,
  loadLifestyleProfile,
} from "@/features/advanced/profile-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const starterPrompts = [
  "What patterns stand out in my recent risk history?",
  "How should I interpret my latest glucose and HbA1c values together?",
  "Based on my profile, what should I focus on first this week?",
  "What questions should I ask my doctor at my next visit?",
];

const initialAssistantMessage: HealthAssistantMessage = {
  role: "assistant",
  content:
    "Ask anything about your saved risk scores, lab reports, or routine patterns. I’ll answer using your GlucoX history and keep the guidance practical.",
};

export function HealthAssistantView() {
  const router = useRouter();
  const { ready, token, user } = useAuth();
  const messageListRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<HealthAssistantMessage[]>([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [contextSummary, setContextSummary] = useState<string[]>([]);
  const [resolvedModel, setResolvedModel] = useState<string>("Local Ollama");
  const [isPending, setIsPending] = useState(false);
  const [profileFieldCount, setProfileFieldCount] = useState(0);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    const profile = loadLifestyleProfile();
    setProfileFieldCount(countFilledLifestyleProfileFields(profile));
  }, [ready, token, router]);

  useEffect(() => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const suggestionPrompts = useMemo(() => starterPrompts, []);
  const displayName = user?.name ?? "You";
  const firstName = user?.name.split(" ")[0] ?? "there";

  const sendPrompt = async (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || !token) {
      return;
    }

    const nextUserMessage: HealthAssistantMessage = { role: "user", content: trimmedPrompt };
    const nextMessages = [...messages, nextUserMessage];
    const lifestyleProfile = Object.fromEntries(getFilledLifestyleProfile(loadLifestyleProfile()));

    setMessages(nextMessages);
    setInput("");
    setError(null);
    setIsPending(true);

    try {
      const response = await askHealthAssistant(token, {
        messages: nextMessages,
        lifestyle_profile: lifestyleProfile,
      });

      setMessages((current) => [...current, response.message]);
      setContextSummary(response.context_summary);
      setResolvedModel(response.model);
    } catch (chatError) {
      setError(chatError instanceof Error ? chatError.message : "Unable to reach the health assistant.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPending) return;

    startTransition(() => {
      void sendPrompt(input);
    });
  };

  const clearConversation = () => {
    setMessages([initialAssistantMessage]);
    setContextSummary([]);
    setError(null);
  };

  if (!ready || !token) {
    return (
      <div className="mx-auto flex min-h-[58vh] max-w-7xl items-center justify-center px-4 md:px-8">
        <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 shadow-[var(--shadow-card)] dark:bg-white/10">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Preparing your assistant...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8">
      <section className="overflow-hidden rounded-[2.8rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(240,248,255,0.88))] px-6 py-8 shadow-[var(--shadow-soft)] dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(16,25,36,0.96),rgba(10,17,26,0.92))]">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2 text-sm font-medium text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/12 dark:text-sky-200">
              <Sparkles className="h-4 w-4" />
              Personalized health assistant
            </div>
            <h1 className="mt-5 font-[var(--font-display)] text-4xl font-semibold tracking-tight text-balance md:text-6xl">
              A calmer way to ask health questions about your own data.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {firstName}, this assistant reads from your GlucoX timeline, OCR lab reports, and any saved lifestyle profile on this device before answering.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3">
            <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Model</div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <Orbit className="h-4 w-4 text-sky-500" />
                {resolvedModel}
              </div>
            </div>
            <div className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 dark:border-white/10 dark:bg-white/6">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Profile context</div>
              <div className="mt-2 text-sm font-semibold">{profileFieldCount} saved lifestyle fields</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Update from the <Link className="underline-offset-4 hover:underline" href="/advanced">Advanced page</Link>.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {suggestionPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-sky-200 hover:bg-sky-50 dark:border-white/10 dark:bg-white/8 dark:hover:border-sky-500/25 dark:hover:bg-sky-500/12"
              onClick={() => {
                if (!isPending) {
                  void sendPrompt(prompt);
                }
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-white/60 bg-white/55 dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="font-[var(--font-display)] text-2xl">Health conversation</CardTitle>
                <CardDescription>
                  Personalized answers grounded in your saved records, not a generic one-size-fits-all bot.
                </CardDescription>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={clearConversation}>
                <RefreshCcw className="h-4 w-4" />
                Reset chat
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div ref={messageListRef} className="max-h-[720px] space-y-5 overflow-y-auto px-5 py-5">
              {messages.map((message, index) => (
                <article
                  key={`${message.role}-${index}-${message.content.slice(0, 24)}`}
                  className={cn(
                    "rounded-[2rem] border p-5 shadow-[0_20px_42px_rgba(86,116,136,0.08)]",
                    message.role === "assistant"
                      ? "border-white/70 bg-white/86 dark:border-white/10 dark:bg-white/6"
                      : "ml-auto max-w-[90%] border-sky-100 bg-[linear-gradient(135deg,#edf6ff_0%,#e9fbf7_100%)] dark:border-sky-500/20 dark:bg-[linear-gradient(135deg,rgba(33,51,68,0.95),rgba(19,53,53,0.92))]"
                  )}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-2xl",
                        message.role === "assistant"
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-500/14 dark:text-sky-200"
                          : "bg-white/80 text-slate-700 dark:bg-white/10 dark:text-slate-100"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-semibold">{displayName.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold">
                      {message.role === "assistant" ? "GlucoX Guide" : displayName}
                    </div>
                  </div>
                  <div className="space-y-3 text-sm leading-7 text-foreground/92">
                    {message.content.split("\n").filter(Boolean).map((paragraph, paragraphIndex) => (
                      <p key={`${index}-${paragraphIndex}`}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ))}

              {isPending ? (
                <div className="rounded-[2rem] border border-white/70 bg-white/86 p-5 dark:border-white/10 dark:bg-white/6">
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
                    Thinking through your history...
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-white/60 bg-white/55 px-5 py-5 dark:border-white/10 dark:bg-white/5">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about trends, lab values, next steps, lifestyle tradeoffs, or questions for your clinician..."
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" />
                    Uses your signed-in history and your device’s saved lifestyle profile.
                  </div>
                  <Button disabled={isPending || !input.trim()} size="lg">
                    Send question
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              {error ? (
                <div className="mt-4 rounded-[1.4rem] bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/18 dark:text-rose-200">
                  {error}
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-2xl">Context being used</CardTitle>
              <CardDescription>
                This refreshes after each reply so you can see what the assistant is grounding itself on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {contextSummary.length ? (
                contextSummary.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.3rem] border border-white/65 bg-white/70 px-4 py-4 text-sm leading-6 dark:border-white/10 dark:bg-white/6"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50/70 p-5 text-sm text-muted-foreground dark:border-white/12 dark:bg-white/6">
                  Send your first question and I’ll show the personalized context I used from your timeline.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-[var(--font-display)] text-2xl">Best questions to ask</CardTitle>
              <CardDescription>Prompt styles that make the assistant most useful.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Ask for interpretation: “What do my last two readings suggest together?”",
                "Ask for prioritization: “Which one habit would likely matter most first?”",
                "Ask for preparation: “What follow-up tests or doctor questions make sense?”",
                "Ask for trend reading: “Is my risk getting better, worse, or just noisy?”",
              ].map((item) => (
                <div key={item} className="rounded-[1.3rem] bg-white/70 px-4 py-4 text-sm leading-6 dark:bg-white/6">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
