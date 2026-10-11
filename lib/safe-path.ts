export function safePath(path: string | null | undefined, fallback = "/dashboard") {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  const clean = path.split("?")[0];
  if (clean === "/login" || clean === "/register" || clean === "/redirect") return fallback;
  return path;
}