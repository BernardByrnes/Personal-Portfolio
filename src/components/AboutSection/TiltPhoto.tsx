'use client';

import React, { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import Image from 'next/image';

export default function TiltPhoto() {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tiltRef.current) {
      VanillaTilt.init(tiltRef.current, {
        max: 12,
        speed: 400,
        glare: true,
        'max-glare': 0.15,
        scale: 1.02,
      });
    }
  }, []);

  return (
    <div 
      ref={tiltRef} 
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative',
        transformStyle: 'preserve-3d'
      }}
    >
      <Image 
        src="/portfolio.png"
        alt="Bernard Mutambo"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />
    </div>
  );
}
