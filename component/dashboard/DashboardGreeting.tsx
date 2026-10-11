// File: components/dashboard/DashboardGreeting.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CategoryIcon } from "./CategoryIcon";

type DashboardGreetingProps = {
  name: string;
  image?: string | null;
  unreadAlerts?: number;
};

function greetingFor(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting({ name, image, unreadAlerts = 0 }: DashboardGreetingProps) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  // Uses the reader's own clock, so it's set after hydration.
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    setGreeting(greetingFor(new Date().getHours()));
  }, []);

  return (
    <header className="dash-greeting">
      <Link href="/dashboard/profile" className="dash-greeting__avatar" aria-label="Your profile">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>
        )}
      </Link>

      <div className="dash-greeting__text">
        <h1 className="dash-greeting__title">
          {greeting}, {firstName}
        </h1>
        <p className="dash-greeting__subtitle">Your streetio dashboard</p>
      </div>

      <Link
        href="/dashboard/alerts"
        className="dash-greeting__alerts"
        aria-label={unreadAlerts ? `Alerts, ${unreadAlerts} unread` : "Alerts"}
      >
        <CategoryIcon name="bell" size={22} />
        {unreadAlerts > 0 && <span className="dash-greeting__dot" aria-hidden="true" />}
      </Link>
    </header>
  );
}