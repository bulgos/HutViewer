import type { FC } from 'react';

/** Hut Viewer logo (same paths as the favicon), drawn in the current text colour. */
export const HutViewerLogo: FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg className={className} viewBox="8 6 84 84" width={size} height={size} aria-hidden focusable="false">
    <g fill="currentColor" fillRule="evenodd">
      <path d="M26 16.37 L38.08 38.34 L36.01 41.84 L31.347 33.355 L28.92 36.952 L26 33.302 L23.08 36.952 L20.653 33.355 L11 50.9 L11 43.64 Z M26 23.63 L29.452 29.906 L28.68 31.049 L26 27.698 L23.32 31.049 L22.548 29.906 Z" />
      <path d="M74 16.37 L61.92 38.34 L63.99 41.84 L68.653 33.355 L71.08 36.952 L74 33.302 L76.92 36.952 L79.347 33.355 L89 50.9 L89 43.64 Z M74 23.63 L70.548 29.906 L71.32 31.049 L74 27.698 L76.68 31.049 L77.452 29.906 Z" />
      <path d="M50 26 L82 80 L54.5 80 L54.5 65 L45.5 65 L45.5 80 L18 80 Z" />
    </g>
  </svg>
);
