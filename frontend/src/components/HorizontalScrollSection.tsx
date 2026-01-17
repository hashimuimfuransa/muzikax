import { ReactNode, useRef, useState, useEffect } from 'react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Check scroll position and update button states
  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };
  
  // Initial check and add event listener
  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of typical card + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  return (
    <section className="w-full py-6 sm:py-8 relative">
      <div className="px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-[#FF4D67] hover:text-[#FFCB2B] text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105"
            >
              View All
            </a>
          )}
        </div>
      </div>
      
      <div className="relative group">
        {/* Left fade overlay */}
        <div className={`absolute left-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Right fade overlay */}
        <div className={`absolute right-0 top-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* Scroll container */}
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-6 scrollbar-hide -mx-4 md:-mx-6 px-4 md:px-6 gap-5 md:gap-6 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
        
        {/* Enhanced scroll buttons */}
        <button 
          className={`absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-lg flex items-center justify-center text-white shadow-xl hover:bg-gray-700/80 transition-all duration-300 hover:scale-110 ${canScrollLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        
        <button 
          className={`absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur-lg flex items-center justify-center text-white shadow-xl hover:bg-gray-700/80 transition-all duration-300 hover:scale-110 ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </section>
  );
}