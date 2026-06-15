'use client';
import { useState } from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = "w-8 h-8", width = 32, height = 32 }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`${className} bg-gray-200 rounded-full flex items-center justify-center`}>
        <span className="text-black font-bold text-sm">NJ</span>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Logo NJ"
      className={`${className} object-contain rounded-full`}
      width={width}
      height={height}
      onError={() => setError(true)}
    />
  );
}