export type Lang = "en" | "tr";
export type IconName =
  | "ext"
  | "check"
  | "copy"
  | "terminal"
  | "plus"
  | "play"
  | "globe"
  | "eye"
  | "key"
  | "branch"
  | "users"
  | "shield"
  | "log"
  | "cols"
  | "arrow";
export type SceneId = "session" | "usage" | "work" | "place";

export interface Copy {
  lang: Lang;
  /** `<title>`, ≤ 60 characters (docs/seo/landing.md §3). */
  title: string;
  /** Meta, OG and Twitter description, ≤ 155 characters. */
  description: string;
  /** `og:image:alt` and `twitter:image:alt`. */
  ogAlt: string;
  skip: string;
  nav: [string, string][];
  navcta: string;
  gh: string;
  cmdLabel: string;
  copy: string;
  copied: string;
  copyFail: string;
  cmdNote: string;
  ghBtn: string;
  synthetic: string;
  srBand: string;
  scenesLabel: string;
  specH: string;
  spec: [string, string][];
  h1: string;
  lead: string;
  /** [id, name, description] */
  scenes: [SceneId, string, string][];
  /** Per scene: [highlight keys, label, text] */
  notes: Record<SceneId, [string, string, string][]>;
  featH: string;
  featP: string;
  feats: [string, string][];
  /** [icon, heading, text] */
  also: [IconName, string, string][];
  /** [glyph, tone class, word] */
  gl: [string, string, string][];
  howH: string;
  howP: string;
  steps: [string, string][];
  stepChips: string[];
  trustH: string;
  trustP: string;
  ledger: [IconName, string, string][];
  faqH: string;
  /** Answers mark inline code with backticks. */
  faq: [string, string][];
  finalH: string;
  finalP: string;
  footTag: string;
  footLinks: [string, string][];
  labs: string;
  labsSmall: string;
  copyright: string;
  footNote: string;
  footNav: string;
}
