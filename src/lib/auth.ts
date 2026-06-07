import "server-only";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Family, FamilyMember, Profile } from "@/lib/types";

export type AuthContext = {
  userId: string;
  email: string;
  profile: Profile;
  membership: FamilyMember | null;
  family: Family | null;
  isAdmin: boolean;
};

export type AuthDebug = {
  hasSession: boolean;
  sessionUserId: string | null;
  hasUser: boolean;
  userId: string | null;
  userError: string | null;
  profileFound: boolean;
  profileError: string | null;
  serviceKeyPresent: boolean;
};

export async function getAuthContextWithDebug(): Promise<{ ctx: AuthContext | null; debug: AuthDebug }> {
  const supabase = await createClient();

  // Try session first (decodes JWT from cookie — doesn't call Supabase).
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user ?? null;

  // Then validate with getUser (calls Supabase) — more secure but can fail.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  const validatedUser = userData?.user ?? null;

  // Prefer validated user; fall back to session user if validation hiccupped.
  const user = validatedUser ?? sessionUser;

  const debug: AuthDebug = {
    hasSession: !!sessionUser,
    sessionUserId: sessionUser?.id ?? null,
    hasUser: !!validatedUser,
    userId: validatedUser?.id ?? null,
    userError: userError?.message ?? null,
    profileFound: false,
    profileError: null,
    serviceKeyPresent: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  if (!user) return { ctx: null, debug };

  let { data: profile, error: profileSelectError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileSelectError) debug.profileError = `select: ${profileSelectError.message}`;

  // Self-heal: user existed before trigger was installed.
  if (!profile) {
    try {
      const service = createServiceClient();
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Pengguna";
      const { data: created, error: insertError } = await service
        .from("profiles")
        .insert({ id: user.id, full_name: fullName, email: user.email ?? "" })
        .select()
        .single();
      if (insertError) {
        debug.profileError = `insert: ${insertError.message}`;
      }
      profile = created;
    } catch (e) {
      debug.profileError = `throw: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  if (!profile) return { ctx: null, debug };
  debug.profileFound = true;

  const { data: membership } = await supabase
    .from("family_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let family: Family | null = null;
  if (membership) {
    const { data: famRow } = await supabase
      .from("families")
      .select("*")
      .eq("id", membership.family_id)
      .maybeSingle();
    family = famRow ?? null;
  }

  const ctx: AuthContext = {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    membership: membership ?? null,
    family,
    isAdmin: membership?.role === "admin",
  };

  return { ctx, debug };
}

export async function getAuthContext(): Promise<AuthContext | null> {
  const { ctx } = await getAuthContextWithDebug();
  return ctx;
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("AUTH_REQUIRED");
  return ctx;
}

export async function requireFamily(): Promise<AuthContext & { family: Family; membership: FamilyMember }> {
  const ctx = await requireAuth();
  if (!ctx.family || !ctx.membership) redirect("/dashboard");
  return ctx as AuthContext & { family: Family; membership: FamilyMember };
}

export async function requireAdmin() {
  const ctx = await requireFamily();
  if (!ctx.isAdmin) throw new Error("Hanya admin keluarga yang dapat melakukan aksi ini");
  return ctx;
}

export async function logActivity(opts: {
  familyId: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const service = createServiceClient();
  await service.from("activity_logs").insert({
    family_id: opts.familyId,
    actor_id: opts.actorId,
    action: opts.action,
    entity_type: opts.entityType,
    entity_id: opts.entityId ?? null,
    metadata: opts.metadata ?? null,
  });
}
