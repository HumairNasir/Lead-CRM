import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { ProfileRow } from "@/lib/types/database";
import { ProfileClientView } from "@/components/profile/ProfileClientView";

async function ProfilePageContent() {
  await connection();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Fetch the user's profile from public.profiles using auth UUID
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let firstName = "";
  let lastName = "";
  let role = "CRM Administrator";

  if (!profileError && profile) {
    const p = profile as ProfileRow;
    firstName = p.first_name || "";
    lastName = p.last_name || "";
    role = p.role || "CRM Administrator";
  } else {
    // Fallback if no profile row created yet
    firstName = user.email ? user.email.split("@")[0] : "Admin";
  }

  return (
    <ProfileClientView
      user={{
        id: user.id,
        email: user.email || "",
      }}
      initialProfile={{
        firstName,
        lastName,
        role,
      }}
    />
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex flex-col justify-center items-center text-zinc-500 gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading profile...</span>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
