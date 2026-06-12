import Link from "next/link";
import { getAuthContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID, formatTimeID, daysUntil } from "@/lib/utils";
import { TASK_STATUS_LABEL } from "@/lib/types";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import { createFamilyAction, joinByTokenAction } from "../../onboarding/actions";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ mode?: string; err?: string }> }) {
  const auth = await getAuthContext();
  const sp = await searchParams;

  if (!auth) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <div className="glass-card neon-card p-8">
          <Icon name="lock_clock" className="text-4xl text-primary" />
          <h1 className="mt-3 text-xl font-extrabold">Sesi Berakhir</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Silakan login kembali untuk melanjutkan.</p>
          <Link href="/login" className="btn btn-primary mt-6 inline-flex px-6 py-3">
            <Icon name="login" className="text-base" /> Masuk
          </Link>
        </div>
      </div>
    );
  }

  if (!auth.family || !auth.membership) {
    const mode = sp.mode === "join" ? "join" : "create";
    const errorMsg = sp.err ? decodeURIComponent(sp.err) : null;
    return (
      <div className="py-6">
        <div className="mb-6 text-center">
          <h1 className="text-display-lg-mobile">Halo, <span className="text-gradient">{auth.profile.full_name}!</span></h1>
          <p className="mt-2 text-on-surface-variant">Untuk memulai, buat keluarga baru atau gabung dengan kode undangan.</p>
        </div>

        <div className="glass-card neon-card mx-auto max-w-2xl p-6">
          <div className="mb-6 flex gap-2 rounded-lg border border-white/10 bg-surface-container-low p-1">
            <Link
              href="/dashboard?mode=create"
              className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition ${
                mode === "create" ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Buat Keluarga Baru
            </Link>
            <Link
              href="/dashboard?mode=join"
              className={`flex-1 rounded-md px-4 py-2 text-center text-sm font-semibold transition ${
                mode === "join" ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(99,102,241,0.5)]" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Gabung dengan Kode
            </Link>
          </div>

          {errorMsg && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger-red/40 bg-danger-red/10 px-3 py-2 text-sm text-danger-red">
              <Icon name="error" className="text-base" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === "create" ? (
            <form action={createFamilySubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="family_name">Nama Keluarga</label>
                <input className="input" id="family_name" name="family_name" type="text" placeholder="Keluarga Damingtyas" required />
              </div>
              <div>
                <label className="label" htmlFor="description">Deskripsi (opsional)</label>
                <textarea className="input min-h-24" id="description" name="description" placeholder="Ceritakan singkat tentang keluarga Anda" />
              </div>
              <SubmitButton className="btn btn-primary w-full py-3" pendingLabel="Membuat keluarga...">
                <Icon name="add_home" className="text-base" /> Buat Keluarga
              </SubmitButton>
              <p className="text-center text-xs text-on-surface-variant">Anda akan otomatis menjadi <strong className="text-primary">Admin</strong> keluarga ini.</p>
            </form>
          ) : (
            <form action={joinSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="token">Kode Undangan</label>
                <input className="input font-mono" id="token" name="token" type="text" placeholder="Tempel kode undangan di sini" required />
                <p className="mt-1.5 text-xs text-on-surface-variant">Kode didapat dari admin keluarga setelah mereka mengundang email Anda.</p>
              </div>
              <SubmitButton className="btn btn-primary w-full py-3" pendingLabel="Memproses...">
                <Icon name="login" className="text-base" /> Gabung Keluarga
              </SubmitButton>
            </form>
          )}
        </div>
      </div>
    );
  }

  const ctx = auth as typeof auth & { family: NonNullable<typeof auth.family>; membership: NonNullable<typeof auth.membership> };
  const service = createServiceClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    { count: memberCount },
    { data: upcomingEvents },
    { data: activeTasks },
    { data: recentNotes },
    { data: dueSoonTasks },
  ] = await Promise.all([
    service.from("family_members").select("*", { count: "exact", head: true }).eq("family_id", ctx.family.id),
    service.from("events").select("*").eq("family_id", ctx.family.id).gte("event_date", today).order("event_date").limit(5),
    service.from("tasks").select("*").eq("family_id", ctx.family.id).neq("status", "selesai").order("deadline", { ascending: true, nullsFirst: false }).limit(5),
    service.from("notes").select("*").eq("family_id", ctx.family.id).order("created_at", { ascending: false }).limit(3),
    service.from("tasks").select("*").eq("family_id", ctx.family.id).neq("status", "selesai").not("deadline", "is", null).lte("deadline", new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)),
  ]);

  const reminders: { kind: string; title: string; date: string; href: string }[] = [];
  upcomingEvents?.slice(0, 3).forEach((e: { title: string; event_date: string }) => {
    const d = daysUntil(e.event_date);
    if (d <= 7) reminders.push({ kind: "event", title: e.title, date: `${d === 0 ? "Hari ini" : d === 1 ? "Besok" : `${d} hari lagi`} · ${formatDateShortID(e.event_date)}`, href: "/events" });
  });
  dueSoonTasks?.slice(0, 3).forEach((t: { task_name: string; deadline: string }) => {
    const d = daysUntil(t.deadline);
    reminders.push({ kind: "task", title: t.task_name, date: `Deadline ${d <= 0 ? "hari ini" : `${d} hari lagi`}`, href: "/tasks" });
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display-lg-mobile md:text-display-lg tracking-tight">
            Selamat datang, <span className="text-gradient">{ctx.profile.full_name.split(" ")[0]}!</span>
          </h1>
          <p className="mt-2 text-on-surface-variant">Ringkasan aktivitas {ctx.family.family_name}.</p>
        </div>
        <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-primary/60 bg-primary-container/30 font-bold text-primary md:flex overflow-hidden">
          {ctx.profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={ctx.profile.avatar_url} alt={ctx.profile.full_name} className="h-full w-full object-cover" />
          ) : (
            ctx.profile.full_name.charAt(0).toUpperCase()
          )}
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Anggota Keluarga" value={memberCount ?? 0} icon="group" color="primary" href="/family" hint="Semua Aktif" />
        <StatCard label="Tugas Aktif" value={activeTasks?.length ?? 0} icon="check_circle" color="tertiary" href="/tasks" hint={`${dueSoonTasks?.length ?? 0} Perlu Perhatian`} />
        <StatCard label="Acara Mendatang" value={upcomingEvents?.length ?? 0} icon="event_upcoming" color="secondary" href="/events" hint={`${upcomingEvents?.length ?? 0} terjadwal`} />
        <StatCard label="Catatan Terbaru" value={recentNotes?.length ?? 0} icon="note_alt" color="success-green" href="/notes" hint="Catatan terbaru" />
      </div>

      {/* Reminder */}
      {reminders.length > 0 && (
        <div className="glass-card neon-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="notifications_active" className="text-primary" filled />
            <h2 className="text-headline-md text-primary">Pengingat</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-3">
            {reminders.map((r, i) => (
              <Link key={i} href={r.href} className="group flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-surface-container/60 px-3 py-2 transition hover:border-primary/40 hover:bg-surface-container">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-on-surface">{r.title}</div>
                  <div className="truncate text-xs text-on-surface-variant">{r.date}</div>
                </div>
                <span className={`badge ${r.kind === "event" ? "bg-secondary-container/30 text-secondary" : "bg-tertiary-container/30 text-tertiary"}`}>
                  {r.kind === "event" ? "Acara" : "Tugas"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Two-column main area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md">Acara Mendatang</h3>
            <Link href="/events" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-fixed-dim">
              Lihat Semua <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>

          {upcomingEvents && upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {(upcomingEvents as { id: string; title: string; event_date: string; event_time: string | null; location: string | null }[]).map((e, i) => (
                <div key={e.id} className={i === 0 ? "neon-card flex gap-4 bg-surface-container/50 p-5" : "glass-card flex gap-4 p-5"}>
                  <div className="flex min-w-[60px] flex-col items-center justify-center rounded-lg border border-white/5 bg-surface-container-high p-2">
                    <span className="text-xs font-bold uppercase text-on-surface-variant">{new Date(e.event_date).toLocaleDateString("id-ID", { month: "short" })}</span>
                    <span className="text-2xl font-extrabold text-primary">{new Date(e.event_date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-on-surface">{e.title}</h4>
                      {i === 0 && (
                        <span className="rounded-full border border-danger-red/30 bg-danger-red/20 px-2 py-0.5 text-[10px] font-bold text-danger-red shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                          MENDATANG
                        </span>
                      )}
                    </div>
                    {e.event_time && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                        <Icon name="schedule" className="text-sm" /> {formatTimeID(e.event_time)}
                      </p>
                    )}
                    {e.location && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-on-surface-variant">
                        <Icon name="location_on" className="text-sm" /> {e.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-6 text-center text-sm text-on-surface-variant">
              <Icon name="event_busy" className="text-3xl text-on-surface-variant" />
              <p className="mt-2">Belum ada acara mendatang.</p>
            </div>
          )}
        </section>

        <section className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md">Tugas Aktif</h3>
            <Link href="/tasks" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-fixed-dim">
              Lihat <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          <div className="glass-card overflow-hidden">
            {activeTasks && activeTasks.length > 0 ? (
              (activeTasks as { id: string; task_name: string; status: string; deadline: string | null }[]).map((t, i) => {
                const overdue = t.deadline && daysUntil(t.deadline) < 0;
                return (
                  <div key={t.id} className={`flex items-center gap-3 px-4 py-3 transition hover:bg-white/5 ${i > 0 ? "border-t border-white/5" : ""}`}>
                    <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/50">
                      {t.status === "selesai" && <Icon name="check" className="text-xs text-primary" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-on-surface">{t.task_name}</p>
                      <p className={`text-[10px] mt-0.5 ${overdue ? "text-danger-red" : "text-on-surface-variant"}`}>
                        {t.deadline ? `Deadline ${formatDateShortID(t.deadline)}` : TASK_STATUS_LABEL[t.status as keyof typeof TASK_STATUS_LABEL]}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
                <Icon name="checklist" className="text-3xl text-on-surface-variant" />
                <p className="mt-2">Tidak ada tugas aktif.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Recent notes */}
      {recentNotes && recentNotes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-headline-md">Catatan Terbaru</h3>
            <Link href="/notes" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-fixed-dim">
              Lihat <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {(recentNotes as { id: string; title: string; content: string }[]).map((n) => (
              <div key={n.id} className="glass-card neon-card p-4">
                <Icon name="sticky_note_2" className="text-secondary" />
                <div className="mt-2 font-bold text-on-surface">{n.title}</div>
                <p className="mt-1 line-clamp-3 text-sm text-on-surface-variant">{n.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, href, hint }: { label: string; value: number; icon: string; color: string; href: string; hint?: string }) {
  const colorClass: Record<string, { text: string; glow: string }> = {
    primary: { text: "text-primary", glow: "bg-primary/10 group-hover:bg-primary/20" },
    tertiary: { text: "text-tertiary", glow: "bg-tertiary/10 group-hover:bg-tertiary/20" },
    secondary: { text: "text-secondary", glow: "bg-secondary/10 group-hover:bg-secondary/20" },
    "success-green": { text: "text-success-green", glow: "bg-success-green/10 group-hover:bg-success-green/20" },
  };
  const c = colorClass[color] ?? colorClass.primary;
  return (
    <Link href={href} className="glass-card group relative flex flex-col gap-1 overflow-hidden p-4 transition hover:border-white/20">
      <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full blur-xl transition-all ${c.glow}`} />
      <div className="flex items-center gap-2 text-on-surface-variant">
        <Icon name={icon} className={`text-sm ${c.text}`} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">{label}</span>
      </div>
      <div className="text-3xl font-extrabold text-on-surface">{value}</div>
      {hint && <div className="text-[11px] text-on-surface-variant">{hint}</div>}
    </Link>
  );
}

async function createFamilySubmit(formData: FormData) {
  "use server";
  const result = await createFamilyAction({}, formData);
  if (result?.error) {
    redirect(`/dashboard?mode=create&err=${encodeURIComponent(result.error)}`);
  }
}

async function joinSubmit(formData: FormData) {
  "use server";
  const result = await joinByTokenAction({}, formData);
  if (result?.error) {
    redirect(`/dashboard?mode=join&err=${encodeURIComponent(result.error)}`);
  }
}
