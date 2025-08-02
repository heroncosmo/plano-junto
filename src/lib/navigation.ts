import { NavigateFunction } from 'react-router-dom';

/**
 * Navigate to a route and scroll to top
 * @param navigate - React Router's navigate function
 * @param to - The route to navigate to
 * @param options - Additional navigation options
 */
export const navigateToTop = (
  navigate: NavigateFunction,
  to: string,
  options?: { replace?: boolean; state?: any }
) => {
  // Navigate to the route
  navigate(to, options);
  
  // Scroll to top after a brief delay to ensure navigation is complete
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, 100);
}; 