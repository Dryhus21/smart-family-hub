import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import FamilyClient from "./client";
import { removeMemberAction, revokeInviteAction } from "./actions";

export default async function FamilyPage() {
  const ctx = await requireFamily();
  // Service client bypasses RLS so we can fetch member profiles reliably.
  // Authorization is enforced by requireFamily() above (user is in this family).
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{ctx.family.family_name}</h1>
        {ctx.family.description && <p className="mt-1 text-sm text-slate-600">{ctx.family.description}</p>}
      </div>

      {ctx.isAdmin && <FamilyClient family={ctx.family} />}

      <section className="card">
        <h2 className="mb-4 font-semibold text-slate-900">Anggota Keluarga ({members.length})</h2>
        <ul className="divide-y divide-slate-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                  {m.profile.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-slate-900">
                    {m.profile.full_name} {m.user_id === ctx.userId && <span className="text-xs text-slate-500">(Anda)</span>}
                  </div>
                  <div className="text-xs text-slate-500">{m.profile.email} · Bergabung {formatDateShortID(m.joined_at)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${m.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"}`}>
                  {m.role === "admin" ? "Admin" : "Anggota"}
                </span>
                {ctx.isAdmin && m.user_id !== ctx.userId && (
                  <form action={removeMemberAction}>
                    <input type="hidden" name="user_id" value={m.user_id} />
                    <SubmitButton className="text-xs text-red-600 hover:underline" pendingLabel="...">Keluarkan</SubmitButton>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {ctx.isAdmin && invites && invites.length > 0 && (
        <section className="card">
          <h2 className="mb-4 font-semibold text-slate-900">Undangan Tertunda ({invites.length})</h2>
          <ul className="divide-y divide-slate-100">
            {invites.map((inv: { id: string; email: string; token: string }) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-medium text-slate-900">{inv.email}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500 break-all">{inv.token}</div>
                </div>
                <form action={revokeInviteAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <SubmitButton className="text-xs text-red-600 hover:underline" pendingLabel="...">Batalkan</SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
