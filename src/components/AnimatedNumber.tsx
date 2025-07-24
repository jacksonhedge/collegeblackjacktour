import React, { useState, useEffect, useRef } from 'react';

const AnimatedNumber = ({ value = 0, duration = 1000, prefix = '', suffix = '' }) => {
  const [currentValue, setCurrentValue] = useState(0);
  const startTime = useRef(null);
  const frameId = useRef(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = currentValue;
    startTime.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth deceleration
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(progress);

      const currentNumber = Math.floor(
        startValue.current + (value - startValue.current) * easedProgress
      );

      setCurrentValue(currentNumber);

      if (progress < 1) {
        frameId.current = requestAnimationFrame(animate);
      }
    };

    frameId.current = requestAnimationFrame(animate);

    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [value, duration]);

  // Convert to string and pad with zeros if needed
  const displayValue = currentValue.toString().padStart(value.toString().length, '0');

  return (
    <div className="font-mono">
      {prefix}
      {displayValue.split('').map((digit, index) => (
        <span
          key={index}
          className="inline-block w-4 text-center"
        >
          {digit}
        </span>
      ))}
      {suffix}
    </div>
  );
};

export default AnimatedNumber;