export function safePath(path: string | null | undefined, fallback = "/redirect") {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  const clean = path.split("?")[0];
  if (clean === "/login" || clean === "/register") return fallback;
  return path;
}