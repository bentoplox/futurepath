// ============================================================================
// FILE: src/context/AuthContext.jsx
// PURPOSE: Manages user authentication state using Supabase
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... (Keep existing useEffect and fetchUserDetails same as before) ...
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) fetchUserDetails(session.user.email);
      else setLoading(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) fetchUserDetails(session.user.email);
      else { setUser(null); setLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUserDetails = async (email) => {
    try {
      const { data } = await supabase.from('users').select('*').eq('email', email).single();
      if (data) setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  // ------------------------------------------------------------------
  // UPDATE: Added 'role' parameter to the register function
  // ------------------------------------------------------------------
  const register = async (email, password, name, role, programme) => {
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insert into 'users' table with the specific ROLE
    if (authData.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            email: email,
            name: name,
            role: role, // Now we save 'student' or 'alumni'
            programme: role === 'student' ? programme : null, // Alumni don't need programme
            status: 'active'
          }
        ]);

      if (dbError) throw dbError;
    }
    return authData;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = { user, login, register, logout, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};