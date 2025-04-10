import React, { ReactNode, useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyCarouselProps {
  title: string;
  children: ReactNode;
  marginTop?: boolean;
}

const LazyCarousel: React.FC<LazyCarouselProps> = ({ title, children, marginTop = true }) => {
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px 0px', // Start loading when carousel is 200px below viewport
    threshold: 0.1,
  });
  
  const [shouldRender, setShouldRender] = useState(false);
  
  // Once visible, we should always render the carousel (never unload it)
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);
  
  return (
    <div ref={containerRef}>
      {marginTop && <br />}
      <h2 className="text-xl font-bold mb-1 text-white">{title}</h2>
      <div className="overflow-x-auto overflow-y-hidden hide-scrollbar" style={{ height: 'auto' }}>
        {shouldRender ? (
          children
        ) : (
          <div className="carousel-placeholder" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loading-indicator">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LazyCarousel;