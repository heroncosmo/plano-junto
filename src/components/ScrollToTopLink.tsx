import { Link, LinkProps } from 'react-router-dom';
import { ReactNode } from 'react';

interface ScrollToTopLinkProps extends Omit<LinkProps, 'onClick'> {
  children: ReactNode;
  className?: string;
}

export const ScrollToTopLink = ({ children, className, ...props }: ScrollToTopLinkProps) => {
  const handleClick = () => {
    // Scroll to top when link is clicked
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Link {...props} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}; 