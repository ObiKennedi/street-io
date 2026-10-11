// File: components/dashboard/RecentActivity.tsx
import Link from "next/link";

import type { ReadingActivity } from "@/lib/dashboard";
import { CategoryIcon } from "./CategoryIcon";

function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

export function RecentActivity({ items }: { items: ReadingActivity[] }) {
  return (
    <section className="dash-section" aria-labelledby="dash-activity-title">
      <div className="dash-section__head">
        <h2 id="dash-activity-title" className="dash-section__title">
          Recent reading
        </h2>
        {items.length > 0 && (
          <Link href="/dashboard/history" className="dash-section__link">
            View all
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <div className="dash-activity dash-activity--empty">
          <span className="dash-activity__empty-icon">
            <CategoryIcon name="book" size={28} />
          </span>
          <p className="dash-activity__empty-title">Nothing read yet</p>
          <p className="dash-activity__empty-text">
            Articles you open will show up here so you can pick up where you left off.
          </p>
          <Link href="/new" className="dash-activity__empty-cta">
            Explore latest articles
          </Link>
        </div>
      ) : (
        <ul className="dash-activity">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="dash-activity__row">
                <span className="dash-activity__body">
                  <span className="dash-activity__meta">
                    {item.category} · {timeAgo(item.readAt)}
                  </span>
                  <span className="dash-activity__title">{item.title}</span>
                  <span
                    className="dash-activity__progress"
                    role="progressbar"
                    aria-valuenow={item.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.progress}% read`}
                  >
                    <span style={{ width: `${item.progress}%` }} />
                  </span>
                </span>
                <span className="dash-activity__state">
                  {item.progress >= 100 ? "Read" : "Continue"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}