// src/components/UserContext.tsx
import React from 'react';

export interface User {
  email: string;
  roles: string[];
}

const UserContext = React.createContext<User | null>(null);

export default UserContext;
