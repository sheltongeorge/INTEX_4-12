import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export const useIntersectionObserver = <T extends Element>(
  options: IntersectionObserverOptions = {},
  once: boolean = true
): [RefObject<T | null>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T | null>(null);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      // Update state when intersection status changes
      setIsIntersecting(entry.isIntersecting);
      
      // If element has been intersected and we only want to observe once, disconnect
      if (entry.isIntersecting && once) {
        observer.disconnect();
      }
    }, options);
    
    observer.observe(element);
    
    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, [options.root, options.rootMargin, options.threshold, once]);
  
  return [elementRef, isIntersecting];
};