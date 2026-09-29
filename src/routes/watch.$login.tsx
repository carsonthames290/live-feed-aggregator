import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Maximize, MessageSquare, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTwitchParents, TwitchPlayer } from "@/components/twitch-player";
import { FEATURED, readFavorites, writeFavorites } from "@/lib/channels";

export const Route = createFileRoute("/watch/$login")({
  head: ({ params }) => {
    const name = FEATURED.find((c) => c.login === params.login.toLowerCase())?.name ?? params.login;
    const title = `${name} live — LiveCast`;
    const desc = `Watch ${name} live on LiveCast, with chat and four-stream Multiview.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "video.other" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Watch,
});

function Watch() {
  const { login: raw } = Route.useParams();
  const login = raw.toLowerCase();
  const name = FEATURED.find((c) => c.login === login)?.name ?? raw;
  const box = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState(true);
  const [chatParents, setChatParents] = useState<string[]>([]);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setChatParents(getTwitchParents());
    setFav(readFavorites().includes(login));
  }, [login]);

  const toggleFav = () => {
    const current = readFavorites();
    const next = current.includes(login) ? current.filter((x) => x !== login) : [...current, login];
    writeFavorites(next);
    setFav(next.includes(login));
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4">
          <Link to="/" search={{}} className="font-display text-3xl tracking-wider text-primary">
            LiveCast
          </Link>
          <Button asChild variant="outline" size="sm">
            <Link to="/" search={{}}>← Back to home</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className={`grid gap-4 ${chat ? "lg:grid-cols-[1fr_340px]" : ""}`}>
          <div>
            <div ref={box} className="aspect-video overflow-hidden rounded-lg border border-border bg-card">
              <TwitchPlayer channel={login} />
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl">{name}</h1>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={fav ? "default" : "outline"} onClick={toggleFav}>
                  <Heart className={fav ? "fill-current" : ""} /> {fav ? "Saved" : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => box.current?.requestFullscreen?.()}>
                  <Maximize /> Fullscreen
                </Button>
                <Button size="sm" variant="outline" onClick={() => setChat((c) => !c)}>
                  <MessageSquare /> {chat ? "Hide chat" : "Show chat"}
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`https://twitch.tv/${login}`} target="_blank" rel="noreferrer noopener">
                    <ExternalLink /> Twitch
                  </a>
                </Button>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Stream by {name}, broadcast on Twitch. All rights belong to the creator.
            </p>
          </div>
          {chat && chatParents.length > 0 && (
            <iframe
              title="Chat"
              src={`https://www.twitch.tv/embed/${login}/chat?${chatParents
                .map((parent) => `parent=${encodeURIComponent(parent)}`)
                .join("&")}&darkpopout`}
              className="h-[70vh] w-full rounded-lg border border-border lg:h-auto lg:min-h-[500px]"
            />
          )}
        </div>
      </main>
    </div>
  );
}
