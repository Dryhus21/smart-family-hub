import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateID, formatTimeID } from "@/lib/utils";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Acara Keluarga</h1>
          <p className="mt-1 text-sm text-slate-600">Kelola seluruh jadwal dan acara keluarga.</p>
        </div>
      </div>

      <EventForm />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Akan Datang ({upcoming.length})</h2>
        {upcoming.length ? (
          <ul className="space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="card flex items-start gap-4">
                <div className="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <div className="text-xs font-medium">{new Date(e.event_date).toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}</div>
                  <div className="text-2xl font-bold leading-none">{new Date(e.event_date).getDate()}</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{e.title}</h3>
                  <div className="mt-1 text-sm text-slate-600">
                    {formatDateID(e.event_date)} {e.event_time && `· ${formatTimeID(e.event_time)}`}
                  </div>
                  {e.location && <div className="text-sm text-slate-600">📍 {e.location}</div>}
                  {e.description && <p className="mt-2 text-sm text-slate-700">{e.description}</p>}
                  <div className="mt-2 text-xs text-slate-500">Acara dibuat oleh: <span className="font-medium text-slate-700">{renderCreator(e.created_by)}</span></div>
                </div>
                {(ctx.userId === e.created_by || ctx.isAdmin) && (
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="btn btn-ghost text-red-600 hover:bg-red-50" type="submit">Hapus</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="card text-sm text-slate-500">Belum ada acara mendatang.</div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Sudah Lewat ({past.length})</h2>
          <ul className="space-y-2">
            {past.map((e) => (
              <li key={e.id} className="card flex items-center justify-between gap-3 opacity-70">
                <div>
                  <div className="font-medium text-slate-700">{e.title}</div>
                  <div className="text-xs text-slate-500">{formatDateID(e.event_date)} · oleh {renderCreator(e.created_by)}</div>
                </div>
                {(ctx.userId === e.created_by || ctx.isAdmin) && (
                  <form action={deleteEventAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className="btn btn-ghost text-red-600 hover:bg-red-50 text-xs" type="submit">Hapus</button>
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
