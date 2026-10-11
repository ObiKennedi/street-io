// File: component/dashboard/CategoryGrid.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { dashboardCategories, type DashboardCategory } from "./categories.config";
import { CategoryIcon } from "./CategoryIcon";

type CategoryGridProps = {
  title?: string;
  categories?: DashboardCategory[];
};

export function CategoryGrid({
  title = "Categories",
  categories = dashboardCategories,
}: CategoryGridProps) {
  const [showAll, setShowAll] = useState(false);

  // Display only first 5 categories initially, expand all when toggled
  const displayedCategories = showAll ? categories : categories.slice(0, 5);

  return (
    <section className="dash-section" aria-labelledby="dash-categories-title">
      <div className="dash-section__head">
        <h2 id="dash-categories-title" className="dash-section__title">
          {title}
        </h2>
        <Link href="/explore" className="dash-section__link">
          All topics
        </Link>
      </div>

      <ul className="dash-categories">
        {displayedCategories.map((category) => (
          <li key={category.slug} className="dash-categories__item">
            <Link
              href={category.href ?? `/category/${category.slug}`}
              className="dash-categories__card"
            >
              <span className="dash-categories__icon">
                <CategoryIcon name={category.icon} size={20} />
              </span>
              <span className="dash-categories__label">{category.label}</span>
              {category.isNew && <span className="dash-categories__badge">New</span>}
              <span className="dash-categories__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {categories.length > 5 && (
        <div className="dash-categories__action">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="dash-categories__see-all-btn"
          >
            <span>{showAll ? "Show less" : "See all"}</span>
            <span aria-hidden="true">{showAll ? "↑" : "↓"}</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default CategoryGrid;