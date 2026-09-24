import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Maximize, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TwitchPlayer } from "@/components/twitch-player";
import { getChannel } from "@/lib/twitch.functions";

export const Route = createFileRoute("/watch/$login")({
  loader: ({ params }) => getChannel({ data: { login: params.login } }),
  head: ({ loaderData }) => {
    const name = loaderData?.user?.display_name ?? "Stream";
    const title = `${name} live — LiveCast`;
    const desc = loaderData?.stream?.title ?? `Watch ${name} on LiveCast.`;
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
  const { login, user, stream } = Route.useLoaderData();
  const box = useRef<HTMLDivElement>(null);
  const [chat, setChat] = useState(true);
  const [host, setHost] = useState<string | null>(null);
  useEffect(() => setHost(window.location.hostname), []);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-3xl tracking-wider text-primary">LiveCast</Link>
          <Button asChild variant="outline" size="sm"><Link to="/">← Back to home</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className={`grid gap-4 ${chat ? "lg:grid-cols-[1fr_340px]" : ""}`}>
          <div>
            <div ref={box} className="aspect-video overflow-hidden rounded-lg border border-border bg-card">
              <TwitchPlayer channel={login} />
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {user?.profile_image_url && <img src={user.profile_image_url} alt="" className="h-12 w-12 rounded-full" />}
                <div>
                  <h1 className="text-3xl">{user?.display_name ?? login}</h1>
                  <p className="text-sm text-muted-foreground">
                    {stream ? `${stream.title} · ${stream.game_name} · ${stream.viewer_count.toLocaleString()} watching` : "Offline right now"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => box.current?.requestFullscreen?.()}><Maximize /> Fullscreen</Button>
                <Button size="sm" variant="outline" onClick={() => setChat((c) => !c)}><MessageSquare /> {chat ? "Hide chat" : "Show chat"}</Button>
                <Button asChild size="sm" variant="outline">
                  <a href={`https://twitch.tv/${login}`} target="_blank" rel="noreferrer noopener"><ExternalLink /> Twitch</a>
                </Button>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Stream by {user?.display_name ?? login}, broadcast on Twitch. All rights belong to the creator.</p>
          </div>
          {chat && host && (
            <iframe
              title="Chat"
              src={`https://www.twitch.tv/embed/${login}/chat?parent=${host}&darkpopout`}
              className="h-[70vh] w-full rounded-lg border border-border lg:h-auto lg:min-h-[500px]"
            />
          )}
        </div>
      </main>
    </div>
  );
}
