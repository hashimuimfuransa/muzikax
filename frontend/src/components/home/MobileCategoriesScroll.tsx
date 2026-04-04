"use client";

import { useRouter } from "next/navigation";

export default function MobileCategoriesScroll() {
  const router = useRouter();

  const categories: any[] = [
    { id: 'trending', name: 'Trending' },
    { id: 'new', name: 'New' },
    { id: 'popular', name: 'Popular' },
    { id: 'afrobeat', name: 'Afrobeat' },
    { id: 'hiphop', name: 'Hip Hop' },
    { id: 'rnb', name: 'R&B' },
    { id: 'afropop', name: 'Afropop' },
    { id: 'gospel', name: 'Gospel' },
    { id: 'dancehall', name: 'Dancehall' },
    { id: 'reggae', name: 'Reggae' },
    { id: 'pop', name: 'Pop' },
    { id: 'rock', name: 'Rock' },
    { id: 'electronic', name: 'Electronic' },
  ];

  return (
    <section className="md:hidden w-full px-0 py-2 bg-[var(--card-bg)] border-b border-white/10 sticky top-[3.6rem] z-40 backdrop-blur-md shadow-lg">
      <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              if (['trending', 'new', 'popular'].includes(category.id)) {
                // These will be handled by parent component state
                window.dispatchEvent(new CustomEvent('categoryChange', { detail: { categoryId: category.id } }));
              } else {
                router.push(`/explore?genre=${category.id}`);
              }
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 active:scale-95 ${
              category.id === 'trending'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'bg-[var(--card-bg)]/50 text-gray-300 hover:bg-[var(--card-bg)]/70'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
}
