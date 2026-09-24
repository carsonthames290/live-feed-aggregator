import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, MonitorUp, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listStreams, thumb, type Stream } from "@/lib/twitch.functions";

type HomeSearch = { game?: string | undefined; q?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): HomeSearch => ({
    game: typeof s["game"] === "string" ? s["game"] : undefined,
    q: typeof s["q"] === "string" ? s["q"] : undefined,
  }),
  loaderDeps: ({ search }) => ({ game: search.game, q: search.q }),
  loader: ({ deps }) => listStreams({ data: { gameId: deps.game, query: deps.q } }),
  head: () => ({
    meta: [
      { title: "LiveCast — Watch Twitch Streamers Live" },
      { name: "description", content: "Browse live Twitch streamers, search channels, and watch up to four at once in Multiview." },
      { property: "og:title", content: "LiveCast — Watch Twitch Streamers Live" },
      { property: "og:description", content: "Live Twitch streams, categories, and a four-stream Multiview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);
}

function StreamCard({ s, selected, onToggle }: { s: Stream; selected: boolean; onToggle: () => void }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary">
      <Link to="/watch/$login" params={{ login: s.user_login }} preload="intent" className="block">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <img src={thumb(s.thumbnail_url)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-sm bg-live px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-foreground" /> Live
          </span>
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-sm bg-card/90 px-2 py-0.5 text-xs font-semibold text-foreground">
            <Users className="h-3 w-3" /> {fmt(s.viewer_count)}
          </span>
        </div>
        <div className="p-3 pb-2">
          <h3 className="text-lg leading-tight">{s.user_name}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-foreground/80" title={s.title}>{s.title}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.game_name || "Just Chatting"}</p>
        </div>
      </Link>
      <div className="px-3 pb-3">
        <Button type="button" variant={selected ? "default" : "outline"} size="sm" onClick={onToggle} className="w-full">
          {selected ? <Check /> : <MonitorUp />}
          {selected ? "Added to Multiview" : "Add to Multiview"}
        </Button>
      </div>
    </article>
  );
}

function Home() {
  const data = Route.useLoaderData() as Partial<{ streams: Stream[]; games: { id: string; name: string }[] }> | undefined;
  const streams = Array.isArray(data?.streams) ? data.streams : [];
  const games = Array.isArray(data?.games) ? data.games : [];
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [q, setQ] = useState(search.q ?? "");
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (login: string) =>
    setSelected((c) => (c.includes(login) ? c.filter((x) => x !== login) : c.length < 4 ? [...c, login] : c));

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link to="/" search={{}} className="font-display text-3xl tracking-wider text-primary">LiveCast</Link>
          <form
            className="flex max-w-sm flex-1 items-center gap-2"
            onSubmit={(e) => { e.preventDefault(); navigate({ search: { q: q.trim() || undefined } }); }}
          >
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search streamers…" aria-label="Search streamers" />
            <Button type="submit" size="icon" variant="outline" aria-label="Search"><Search /></Button>
          </form>
          {selected.length > 0 && (
            <Button asChild size="sm">
              <Link to="/watch/multiview" search={{ streams: selected.join(",") }}>
                <MonitorUp /> Multiview {selected.length}/4
              </Link>
            </Button>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl sm:text-5xl">Your streamers. One place.</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">Live channels from Twitch, updated every time you load the page.</p>

        <div className="-mx-1 mt-6 flex gap-2 overflow-x-auto pb-2">
          <Link to="/" search={{}} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${!search.game && !search.q ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary"}`}>All</Link>
          {games.map((g) => (
            <Link key={g.id} to="/" search={{ game: g.id }} className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${search.game === g.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"}`}>
              {g.name}
            </Link>
          ))}
        </div>

        <h2 className="mt-8 text-2xl">{search.q ? `Results for “${search.q}”` : "Live now"}</h2>
        {streams.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No live streamers found.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {streams.map((s) => (
              <StreamCard key={s.id} s={s} selected={selected.includes(s.user_login)} onToggle={() => toggle(s.user_login)} />
            ))}
          </div>
        )}
      </section>

      <footer className="mt-10 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted-foreground">
          <p>
            All streams play through the official Twitch player and belong to their creators. Listings provided by{" "}
            <a href="https://twitch.tv" target="_blank" rel="noreferrer noopener" className="text-primary underline">Twitch</a>. LiveCast is not affiliated with Twitch.
          </p>
          <p className="mt-3"><Link to="/health" className="text-primary underline">System health</Link></p>
        </div>
      </footer>
    </div>
  );
}
