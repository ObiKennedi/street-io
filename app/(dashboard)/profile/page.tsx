// File: app/(dashboard)/profile/page.tsx
import { redirect } from "next/navigation";

export const instant = false;

export default function ProfileRedirect() {
  redirect("/dashboard/profile");
}
