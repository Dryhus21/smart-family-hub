import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const ACTION_LABEL: Record<string, string> = {
  create_family: "membuat keluarga",
  join_family: "bergabung ke keluarga",
  invite_member: "mengundang anggota baru",
  remove_member: "mengeluarkan anggota",
  leave_family: "meninggalkan keluarga",
  update_family: "memperbarui profil keluarga",
  create_event: "menambahkan acara",
  delete_event: "menghapus acara",
  create_task: "membuat tugas",
  update_task_status: "memperbarui status tugas",
  delete_task: "menghapus tugas",
  create_note: "membuat catatan",
  delete_note: "menghapus catatan",
};

function relTime(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return "baru saja";
  if (d < 3600) return `${Math.floor(d / 60)} menit lalu`;
  if (d < 86400) return `${Math.floor(d / 3600)} jam lalu`;
  if (d < 2592000) return `${Math.floor(d / 86400)} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID");
}

export default async function ActivityPage() {
  const ctx = await requireFamily();
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*, actor:profiles(full_name)")
    .eq("family_id", ctx.family.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Aktivitas</h1>
        <p className="mt-1 text-sm text-slate-600">100 aktivitas terbaru keluarga.</p>
      </div>
      <div className="card">
        {logs?.length ? (
          <ul className="divide-y divide-slate-100">
            {(logs as unknown as { id: string; actor: { full_name: string } | null; action: string; metadata: Record<string, unknown> | null; created_at: string }[]).map((l) => {
              const name = l.actor?.full_name ?? "Seseorang";
              const action = ACTION_LABEL[l.action] ?? l.action;
              const detail = (l.metadata && (l.metadata.title || l.metadata.name || l.metadata.email)) ?? "";
              return (
                <li key={l.id} className="flex items-start gap-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900">
                      <strong>{name}</strong> {action}
                      {detail ? <> "<em>{String(detail)}</em>"</> : null}
                    </div>
                    <div className="text-xs text-slate-500">{relTime(l.created_at)}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">Belum ada aktivitas tercatat.</p>
        )}
      </div>
    </div>
  );
}
