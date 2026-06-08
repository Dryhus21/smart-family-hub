import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import FamilyClient from "./client";
import { removeMemberAction, revokeInviteAction } from "./actions";

export default async function FamilyPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const [{ data: memberRows }, { data: invites }] = await Promise.all([
    service
      .from("family_members")
      .select("id, user_id, role, joined_at")
      .eq("family_id", ctx.family.id)
      .order("joined_at"),
    ctx.isAdmin
      ? service
          .from("family_invitations")
          .select("*")
          .eq("family_id", ctx.family.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { id: string; email: string; token: string; created_at: string }[] }),
  ]);

  const userIds = (memberRows ?? []).map((m: { user_id: string }) => m.user_id);
  const { data: profileRows } = userIds.length
    ? await service.from("profiles").select("id, full_name, email").in("id", userIds)
    : { data: [] as { id: string; full_name: string; email: string }[] };

  const profileMap = new Map<string, { full_name: string; email: string }>();
  (profileRows ?? []).forEach((p: { id: string; full_name: string; email: string }) => {
    profileMap.set(p.id, { full_name: p.full_name, email: p.email });
  });

  const members = (memberRows ?? []).map((m: { id: string; user_id: string; role: string; joined_at: string }) => ({
    ...m,
    profile: profileMap.get(m.user_id) ?? { full_name: "(profil tidak ditemukan)", email: "" },
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">{ctx.family.family_name}</span>
        </h1>
        {ctx.family.description && <p className="mt-2 text-on-surface-variant">{ctx.family.description}</p>}
      </header>

      {ctx.isAdmin && <FamilyClient family={ctx.family} />}

      <section className="glass-card neon-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-headline-md text-primary">
          <Icon name="groups" filled /> Anggota Keluarga ({members.length})
        </h2>
        <ul className="divide-y divide-white/5">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-primary/50 bg-primary-container/30 font-bold text-primary">
                  {m.profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-on-surface">
                    {m.profile.full_name} {m.user_id === ctx.userId && <span className="text-xs font-normal text-on-surface-variant">(Anda)</span>}
                  </div>
                  <div className="text-xs text-on-surface-variant">{m.profile.email} · Bergabung {formatDateShortID(m.joined_at)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${m.role === "admin" ? "bg-primary-container/30 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
                  {m.role === "admin" && <Icon name="shield" className="text-xs" />}
                  {m.role === "admin" ? "Admin" : "Anggota"}
                </span>
                {ctx.isAdmin && m.user_id !== ctx.userId && (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="user_id" value={m.user_id} />
                    <SubmitButton className="rounded-lg p-2 text-on-surface-variant hover:bg-danger-red/10 hover:text-danger-red" pendingLabel="">
                      <Icon name="person_remove" className="text-base" />
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {ctx.isAdmin && invites && invites.length > 0 && (
        <section className="glass-card p-6">
          <h2 className="mb-4 flex items-center gap-2 text-headline-md">
            <Icon name="schedule_send" /> Undangan Tertunda ({invites.length})
          </h2>
          <ul className="divide-y divide-white/5">
            {invites.map((inv: { id: string; email: string; token: string }) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 py-3">
                <div className="flex-1 overflow-hidden">
                  <div className="font-semibold text-on-surface">{inv.email}</div>
                  <div className="mt-1 break-all rounded bg-surface-container-low px-2 py-1 font-mono text-xs text-on-surface-variant">{inv.token}</div>
                </div>
                <form action={revokeInviteAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <SubmitButton className="btn btn-ghost text-xs text-danger-red hover:bg-danger-red/10" pendingLabel="...">Batalkan</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
