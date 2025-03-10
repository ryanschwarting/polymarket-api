'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface DiscordIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface DiscordIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const variants: Variants = {
  normal: {
    translateX: 0,
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  animate: {
    translateX: [0, -2, 2, -2, 2, 0],
    opacity: 1,
    transition: {
      duration: 0.4,
      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
      ease: 'easeInOut',
    },
  },
};

const DiscordIcon = forwardRef<DiscordIconHandle, DiscordIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start('animate');
        } else {
          onMouseEnter?.(e);
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlledRef.current) {
          controls.start('normal');
        } else {
          onMouseLeave?.(e);
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(
          `cursor-pointer select-none p-2 hover:bg-accent rounded-md transition-colors duration-200 flex items-center justify-center`,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 44 44"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ overflow: 'visible' }}
        >
          <motion.path
            variants={variants}
            animate={controls}
            initial="normal"
            d="M17.54,34.22A47.42,47.42,0,0,1,14.68,38C7.3,37.79,4.5,33,4.5,33A44.83,44.83,0,0,1,9.31,13.48,16.47,16.47,0,0,1,18.69,10l1,2.31"
          />
          <motion.path
            variants={variants}
            animate={controls}
            initial="normal"
            d="M17.85,22.67a3.48,3.48,0,0,0-3.37,3.9,3.38,3.38,0,0,0,3.31,3.22,3.53,3.53,0,0,0,3.43-3.9A3.45,3.45,0,0,0,17.85,22.67Z"
          />
          <motion.path
            variants={variants}
            animate={controls}
            initial="normal"
            d="M12.2,14.37a28.19,28.19,0,0,1,8.16-2.18A23.26,23.26,0,0,1,24,12a23.26,23.26,0,0,1,3.64.21,28.19,28.19,0,0,1,8.16,2.18m-7.47-2.09l1-2.31a16.47,16.47,0,0,1,9.38,3.51A44.83,44.83,0,0,1,43.5,33S40.7,37.79,33.32,38a47.42,47.42,0,0,1-2.86-3.81"
          />
          <motion.path
            variants={variants}
            animate={controls}
            initial="normal"
            d="M36.92,31.29a29.63,29.63,0,0,1-8.64,3.49,21.25,21.25,0,0,1-4.28.4h0a21.25,21.25,0,0,1-4.28-.4,29.63,29.63,0,0,1-8.64-3.49"
          />
          <motion.path
            variants={variants}
            animate={controls}
            initial="normal"
            d="M30.15,22.67a3.48,3.48,0,0,1,3.37,3.9,3.38,3.38,0,0,1-3.31,3.22,3.53,3.53,0,0,1-3.43-3.9A3.45,3.45,0,0,1,30.15,22.67Z"
          />
        </svg>
      </div>
    );
  }
);

DiscordIcon.displayName = 'DiscordIcon';

export { DiscordIcon };
