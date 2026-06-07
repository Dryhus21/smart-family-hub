import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import FamilyClient from "./client";
import { removeMemberAction, revokeInviteAction } from "./actions";

export default async function FamilyPage() {
  const ctx = await requireFamily();
  const supabase = await createClient();
  const [{ data: members }, { data: invites }] = await Promise.all([
    supabase
      .from("family_members")
      .select("id, user_id, role, joined_at, profile:profiles(id, full_name, email)")
      .eq("family_id", ctx.family.id)
      .order("joined_at"),
    ctx.isAdmin
      ? supabase
          .from("family_invitations")
          .select("*")
          .eq("family_id", ctx.family.id)
          .eq("status", "pending")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as { id: string; email: string; token: string; created_at: string }[] }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{ctx.family.family_name}</h1>
        {ctx.family.description && <p className="mt-1 text-sm text-slate-600">{ctx.family.description}</p>}
      </div>

      {ctx.isAdmin && <FamilyClient family={ctx.family} />}

      <section className="card">
        <h2 className="mb-4 font-semibold text-slate-900">Anggota Keluarga ({members?.length ?? 0})</h2>
        <ul className="divide-y divide-slate-100">
          {(members as unknown as { id: string; user_id: string; role: string; joined_at: string; profile: { full_name: string; email: string } }[])?.map((m) => (
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
                    <button className="text-xs text-red-600 hover:underline" type="submit">Keluarkan</button>
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
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-2 py-3">
                <div>
                  <div className="font-medium text-slate-900">{inv.email}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500 break-all">{inv.token}</div>
                </div>
                <form action={revokeInviteAction}>
                  <input type="hidden" name="id" value={inv.id} />
                  <button className="text-xs text-red-600 hover:underline" type="submit">Batalkan</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
