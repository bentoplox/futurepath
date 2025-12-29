// ============================================================================
// FILE: src/context/AuthContext.jsx
// PURPOSE: Manages user authentication state across the entire app
// DESCRIPTION: Provides login, register, logout functions and user data
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Custom hook to use auth in any component
// This makes it easy to access user data anywhere: const { user } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// AuthProvider component wraps the app and provides authentication
export const AuthProvider = ({ children }) => {
  // State to store current user (null if not logged in)
  const [user, setUser] = useState(null);

  // State to track if we're checking for saved login
  const [loading, setLoading] = useState(true);

  // On component mount, check if user was previously logged in
  useEffect(() => {
    // Check localStorage for saved user data
    const savedUser = localStorage.getItem('futurepath_user');

    if (savedUser) {
      // Parse the JSON string back to an object
      setUser(JSON.parse(savedUser));
    }

    // Finished loading
    setLoading(false);
  }, []); // Empty dependency array = run once on mount

  // LOGIN FUNCTION
  // In production, this would call Supabase API
  // For now, we simulate a successful login
  const login = (email, password) => {
    // TODO: Replace with real Supabase authentication
    // const { data, error } = await supabase.auth.signIn({ email, password })

    // Create mock user object
    const mockUser = {
      user_id: Math.floor(Math.random() * 10000),
      email: email,
      name: email.split('@')[0], // Use part before @ as name
      role: 'student',
      programme: 'Computer Science',
      academic_year: 2
    };

    // Save to state
    setUser(mockUser);

    // Save to localStorage so user stays logged in after refresh
    localStorage.setItem('futurepath_user', JSON.stringify(mockUser));

    return mockUser;
  };

  // REGISTER FUNCTION
  // Creates a new user account
  const register = (email, password, name, programme) => {
    // TODO: Replace with real Supabase registration
    // const { data, error } = await supabase.auth.signUp({ email, password })

    const mockUser = {
      user_id: Math.floor(Math.random() * 10000),
      email,
      name,
      role: 'student',
      programme,
      academic_year: 1
    };

    setUser(mockUser);
    localStorage.setItem('futurepath_user', JSON.stringify(mockUser));

    return mockUser;
  };

  // LOGOUT FUNCTION
  // Clears user data and removes from localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('futurepath_user');
  };

  // Provide these values to all children components
  const value = {
    user,      // Current user object (or null)
    login,     // Function to log in
    register,  // Function to register
    logout,    // Function to log out
    loading    // Boolean indicating if we're checking auth status
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};