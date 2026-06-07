import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateShortID, formatTimeID, daysUntil } from "@/lib/utils";
import { TASK_STATUS_LABEL } from "@/lib/types";
import OnboardingForms from "../../onboarding/forms";

export default async function DashboardPage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  // No family yet — show onboarding inline (no extra redirect needed).
  if (!auth.family || !auth.membership) {
    return (
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Halo, {auth.profile.full_name}!</h1>
          <p className="mt-1 text-sm text-slate-600">Untuk memulai, buat keluarga baru atau gabung dengan kode undangan.</p>
        </div>
        <OnboardingForms />
      </div>
    );
  }

  const ctx = auth as typeof auth & { family: NonNullable<typeof auth.family>; membership: NonNullable<typeof auth.membership> };
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: memberCount },
    { data: upcomingEvents },
    { data: activeTasks },
    { data: recentNotes },
    { data: dueSoonTasks },
  ] = await Promise.all([
    supabase.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", ctx.family.id),
    supabase.from("events").select("*").eq("family_id", ctx.family.id).gte("event_date", today).order("event_date").limit(5),
    supabase.from("tasks").select("*").eq("family_id", ctx.family.id).neq("status", "selesai").order("deadline", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("notes").select("*").eq("family_id", ctx.family.id).order("created_at", { ascending: false }).limit(3),
    supabase.from("tasks").select("*").eq("family_id", ctx.family.id).neq("status", "selesai").not("deadline", "is", null).lte("deadline", new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)),
  ]);

  const reminders: { kind: string; title: string; date: string; href: string }[] = [];
  upcomingEvents?.slice(0, 3).forEach((e) => {
    const d = daysUntil(e.event_date);
    if (d <= 7) reminders.push({ kind: "event", title: e.title, date: `${d === 0 ? "Hari ini" : d === 1 ? "Besok" : `${d} hari lagi`} - ${formatDateShortID(e.event_date)}`, href: "/events" });
  });
  dueSoonTasks?.slice(0, 3).forEach((t) => {
    const d = daysUntil(t.deadline!);
    reminders.push({ kind: "task", title: t.task_name, date: `Deadline ${d <= 0 ? "hari ini" : `${d} hari lagi`}`, href: "/tasks" });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Selamat datang, {ctx.profile.full_name.split(" ")[0]}!</h1>
        <p className="mt-1 text-sm text-slate-600">Ringkasan aktivitas {ctx.family.family_name}.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Anggota Keluarga" value={memberCount ?? 0} icon="👨‍👩‍👧" href="/family" />
        <StatCard label="Tugas Aktif" value={activeTasks?.length ?? 0} icon="✅" href="/tasks" />
        <StatCard label="Acara Mendatang" value={upcomingEvents?.length ?? 0} icon="📅" href="/events" />
        <StatCard label="Catatan Terbaru" value={recentNotes?.length ?? 0} icon="📝" href="/notes" />
      </div>

      {reminders.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-lg">🔔</span>
            <h2 className="font-semibold text-amber-900">Pengingat</h2>
          </div>
          <div className="space-y-2">
            {reminders.map((r, i) => (
              <Link key={i} href={r.href} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 hover:bg-amber-100">
                <div>
                  <div className="text-sm font-medium text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-600">{r.date}</div>
                </div>
                <span className="text-xs text-amber-700">{r.kind === "event" ? "Acara" : "Tugas"}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Acara Mendatang</h2>
            <Link href="/events" className="text-sm text-indigo-600 hover:underline">Lihat semua</Link>
          </div>
          {upcomingEvents?.length ? (
            <ul className="space-y-3">
              {upcomingEvents.map((e) => (
                <li key={e.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <div className="text-xs font-medium">{new Date(e.event_date).toLocaleDateString("id-ID", { month: "short" })}</div>
                    <div className="text-lg font-bold leading-none">{new Date(e.event_date).getDate()}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {formatTimeID(e.event_time)} {e.location ? `· ${e.location}` : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Belum ada acara mendatang.</p>
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Tugas Aktif</h2>
            <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">Lihat semua</Link>
          </div>
          {activeTasks?.length ? (
            <ul className="space-y-2">
              {activeTasks.map((t) => (
                <li key={t.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-900">{t.task_name}</span>
                    <span className={`badge ${t.status === "sedang_dikerjakan" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                      {TASK_STATUS_LABEL[t.status as keyof typeof TASK_STATUS_LABEL]}
                    </span>
                  </div>
                  {t.deadline && <div className="mt-1 text-xs text-slate-500">Deadline: {formatDateShortID(t.deadline)}</div>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Tidak ada tugas aktif.</p>
          )}
        </div>
      </div>

      {recentNotes && recentNotes.length > 0 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Catatan Terbaru</h2>
            <Link href="/notes" className="text-sm text-indigo-600 hover:underline">Lihat semua</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {recentNotes.map((n) => (
              <div key={n.id} className="rounded-lg border border-slate-100 bg-yellow-50 p-3">
                <div className="font-medium text-slate-900">{n.title}</div>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, href }: { label: string; value: number; icon: string; href: string }) {
  return (
    <Link href={href} className="card hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">{value}</div>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Link>
  );
}
