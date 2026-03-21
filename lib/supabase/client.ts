"use client";

import { createBrowserClient } from "@supabase/ssr";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          anonymous_id: string;
          full_name: string;
          email: string;
          phone_hash: string;
          role: "reporter" | "police_admin" | "super_admin";
          status: "active" | "banned" | "suspended";
          warnings: number;
          language: "en" | "ta" | "hi";
          theme: "light" | "dark";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      reports: {
        Row: {
          id: string;
          report_id: string;
          reporter_anonymous_id: string;
          vehicle_number: string;
          vehicle_type: string | null;
          vehicle_color: string | null;
          violation_type: string;
          custom_violation: string | null;
          location_text: string;
          location_lat: number | null;
          location_lng: number | null;
          landmark: string | null;
          direction: string | null;
          date: string;
          time: string;
          severity: string | null;
          is_repeat_offender: boolean;
          description: string;
          status: "submitted" | "under_review" | "approved" | "rejected" | "action_taken";
          rejection_reason: string | null;
          action_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      };
      report_media: {
        Row: {
          id: string;
          report_id: string;
          url: string;
          type: "image" | "video";
          size: number;
          original_filename: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_media"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["report_media"]["Insert"]>;
      };
      report_status_history: {
        Row: {
          id: string;
          report_id: string;
          status: string;
          admin_id: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_status_history"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["report_status_history"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          report_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      invite_codes: {
        Row: {
          id: string;
          code_hash: string;
          role: "police_admin" | "super_admin";
          generated_for: string;
          generated_by: string;
          expires_at: string;
          status: "active" | "used" | "expired" | "revoked";
          used_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invite_codes"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["invite_codes"]["Insert"]>;
      };
      warnings: {
        Row: {
          id: string;
          user_id: string;
          report_id: string;
          reason: string;
          warning_number: number;
          issued_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["warnings"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["warnings"]["Insert"]>;
      };
      banned_phones: {
        Row: {
          id: string;
          phone_hash: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["banned_phones"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["banned_phones"]["Insert"]>;
      };
      appeals: {
        Row: {
          id: string;
          user_id: string;
          appeal_text: string;
          status: "pending" | "accepted" | "denied";
          reviewed_by: string | null;
          response: string | null;
          created_at: string;
          reviewed_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["appeals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["appeals"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          event_type: string;
          user_id: string | null;
          target_id: string | null;
          details: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["system_settings"]["Row"], "id" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["system_settings"]["Insert"]>;
      };
      violation_types: {
        Row: {
          id: string;
          name: string;
          active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["violation_types"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["violation_types"]["Insert"]>;
      };
    };
  };
};

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
