// hocs/withAuth.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent: React.ComponentType<AuthProps>) => {
  return (props: AuthProps) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
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
      };

      checkAuth();
    }, [router]);

    if (!isAuthenticated) {
      return null; // Render nothing while checking authentication
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;