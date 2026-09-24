import { useEffect, useRef } from "react";

type TwitchPlayer = { setMuted: (m: boolean) => void; setVolume: (v: number) => void };
declare global {
  interface Window {
    Twitch?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => TwitchPlayer };
  }
}

let scriptPromise: Promise<void> | null = null;
function loadScript() {
  if (window.Twitch?.Player) return Promise.resolve();
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://player.twitch.tv/js/embed/v1.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Official Twitch player. Muting is changed through the player API, so switching audio never reloads the video. */
export function TwitchPlayer({ channel, muted = false }: { channel: string; muted?: boolean }) {
  const el = useRef<HTMLDivElement>(null);
  const player = useRef<TwitchPlayer | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;

  useEffect(() => {
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !el.current || !window.Twitch) return;
      el.current.innerHTML = "";
      player.current = new window.Twitch.Player(el.current, {
        channel,
        width: "100%",
        height: "100%",
        parent: [window.location.hostname],
        muted: mutedRef.current,
        autoplay: true,
      });
    });
    return () => {
      cancelled = true;
      player.current = null;
      if (el.current) el.current.innerHTML = "";
    };
  }, [channel]);

  useEffect(() => {
    player.current?.setMuted(muted);
    if (!muted) player.current?.setVolume(0.8);
  }, [muted]);

  return <div ref={el} className="h-full w-full [&_iframe]:h-full [&_iframe]:w-full" />;
}
