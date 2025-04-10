import React, { useState, useEffect, createContext } from 'react';
import { Navigate } from 'react-router-dom';

export interface User {
  email: string;
  roles: string[];
  userId: number;
}

export const UserContext = createContext<User | null>(null);

function AuthorizeView(props: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User>({ email: '', roles: [], userId: 0 });

  useEffect(() => {
    async function fetchWithRetry(url: string, options: any) {
      try {
        const response = await fetch(url, options);
        const contentType = response.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }

        const data = await response.json();

        if (data.email) {
          setUser({ email: data.email, roles: data.roles || [], userId: data.userId });
          setAuthorized(true);
        } else {
          throw new Error('Invalid user session');
        }
      } catch (error) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    }

    fetchWithRetry('https://localhost:7156/pingauth', {
      method: 'GET',
      credentials: 'include',
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (authorized) {
    return (
      <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
    );
  }

  return <Navigate to="/login" />;
}

export function AuthorizedUser(props: { value: 'email' | 'roles' }) {
  const user = React.useContext(UserContext);

  if (!user) return null;

  if (props.value === 'email') return <>{user.email}</>;
  if (props.value === 'roles') return <>{user.roles.join(', ')}</>;

  return null;
}

export default AuthorizeView;
