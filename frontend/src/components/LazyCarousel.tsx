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
    <div ref={containerRef} className="lazy-carousel-container" style={{ position: 'relative', zIndex: 1, marginBottom: '0', marginTop: '-10px' }}>
      <h2 className="text-xl font-bold text-white" style={{ marginBottom: '0', marginTop: '0', position: 'relative', zIndex: 1 }}>
        {title}
      </h2>
      <div
        className="lazy-carousel-wrapper"
        style={{
          height: 'auto',
          overflow: 'visible',
          position: 'relative',
          zIndex: 5,
          perspective: '1000px',
          marginTop: '-5px' /* Negative top margin to bring content closer to title */
        }}
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
