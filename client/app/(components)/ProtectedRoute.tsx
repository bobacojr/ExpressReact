import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const AuthWrapper = (props: P) => {
        const router = useRouter();
        const [isAuthenticated, setIsAuthenticated] = useState(false);

        // Memoize the checkAuth function using useCallback
        const checkAuth = useCallback(async (): Promise<void> => {
          try {
              const response = await fetch('http://localhost:8080/auth/me', {
                  credentials: 'include', // Include cookies in the request
              });
              if (response.ok) {
                  setIsAuthenticated(true);
              } else {
                  router.replace('/login'); // Redirect to login if not authenticated
              }
          } catch (error) {
              console.error('Authentication check failed:', error);
              router.replace('/login');
          }
      }, [router]); // Add router as a dependency

        useEffect(() => {
            checkAuth();
        }, [checkAuth]);

        if (!isAuthenticated) {
            return null; // Render nothing while checking authentication
        }

        // Pass all props to the WrappedComponent
        return <WrappedComponent {...props} />;
    };

    // Assign a display name for debugging
    AuthWrapper.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthWrapper;
};

export default withAuth;