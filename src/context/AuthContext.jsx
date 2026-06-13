import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar perfil:', error.message);
    } else {
      setProfile(data);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [user]);

  useEffect(() => {
    // Escuta mudanças de estado de autenticação em tempo real
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const applyTheme = () => {
      let activeTheme = 'light';
      
      if (profile) {
        const themePreference = profile.theme || 'auto';
        if (themePreference === 'auto') {
          const hour = new Date().getHours();
          activeTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
        } else {
          activeTheme = themePreference;
        }
      } else {
        const hour = new Date().getHours();
        activeTheme = (hour >= 18 || hour < 6) ? 'dark' : 'light';
      }
      
      document.documentElement.setAttribute('data-theme', activeTheme);
    };

    applyTheme();
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  const updateTheme = async (newTheme) => {
    if (!user) return;
    setProfile(prev => prev ? { ...prev, theme: newTheme } : null);
    const { error } = await supabase
      .from('profiles')
      .update({ theme: newTheme })
      .eq('id', user.id);
      
    if (error) {
      console.error('Erro ao atualizar tema no Supabase:', error.message);
      fetchProfile(user.id);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile,
      isLoadingAuth, 
      signIn, 
      signUp, 
      signOut,
      updateTheme,
      fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
