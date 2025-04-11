import React, { ReactNode, useState, useEffect } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyCarouselProps {
  title: string;
  children: ReactNode;
}

const LazyCarousel: React.FC<LazyCarouselProps> = ({ title, children }) => {
  const [containerRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    rootMargin: '200px 0px', // Start loading when 200px below viewport
    threshold: 0.1,
  });

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    }
  }, [isVisible]);

  return (
    <div ref={containerRef}>
      <h2 className="text-xl font-bold text-white" style={{ marginBottom: '6px' }}>
        {title}
      </h2>
      <div
        className="overflow-x-auto overflow-y-hidden hide-scrollbar"
        style={{ height: 'auto', overflow: 'visible' }}
      >
        {shouldRender ? (
          children
        ) : (
          <div
            className="carousel-placeholder"
            style={{
              height: '180px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="loading-indicator text-white text-sm">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LazyCarousel;
