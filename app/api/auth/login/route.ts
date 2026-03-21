import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get profile to determine redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single() as { data: { role: string; status: string } | null };

    if (profile?.status === "banned") {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Your account has been banned. You may file an appeal." },
        { status: 403 }
      );
    }

    const redirectTo = profile?.role === "police_admin" || profile?.role === "super_admin"
      ? "/oversight/dashboard"
      : "/dashboard";

    return NextResponse.json({
      success: true,
      redirectTo,
      role: profile?.role || "reporter",
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
