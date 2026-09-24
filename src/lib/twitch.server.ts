const GATEWAY_URL = "https://connector-gateway.lovable.dev/twitch";

export async function twitch<T>(path: string): Promise<T> {
  const lovable = process.env["LOVABLE_API_KEY"];
  const key = process.env["TWITCH_API_KEY"];
  if (!lovable || !key) throw new Error("Twitch is not configured");
  const res = await fetch(`${GATEWAY_URL}/${path}`, {
    headers: { Authorization: `Bearer ${lovable}`, "X-Connection-Api-Key": key },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Twitch request failed [${res.status}]: ${body}`);
    throw new Error(`Twitch request failed [${res.status}]`);
  }
  return (await res.json()) as T;
}
