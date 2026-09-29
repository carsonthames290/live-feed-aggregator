export type Channel = { login: string; name: string; tag: string };

/** Curated, editable list. Runs fully in the browser — no API keys needed. */
export const FEATURED: Channel[] = [
  { login: "kaicenat", name: "Kai Cenat", tag: "Just Chatting" },
  { login: "jynxzi", name: "Jynxzi", tag: "Rainbow Six" },
  { login: "xqc", name: "xQc", tag: "Variety" },
  { login: "caseoh_", name: "CaseOh", tag: "Variety" },
  { login: "ninja", name: "Ninja", tag: "Fortnite" },
  { login: "shroud", name: "shroud", tag: "FPS" },
  { login: "pokimane", name: "Pokimane", tag: "Just Chatting" },
  { login: "tarik", name: "tarik", tag: "Valorant" },
  { login: "summit1g", name: "summit1g", tag: "Variety" },
  { login: "hasanabi", name: "HasanAbi", tag: "Just Chatting" },
  { login: "ibai", name: "Ibai", tag: "Español" },
  { login: "auronplay", name: "AuronPlay", tag: "Español" },
  { login: "gaules", name: "Gaules", tag: "CS2" },
  { login: "loud_coringa", name: "Loud Coringa", tag: "Português" },
  { login: "tfue", name: "Tfue", tag: "Variety" },
  { login: "sodapoppin", name: "Sodapoppin", tag: "Variety" },
  { login: "lirik", name: "LIRIK", tag: "Variety" },
  { login: "timthetatman", name: "TimTheTatman", tag: "Variety" },
  { login: "riotgames", name: "Riot Games", tag: "Esports" },
  { login: "esl_csgo", name: "ESL CS", tag: "Esports" },
  { login: "valorant", name: "VALORANT", tag: "Esports" },
  { login: "nickeh30", name: "Nickeh30", tag: "Fortnite" },
  { login: "clix", name: "Clix", tag: "Fortnite" },
  { login: "stableronaldo", name: "Stable Ronaldo", tag: "Variety" },
];

export const TAGS = ["All", ...Array.from(new Set(FEATURED.map((c) => c.tag)))];

export const isValidLogin = (l: string) => /^[a-zA-Z0-9_]{1,25}$/.test(l);

const KEY = "livecast:favorites";

export function readFavorites(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string" && isValidLogin(x)) : [];
  } catch {
    return [];
  }
}

export function writeFavorites(list: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable */
  }
}

export function previewImage(login: string) {
  return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${login.toLowerCase()}-440x248.jpg`;
}
