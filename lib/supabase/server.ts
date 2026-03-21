import { createServerClient as supabaseCreateServerClient } from "@supabase/ssr";
import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "./client";

export async function createServerClient() {
  const cookieStore = await cookies();

  return supabaseCreateServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can be called from Server Components where cookies
            // cannot be set. This is expected behavior when reading session
            // in server components.
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  return supabaseCreateClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status, anonymous_id, language, theme")
    .eq("id", user.id)
    .single() as { data: { role: string; status: string; anonymous_id: string; language: string; theme: string } | null };

  if (!profile) {
    return null;
  }

  return {
    user,
    role: profile.role as "reporter" | "police_admin" | "super_admin",
    status: profile.status as "active" | "banned" | "suspended",
    anonymousId: profile.anonymous_id,
    language: profile.language as "en" | "ta" | "hi",
    theme: profile.theme as "light" | "dark",
  };
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.status === "banned") {
    redirect("/banned");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/not-found");
  }

  return session;
}
