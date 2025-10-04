'use client';

import { useState, useEffect, useRef, useCallback, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  blurDataUrl?: string;
  priority?: boolean;
  onLoadComplete?: () => void;
  aspectRatio?: number;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  blurDataUrl,
  priority = false,
  onLoadComplete,
  aspectRatio,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(blurDataUrl || '');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const loadImage = useCallback(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setHasError(false);
      onLoadComplete?.();
    };
    
    img.onerror = () => {
      setImageSrc(fallbackSrc);
      setIsLoading(false);
      setHasError(true);
    };
    
    img.src = src;
  }, [src, fallbackSrc, onLoadComplete]);

  useEffect(() => {
    if (priority) {
      // Load immediately for priority images
      loadImage();
    } else {
      // Set up intersection observer for lazy loading
      if ('IntersectionObserver' in window) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                loadImage();
                observerRef.current?.disconnect();
              }
            });
          },
          {
            rootMargin: '50px', // Start loading 50px before entering viewport
          }
        );
        
        if (imgRef.current) {
          observerRef.current.observe(imgRef.current);
        }
      } else {
        // Fallback for browsers without IntersectionObserver
        loadImage();
      }
    }
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority, loadImage]);
  
  const containerStyle = aspectRatio
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : undefined;
  
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectRatio && 'w-full h-0',
        className
      )}
      style={containerStyle}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={imageSrc || blurDataUrl || fallbackSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'transition-opacity duration-300',
          aspectRatio && 'absolute inset-0 w-full h-full object-cover',
          isLoading && 'opacity-0',
          !isLoading && 'opacity-100',
          hasError && 'filter grayscale'
        )}
        {...props}
      />
      
      {isLoading && blurDataUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center filter blur-lg"
          style={{ backgroundImage: `url(${blurDataUrl})` }}
        />
      )}
      
      {isLoading && !blurDataUrl && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
}

// Picture component for responsive images
interface ResponsiveImageProps extends OptimizedImageProps {
  sources?: {
    srcSet: string;
    media?: string;
    type?: string;
  }[];
}

export function ResponsiveImage({
  sources = [],
  ...imageProps
}: ResponsiveImageProps) {
  if (sources.length === 0) {
    return <OptimizedImage {...imageProps} />;
  }
  
  return (
    <picture>
      {sources.map((source, index) => (
        <source
          key={index}
          srcSet={source.srcSet}
          media={source.media}
          type={source.type}
        />
      ))}
      <OptimizedImage {...imageProps} />
    </picture>
  );
}

// Background image component with lazy loading
interface BackgroundImageProps {
  src: string;
  fallbackSrc?: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  overlayOpacity?: number;
}

export function BackgroundImage({
  src,
  fallbackSrc = '/images/placeholder.svg',
  className,
  children,
  overlay = false,
  overlayOpacity = 0.5,
}: BackgroundImageProps) {
  const [bgImage, setBgImage] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const loadBackgroundImage = useCallback(() => {
    const img = new Image();
    
    img.onload = () => {
      setBgImage(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setBgImage(fallbackSrc);
      setIsLoaded(true);
    };
    
    img.src = src;
  }, [src, fallbackSrc]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadBackgroundImage();
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [src, loadBackgroundImage]);
  
  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {overlay && (
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
}


