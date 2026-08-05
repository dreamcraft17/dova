/**
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { ReactNode } from 'react';
import { getFeedlogFeedbackHref, isFeedlogSameOrigin } from '../lib/feedlog';

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

  const sameOrigin = isFeedlogSameOrigin();

  return (
    <a
      href={href}
      className={className}
      {...(sameOrigin
        ? {}
        : { target: '_blank', rel: 'noopener noreferrer' })}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
