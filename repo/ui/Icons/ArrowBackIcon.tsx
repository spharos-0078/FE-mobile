import React from 'react';
import { cn } from '@/lib/utils';

export default function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(className)}
    >
      <path d="m9 19-7-7 7-7" />
      <path d="M19 12H4" />
    </svg>
  );
}
