import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component that automatically serves WebP images with PNG fallback.
 * For local images (starting with /), it will try to load the WebP version first.
 * For CDN images, it uses the provided URL directly.
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  // Check if this is a local PNG image that might have a WebP version
  const isLocalPng = src.startsWith("/") && src.endsWith(".png");
  const webpSrc = isLocalPng ? src.replace(".png", ".webp") : null;

  // If WebP failed or not available, use original src
  const currentSrc = hasError || !webpSrc ? src : webpSrc;

  const handleError = () => {
    if (!hasError && webpSrc) {
      // WebP failed, fallback to PNG
      setHasError(true);
    } else {
      // Both failed, call onError callback
      onError?.();
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onLoad={onLoad}
      onError={handleError}
    />
  );
}

/**
 * Picture element that provides WebP with PNG fallback using the <picture> element.
 * This is the preferred approach for better browser support.
 */
export function OptimizedPicture({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  onLoad,
  onError,
}: OptimizedImageProps) {
  // Check if this is a local PNG image that might have a WebP version
  const isLocalPng = src.startsWith("/") && src.endsWith(".png");
  const webpSrc = isLocalPng ? src.replace(".png", ".webp") : null;

  return (
    <picture>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}

export default OptimizedImage;
