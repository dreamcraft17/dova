type LoadingProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  inline?: boolean;
  block?: boolean;
};

export function Loading({ label, size = 'md', inline = false, block = false }: LoadingProps) {
  const spinner = (
    <span className={`loading-spinner loading-spinner--${size}`} aria-hidden="true" />
  );

  if (inline) {
    return (
      <span className="loading-inline" role="status">
        {spinner}
        {label ? <span>{label}</span> : null}
      </span>
    );
  }

  const className = block ? 'loading-block' : 'loading-fullpage';

  return (
    <div className={className} role="status">
      {spinner}
      {label ? <p>{label}</p> : null}
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="card product-card skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton skeleton-image" />
          <div className="card-body">
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FeaturedGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="featured-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="product-card skeleton-card" key={i} aria-hidden="true">
          <div className="skeleton skeleton-image" />
          <div className="card-body">
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line medium" />
            <div className="skeleton skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingOverlay({ label }: { label?: string }) {
  return (
    <div className="loading-overlay" role="status">
      <Loading label={label} size="md" />
    </div>
  );
}
