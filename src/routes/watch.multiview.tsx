import { createFileRoute, Link } from "@tanstack/react-router";
import { memo, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TwitchPlayer } from "@/components/twitch-player";

type MultiviewSearch = { streams?: string };

export const Route = createFileRoute("/watch/multiview")({
  validateSearch: (s: Record<string, unknown>): MultiviewSearch => ({
    streams: typeof s["streams"] === "string" ? s["streams"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Multiview — LiveCast" },
      { name: "description", content: "Watch up to four Twitch streamers at once." },
      { property: "og:title", content: "Multiview — LiveCast" },
      { property: "og:description", content: "Watch up to four Twitch streamers at once." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Multiview,
});

const Tile = memo(function Tile({ login, audio, onAudio, onRemove }: { login: string; audio: boolean; onAudio: () => void; onRemove: () => void }) {
  return (
    <section className={`min-w-0 rounded-lg border-2 p-1 ${audio ? "border-primary" : "border-transparent"}`}>
      <div className="mb-1 flex items-center justify-between gap-2 px-1">
        <h2 className="truncate text-xl">{login}</h2>
        <div className="flex gap-1">
          <Button size="sm" variant={audio ? "default" : "outline"} onClick={onAudio}>
            {audio ? <Volume2 /> : <VolumeX />} {audio ? "Audio on" : "Use audio"}
          </Button>
          <Button size="icon" variant="ghost" onClick={onRemove} aria-label={`Remove ${login}`}><X /></Button>
        </div>
      </div>
      <div className="aspect-video overflow-hidden rounded-md bg-card">
        <TwitchPlayer channel={login} muted={!audio} />
      </div>
    </section>
  );
});

function Multiview() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const logins = (search.streams ?? "").split(",").filter((l) => /^[a-zA-Z0-9_]{1,25}$/.test(l)).slice(0, 4);
  const [audio, setAudio] = useState(logins[0] ?? "");
  const [add, setAdd] = useState("");

  const setList = (list: string[]) => navigate({ search: { streams: list.join(",") || undefined }, replace: true });

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-3xl tracking-wider text-primary">LiveCast</Link>
          <Button asChild variant="outline" size="sm"><Link to="/">← Choose streams</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl">Multiview</h1>
            <p className="mt-1 text-sm text-muted-foreground">{logins.length} of 4 · only the highlighted stream plays sound</p>
          </div>
          {logins.length < 4 && (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const l = add.trim().toLowerCase(); if (/^[a-z0-9_]{1,25}$/.test(l) && !logins.includes(l)) { setList([...logins, l]); if (!audio) setAudio(l); } setAdd(""); }}>
              <input value={add} onChange={(e) => setAdd(e.target.value)} placeholder="Add channel name" className="h-9 rounded-md border border-border bg-card px-3 text-sm" />
              <Button type="submit" size="sm">Add</Button>
            </form>
          )}
        </div>
        {logins.length ? (
          <div className={`grid gap-3 ${logins.length > 1 ? "lg:grid-cols-2" : ""}`}>
            {logins.map((l) => (
              <Tile key={l} login={l} audio={audio === l} onAudio={() => setAudio(l)} onRemove={() => setList(logins.filter((x) => x !== l))} />
            ))}
          </div>
        ) : (
          <div className="border-t border-border py-10 text-center">
            <p className="text-muted-foreground">Choose up to four streamers to begin.</p>
            <Button asChild className="mt-4"><Link to="/">Choose streams</Link></Button>
          </div>
        )}
      </main>
    </div>
  );
}
