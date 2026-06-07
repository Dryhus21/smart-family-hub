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

export async function getAuthContext(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp?.user;
  if (!user) return null;

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Self-heal: user existed before trigger was installed.
  if (!profile) {
    const service = createServiceClient();
    const fullName =
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Pengguna";
    const { data: created } = await service
      .from("profiles")
      .insert({ id: user.id, full_name: fullName, email: user.email ?? "" })
      .select()
      .single();
    profile = created;
  }

  if (!profile) return null;

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

  return {
    userId: user.id,
    email: user.email ?? profile.email,
    profile,
    membership: membership ?? null,
    family,
    isAdmin: membership?.role === "admin",
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  // Don't redirect — the middleware should already have caught this.
  // If we got here without a session, it's a server-side action call; throw.
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
