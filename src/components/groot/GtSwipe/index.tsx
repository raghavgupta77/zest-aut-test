/**
 * GtSwipe Component
 * React replacement for Groot UI gt-swipe wrapper component
 * Provides swipe gesture support for modals
 */

import React, { useRef, useEffect } from 'react';
import './index.css';

export interface GtSwipeProps {
  children: React.ReactNode;
  className?: string;
  onSwipeDown?: () => void;
}

export const GtSwipe: React.FC<GtSwipeProps> = ({
  children,
  className = '',
  onSwipeDown
}) => {
  const swipeRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  useEffect(() => {
    const element = swipeRef.current;
    if (!element || !onSwipeDown) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      touchEndY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      const swipeDistance = touchStartY.current - touchEndY.current;
      // Swipe down threshold: 100px
      if (swipeDistance < -100) {
        onSwipeDown();
      }
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeDown]);

  return (
    <div ref={swipeRef} className={`gt-swipe ${className}`}>
      {children}
    </div>
  );
};
