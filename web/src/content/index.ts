import { en } from "./en";
import { tr } from "./tr";
import type { Copy, Lang } from "./types";

export const INSTALL_COMMAND =
  "/plugin install console-band --marketplace Derinbay-Labs/console-band";
export const REPO_URL = "https://github.com/Derinbay-Labs/console-band";
export const GIT_COMMANDS = [
  "git rev-parse --abbrev-ref HEAD",
  "git log -1 --format=%ct",
  "git status --porcelain",
] as const;

const COPY: Record<Lang, Copy> = { en, tr };
export const copyFor = (lang: Lang): Copy => COPY[lang];
