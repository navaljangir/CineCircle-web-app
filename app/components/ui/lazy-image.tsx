import { useState, useEffect } from 'react';
import { useIntersectionObserver } from '~/hooks/useIntersectionObserver';
import { cn } from '~/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataURL?: string;
  aspectRatio?: string;
  containerClassName?: string;
}

export function LazyImage({
  src,
  alt,
  blurDataURL,
  aspectRatio = '2/3',
  className,
  containerClassName,
  ...props
}: LazyImageProps) {
  const [ref, isVisible] = useIntersectionObserver({
    freezeOnceVisible: true,
    rootMargin: '100px',
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (isVisible && !imageSrc) {
      setImageSrc(src);
    }
  }, [isVisible, src, imageSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden bg-muted', containerClassName)}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-lg scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isLoaded && !blurDataURL && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleLoad}
          loading="lazy"
          {...props}
        />
      )}
      
      {/* No image fallback */}
      {!imageSrc && isVisible && !src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No Image</span>
        </div>
      )}
    </div>
  );
}
