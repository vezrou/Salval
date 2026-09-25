import { useEffect, useRef, useState } from 'react';

export default function Reveal({ className = '', children }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;

    if (!element || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const classes = ['reveal', className, isVisible && 'is-visible']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} ref={elementRef}>
      {children}
    </div>
  );
}
