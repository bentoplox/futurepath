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
      console.log("[AUTH] Fetching details for email:", email);
      // ⚡ UPDATED: maybeSingle() handles 0 rows gracefully without throwing PGRST116
      const { data, error } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
      if (error) throw error;
      
      if (data) {
          console.log("[AUTH] User data found in DB:", data);
          setUser(data);
      } else {
          console.warn("[AUTH] No user record found in 'public.users' for this email.");
          // Ensure we don't stay in a loading state if no record exists
          setLoading(false);
      }
    } catch (error) {
      console.error('[AUTH] Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async (email, password, name, role, programme) => {
    console.log("[AUTH] Starting registration for:", email);
    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Insert into 'users' table with the specific ROLE and LINKED UUID
    if (authData.user) {
      console.log("[AUTH] Supabase Auth Success. Linking UUID to public table:", authData.user.id);
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            user_id: authData.user.id, 
            email: email,
            name: name,
            role: role, 
            programme: role === 'student' ? programme : null,
            status: 'active'
          }
        ]);

      if (dbError) {
          console.error("[AUTH] DB Insert Failed:", dbError);
          throw dbError;
      }
      console.log("[AUTH] Registration Complete.");
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