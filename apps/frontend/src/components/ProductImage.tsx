import { useEffect, useState } from 'react';
import { productImageUrl } from 'dova-shared';

type ProductImageProps = {
  name: string;
  imageUrl?: string;
  categoryName?: string;
  className?: string;
  /** Card/list contexts already show the product name beside the image. */
  decorative?: boolean;
};

export function ProductImage({
  name,
  imageUrl,
  categoryName,
  className,
  decorative = true,
}: ProductImageProps) {
  const fallback = productImageUrl(name, categoryName);
  const [src, setSrc] = useState(imageUrl || fallback);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(imageUrl || fallback);
    setFailed(false);
  }, [imageUrl, fallback]);

  if (failed) {
    return <span aria-hidden="true">🌿</span>;
  }

  return (
    <img
      className={className}
      src={src}
      alt={decorative ? '' : name}
      onError={() => {
        if (src !== fallback) {
          setSrc(fallback);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
