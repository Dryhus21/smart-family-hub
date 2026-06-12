import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import EventsClient from "./EventsClient";
import type { Event } from "@/lib/types";

export default async function EventsPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const { data: events } = await service
    .from("events")
    .select("*")
    .eq("family_id", ctx.family.id)
    .order("event_date", { ascending: true });

  const evs = (events ?? []) as Event[];

  const creatorIds = Array.from(new Set(evs.map((e) => e.created_by)));
  const { data: profileRows } = creatorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const nameMap: Record<string, string> = {};
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => { nameMap[p.id] = p.full_name; });
  const creatorLabel = (uid: string) => {
    const name = nameMap[uid] ?? "Anggota";
    return uid === ctx.userId ? `${name} (Anda)` : name;
  };

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = evs
    .filter((e) => e.event_date >= today)
    .map((e) => ({ ...e, creatorLabel: creatorLabel(e.created_by) }));
  const past = evs
    .filter((e) => e.event_date < today)
    .map((e) => ({ ...e, creatorLabel: creatorLabel(e.created_by) }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">Acara Keluarga</span>
        </h1>
        <p className="mt-2 text-on-surface-variant">Kelola seluruh jadwal dan acara keluarga.</p>
      </header>

      <EventsClient
        upcoming={upcoming}
        past={past}
        userId={ctx.userId}
        isAdmin={ctx.isAdmin}
      />
    </div>
  );
}
