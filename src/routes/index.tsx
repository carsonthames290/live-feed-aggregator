import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, Heart, MonitorUp, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FEATURED,
  TAGS,
  isValidLogin,
  previewImage,
  readFavorites,
  writeFavorites,
  type Channel,
} from "@/lib/channels";

type HomeSearch = { tag?: string | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): HomeSearch => ({
    tag: typeof s["tag"] === "string" ? s["tag"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "LiveCast — Watch Twitch Streamers Live" },
      {
        name: "description",
        content: "Watch any Twitch streamer, save your favorite channels, and run up to four streams at once in Multiview.",
      },
      { property: "og:title", content: "LiveCast — Watch Twitch Streamers Live" },
      { property: "og:description", content: "Any Twitch channel, saved favorites, and a four-stream Multiview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function ChannelCard({
  c,
  selected,
  fav,
  onToggle,
  onFav,
}: {
  c: Channel;
  selected: boolean;
  fav: boolean;
  onToggle: () => void;
  onFav: () => void;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary">
      <Link to="/watch/$login" params={{ login: c.login }} preload="intent" className="block">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {broken ? (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="h-10 w-10 text-muted-foreground" />
            </div>
          ) : (
            <img
              src={previewImage(c.login)}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          )}
        </div>
        <div className="p-3 pb-2">
          <h3 className="text-lg leading-tight">{c.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{c.tag}</p>
        </div>
      </Link>
      <div className="flex gap-2 px-3 pb-3">
        <Button type="button" variant={selected ? "default" : "outline"} size="sm" onClick={onToggle} className="flex-1">
          {selected ? <Check /> : <MonitorUp />}
          {selected ? "Added" : "Multiview"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFav}
          aria-label={fav ? `Remove ${c.name} from favorites` : `Save ${c.name}`}
        >
          <Heart className={fav ? "fill-primary text-primary" : ""} />
        </Button>
      </div>
    </article>
  );
}

function Home() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => setFavorites(readFavorites()), []);

  const tag = search.tag ?? "All";

  const toggle = (login: string) =>
    setSelected((c) => (c.includes(login) ? c.filter((x) => x !== login) : c.length < 4 ? [...c, login] : c));

  const toggleFav = (login: string) =>
    setFavorites((c) => {
      const next = c.includes(login) ? c.filter((x) => x !== login) : [...c, login];
      writeFavorites(next);
      return next;
    });

  const list = useMemo(() => (tag === "All" ? FEATURED : FEATURED.filter((c) => c.tag === tag)), [tag]);

  const favChannels: Channel[] = favorites.map(
    (login) => FEATURED.find((c) => c.login === login) ?? { login, name: login, tag: "Saved" },
  );

  const goSearch = () => {
    const login = q.trim().toLowerCase().replace(/^.*twitch\.tv\//, "").replace(/[^a-z0-9_].*$/, "");
    if (isValidLogin(login)) navigate({ to: "/watch/$login", params: { login } });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" search={{}} className="font-display text-3xl tracking-wider text-primary">
            LiveCast
          </Link>
          <form
            className="flex min-w-[220px] max-w-sm flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              goSearch();
            }}
          >
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type any channel name…"
              aria-label="Watch a channel by name"
            />
            <Button type="submit" size="icon" variant="outline" aria-label="Watch">
              <Search />
            </Button>
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
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Type any Twitch channel name to watch it instantly, save the ones you like, or stack four at once.
        </p>

        {favChannels.length > 0 && (
          <>
            <h2 className="mt-8 text-2xl">Your channels</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favChannels.map((c) => (
                <ChannelCard
                  key={`fav-${c.login}`}
                  c={c}
                  fav
                  selected={selected.includes(c.login)}
                  onToggle={() => toggle(c.login)}
                  onFav={() => toggleFav(c.login)}
                />
              ))}
            </div>
          </>
        )}

        <div className="-mx-1 mt-8 flex gap-2 overflow-x-auto pb-2">
          {TAGS.map((t) => (
            <Link
              key={t}
              to="/"
              search={t === "All" ? {} : { tag: t }}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                tag === t
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>

        <h2 className="mt-6 text-2xl">Popular channels</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ChannelCard
              key={c.login}
              c={c}
              fav={favorites.includes(c.login)}
              selected={selected.includes(c.login)}
              onToggle={() => toggle(c.login)}
              onFav={() => toggleFav(c.login)}
            />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted-foreground">
          <p>
            All streams play through the official Twitch player and belong to their creators. Powered by{" "}
            <a href="https://twitch.tv" target="_blank" rel="noreferrer noopener" className="text-primary underline">
              Twitch
            </a>
            . LiveCast is not affiliated with Twitch.
          </p>
        </div>
      </footer>
    </div>
  );
}
