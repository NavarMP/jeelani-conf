export function constructOgImageUrl(
  type: "default" | "speaker" | "session" | "register" | "gallery",
  params: Record<string, string | undefined>
): string {
  const url = new URL("/api/og", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  
  url.searchParams.set("type", type);
  
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  
  return url.toString();
}

// Function to truncate text nicely for images
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}
