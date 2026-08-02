import { ReactNode } from 'react';
import { getFeedlogFeedbackHref } from '../lib/feedlog';

type FeedlogLinkProps = {
  isLoggedIn?: boolean;
  returnTo?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
};

export function FeedlogLink({
  isLoggedIn = false,
  returnTo = '/',
  className,
  children = 'Feedback',
  onClick,
}: FeedlogLinkProps) {
  const href = getFeedlogFeedbackHref({ isLoggedIn, returnTo });
  if (!href) return null;

  return (
    <a
      href={href}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {children}
    </a>
  );
}
