"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  anonymous_id: string;
  full_name: string;
  email: string;
  role: "reporter" | "police_admin" | "super_admin";
  status: "active" | "banned" | "suspended";
  warnings: number;
  language: "en" | "ta" | "hi";
  theme: "light" | "dark";
  avatar_url: string | null;
  created_at: string;
}

interface SessionContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  profile: null,
  loading: true,
  refresh: async () => {},
});

export function useSession() {
  return useContext(SessionContext);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const supabase = createClient();
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser({ id: authUser.id, email: authUser.email || "" });

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single() as { data: Profile | null };

      if (profileData) {
        setProfile(profileData);
      }
    } catch (e) {
      console.error("Session fetch error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={{ user, profile, loading, refresh: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}
