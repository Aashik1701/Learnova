export type ThemeMode = "light" | "dark" | "system";

export interface UserSettings {
  profile: {
    name: string;
    bio: string;
  };
  appearance: {
    theme: ThemeMode;
    accent: string;
  };
  language: {
    ui: string;
    region: string;
  };
  notifications: {
    emailWeekly: boolean;
    emailReminders: boolean;
    inAppToasts: boolean;
  };
  study: {
    dailyMinutes: number;
    difficulty: "adaptive" | "easy" | "medium" | "hard";
    hints: boolean;
    retakesAllowed: boolean;
  };
  accessibility: {
    voiceEnabled: boolean;
    voiceRate: number;
    voicePitch: number;
    voiceVolume: number;
    fontScale: number;
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

const KEY = "learnova_settings_v1";

export const defaultSettings = (): UserSettings => ({
  profile: { name: localStorage.getItem("learner_name") || "Learner", bio: "" },
  appearance: { theme: "system", accent: "violet" },
  language: { ui: "en", region: "en-US" },
  notifications: { emailWeekly: true, emailReminders: true, inAppToasts: true },
  study: { dailyMinutes: 30, difficulty: "adaptive", hints: true, retakesAllowed: true },
  accessibility: { voiceEnabled: false, voiceRate: 1, voicePitch: 1, voiceVolume: 1, fontScale: 1, highContrast: false, reducedMotion: false },
});

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return { ...defaultSettings(), ...parsed, profile: { ...defaultSettings().profile, ...parsed.profile } };
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(s: UserSettings) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function applyTheme(theme: ThemeMode) {
  const resolveDark = () => {
    if (theme === "system") return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return theme === "dark";
  };
  const isDark = resolveDark();
  if (isDark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}
