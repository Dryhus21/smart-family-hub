import "server-only";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
  if (!ctx) throw new Error("Tidak terautentikasi");
  return ctx;
}

export async function requireFamily(): Promise<AuthContext & { family: Family; membership: FamilyMember }> {
  const ctx = await requireAuth();
  if (!ctx.family || !ctx.membership) throw new Error("Belum bergabung ke keluarga");
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
