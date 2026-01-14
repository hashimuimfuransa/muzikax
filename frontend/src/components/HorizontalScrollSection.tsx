import { ReactNode } from 'react';

interface HorizontalScrollSectionProps {
  title: string;
  viewAllLink?: string;
  children: ReactNode;
}

export default function HorizontalScrollSection({
  title,
  viewAllLink,
  children
}: HorizontalScrollSectionProps) {
  return (
    <section className="w-full px-4 md:px-8 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          {title}
        </h2>
        {viewAllLink && (
          <a
            href={viewAllLink}
            className="text-[#FF4D67] hover:text-[#FFCB2B] text-sm sm:text-base transition-colors"
          >
            View All
          </a>
        )}
      </div>
      
      <div className="relative group">
        <div className="flex overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 gap-4 hide-scrollbar snap-x snap-mandatory">
          {children}
        </div>
        
        {/* Scroll indicators for larger screens */}
        <div className="hidden absolute top-1/2 -left-2 -translate-y-1/2 z-10 group-hover:flex opacity-0 group-hover:opacity-100 transition-all">
          <button 
            className="w-8 h-8 rounded-full bg-gray-800/70 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
            onClick={(e) => {
              e.currentTarget.parentElement?.parentElement?.querySelector('.hide-scrollbar')?.scrollBy({ left: -300, behavior: 'smooth' });
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </div>
        
        <div className="hidden absolute top-1/2 -right-2 -translate-y-1/2 z-10 group-hover:flex opacity-0 group-hover:opacity-100 transition-all">
          <button 
            className="w-8 h-8 rounded-full bg-gray-800/70 backdrop-blur-sm flex items-center justify-center text-white shadow-lg"
            onClick={(e) => {
              e.currentTarget.parentElement?.parentElement?.querySelector('.hide-scrollbar')?.scrollBy({ left: 300, behavior: 'smooth' });
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}