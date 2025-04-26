
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, AuthState, Admin, Student } from '../types';

// Mock data for demonstration
const MOCK_USERS = {
  admin: {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin' as const,
  },
  student1: {
    id: 'student-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student' as const,
    batches: ['batch-1'],
    studentId: 'S10001',
  },
  student2: {
    id: 'student-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student' as const,
    batches: ['batch-1'],
    studentId: 'S10002',
  }
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: () => boolean;
  isStudent: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      // In a real app, verify token with backend
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          setState({ ...initialState, isLoading: false });
        }
      } else {
        setState({ ...initialState, isLoading: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in a real app, this would call the backend API
    
    // Simulate api call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, simple email check
    if (email === 'admin@example.com' && password === 'password') {
      const user = MOCK_USERS.admin;
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } else if (email === 'john@example.com' && password === 'password') {
      const user = MOCK_USERS.student1;
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } else if (email === 'jane@example.com' && password === 'password') {
      const user = MOCK_USERS.student2;
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    }

    return false;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  const isStudent = () => {
    return state.user?.role === 'student';
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAdmin,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
