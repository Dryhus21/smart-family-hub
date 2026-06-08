import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateID, formatTimeID } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import EventForm from "./form";
import { deleteEventAction } from "./actions";

export default async function EventsPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const { data: events } = await service
    .from("events")
    .select("*")
    .eq("family_id", ctx.family.id)
    .order("event_date", { ascending: true });

  const creatorIds = Array.from(new Set((events ?? []).map((e: { created_by: string }) => e.created_by)));
  const { data: profileRows } = creatorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const nameMap = new Map<string, string>();
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => nameMap.set(p.id, p.full_name));

  const today = new Date().toISOString().slice(0, 10);
  const evs = (events ?? []) as { id: string; title: string; event_date: string; event_time: string | null; location: string | null; description: string | null; created_by: string }[];
  const upcoming = evs.filter((e) => e.event_date >= today);
  const past = evs.filter((e) => e.event_date < today);

  const renderCreator = (uid: string) => {
    const name = nameMap.get(uid) ?? "Anggota";
    return uid === ctx.userId ? `${name} (Anda)` : name;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">Acara Keluarga</span>
        </h1>
        <p className="mt-2 text-on-surface-variant">Kelola seluruh jadwal dan acara keluarga.</p>
      </header>

      <EventForm />

      <section>
        <h2 className="mb-3 text-headline-md flex items-center gap-2">
          <Icon name="upcoming" className="text-primary" /> Akan Datang ({upcoming.length})
        </h2>
        {upcoming.length ? (
          <ul className="space-y-3">
            {upcoming.map((e, i) => (
              <li key={e.id} className={i === 0 ? "neon-card flex items-start gap-4 bg-surface-container/50 p-5" : "glass-card flex items-start gap-4 p-5"}>
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl border border-white/10 bg-surface-container-high text-primary">
                  <div className="text-xs font-bold uppercase">{new Date(e.event_date).toLocaleDateString("id-ID", { month: "short" })}</div>
                  <div className="text-2xl font-extrabold leading-none">{new Date(e.event_date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-on-surface">{e.title}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1"><Icon name="event" className="text-sm" /> {formatDateID(e.event_date)}</span>
                    {e.event_time && <span className="inline-flex items-center gap-1"><Icon name="schedule" className="text-sm" /> {formatTimeID(e.event_time)}</span>}
                    {e.location && <span className="inline-flex items-center gap-1"><Icon name="location_on" className="text-sm" /> {e.location}</span>}
                  </div>
                  {e.description && <p className="mt-2 text-sm text-on-surface">{e.description}</p>}
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-2.5 py-1 text-xs text-on-surface-variant">
                    <Icon name="person" className="text-sm" /> Dibuat oleh: <span className="font-semibold text-on-surface">{renderCreator(e.created_by)}</span>
                  </div>
                </div>
                {(ctx.userId === e.created_by || ctx.isAdmin) && (
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <SubmitButton className="btn btn-ghost text-danger-red hover:bg-danger-red/10" pendingLabel="Menghapus...">
                      <Icon name="delete" className="text-base" />
                    </SubmitButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="glass-card p-8 text-center text-sm text-on-surface-variant">
            <Icon name="event_busy" className="text-3xl" />
            <p className="mt-2">Belum ada acara mendatang.</p>
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-headline-md flex items-center gap-2">
            <Icon name="history" className="text-on-surface-variant" /> Sudah Lewat ({past.length})
          </h2>
          <ul className="space-y-2">
            {past.map((e) => (
              <li key={e.id} className="glass-card flex items-center justify-between gap-3 p-4 opacity-70">
                <div>
                  <div className="font-semibold text-on-surface">{e.title}</div>
                  <div className="text-xs text-on-surface-variant">{formatDateID(e.event_date)} · oleh {renderCreator(e.created_by)}</div>
                </div>
                {(ctx.userId === e.created_by || ctx.isAdmin) && (
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <SubmitButton className="btn btn-ghost text-xs text-danger-red hover:bg-danger-red/10" pendingLabel="...">
                      <Icon name="delete" className="text-sm" />
                    </SubmitButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
