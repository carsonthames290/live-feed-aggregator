import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { twitch } from "./twitch.server";

export type Stream = {
  id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  language: string;
};
export type Game = { id: string; name: string; box_art_url: string };

export function thumb(url: string, w = 440, h = 248) {
  return url.replace("{width}", String(w)).replace("{height}", String(h));
}

export const listStreams = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ gameId: z.string().max(40).optional(), query: z.string().max(80).optional() }).parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const gamesRes = await twitch<{ data: Game[] }>("games/top?first=12");
    let streams: Stream[] = [];
    if (data.query) {
      const s = await twitch<{ data: { broadcaster_login: string; is_live: boolean }[] }>(
        `search/channels?live_only=true&first=40&query=${encodeURIComponent(data.query)}`,
      );
      const logins = s.data.filter((c) => c.is_live).slice(0, 40).map((c) => c.broadcaster_login);
      if (logins.length) {
        const r = await twitch<{ data: Stream[] }>(
          `streams?first=40&${logins.map((l) => `user_login=${encodeURIComponent(l)}`).join("&")}`,
        );
        streams = r.data.sort((a, b) => b.viewer_count - a.viewer_count);
      }
    } else {
      const r = await twitch<{ data: Stream[] }>(
        `streams?first=48${data.gameId ? `&game_id=${encodeURIComponent(data.gameId)}` : ""}`,
      );
      streams = r.data;
    }
    return { streams, games: gamesRes.data };
  });

export const getChannel = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ login: z.string().regex(/^[a-zA-Z0-9_]{1,25}$/) }).parse(d))
  .handler(async ({ data }) => {
    const [u, s] = await Promise.all([
      twitch<{ data: { display_name: string; description: string; profile_image_url: string }[] }>(
        `users?login=${data.login}`,
      ),
      twitch<{ data: Stream[] }>(`streams?user_login=${data.login}`),
    ]);
    return { login: data.login.toLowerCase(), user: u.data[0] ?? null, stream: s.data[0] ?? null };
  });

export async function runHealthCheck() {
  const started = Date.now();
  const checks: { name: string; ok: boolean; detail: string }[] = [];
  try {
    const r = await twitch<{ data: Stream[] }>("streams?first=5");
    checks.push({ name: "Twitch live listings", ok: r.data.length > 0, detail: `${r.data.length} streams returned` });
  } catch (e) {
    checks.push({ name: "Twitch live listings", ok: false, detail: String(e) });
  }
  try {
    const r = await twitch<{ data: Game[] }>("games/top?first=3");
    checks.push({ name: "Twitch categories", ok: r.data.length > 0, detail: `${r.data.length} categories` });
  } catch (e) {
    checks.push({ name: "Twitch categories", ok: false, detail: String(e) });
  }
  return { ok: checks.every((c) => c.ok), checkedAt: new Date().toISOString(), ms: Date.now() - started, checks };
}

export const healthCheck = createServerFn({ method: "GET" }).handler(() => runHealthCheck());
