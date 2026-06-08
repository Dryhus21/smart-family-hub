import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatTimeID } from "@/lib/utils";
import { Icon } from "@/components/Icon";

type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  created_by: string;
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ m?: string; y?: string }> }) {
  const ctx = await requireFamily();
  const sp = await searchParams;
  const now = new Date();
  const month = sp.m ? parseInt(sp.m) : now.getMonth();
  const year = sp.y ? parseInt(sp.y) : now.getFullYear();

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const service = createServiceClient();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { data: events } = await service
    .from("events")
    .select("id, title, event_date, event_time, created_by")
    .eq("family_id", ctx.family.id)
    .gte("event_date", `${monthStr}-01`)
    .lte("event_date", `${monthStr}-${String(daysInMonth).padStart(2, "0")}`)
    .order("event_date");

  const evs = (events ?? []) as CalendarEvent[];

  const creatorIds = Array.from(new Set(evs.map((e) => e.created_by)));
  const { data: profileRows } = creatorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const nameMap = new Map<string, string>();
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => nameMap.set(p.id, p.full_name));
  const creatorLabel = (uid: string) => {
    const name = nameMap.get(uid) ?? "Anggota";
    return uid === ctx.userId ? `${name} (Anda)` : name;
  };

  const byDay = new Map<number, CalendarEvent[]>();
  evs.forEach((e) => {
    const d = new Date(e.event_date).getDate();
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(e);
  });

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const monthName = first.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const todayDate = new Date();
  const isToday = (d: number) =>
    d === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg-mobile tracking-tight">
            <span className="text-gradient">Kalender Keluarga</span>
          </h1>
          <p className="mt-2 text-on-surface-variant">Acara ditampilkan beserta nama pembuatnya.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-surface-container/60 p-1.5 backdrop-blur-lg">
          <Link href={`/calendar?m=${prevMonth}&y=${prevYear}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-primary">
            <Icon name="chevron_left" />
          </Link>
          <div className="min-w-[150px] text-center text-sm font-semibold uppercase tracking-wider text-on-surface">
            {monthName}
          </div>
          <Link href={`/calendar?m=${nextMonth}&y=${nextYear}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant hover:bg-white/5 hover:text-primary">
            <Icon name="chevron_right" />
          </Link>
        </div>
      </header>

      <div className="glass-card p-4">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((d) => (
            <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">{d}</div>
          ))}
          {cells.map((d, i) => (
            <div
              key={i}
              className={`min-h-28 rounded-lg border p-2 transition ${
                d ? "border-white/5 bg-surface-container-low/50 hover:bg-surface-container-low" : "border-transparent bg-transparent"
              } ${d && isToday(d) ? "border-primary/60 bg-primary-container/10 ring-1 ring-primary/40" : ""}`}
            >
              {d && (
                <>
                  <div className={`text-xs font-bold ${isToday(d) ? "text-primary" : "text-on-surface-variant"}`}>{d}</div>
                  <div className="mt-1 space-y-1">
                    {(byDay.get(d) ?? []).slice(0, 3).map((e) => (
                      <div
                        key={e.id}
                        className="rounded border border-primary/30 bg-primary-container/15 px-1.5 py-1 text-[10px] text-primary"
                        title={`${e.title} - oleh ${creatorLabel(e.created_by)}`}
                      >
                        <div className="truncate font-semibold">
                          {e.event_time && <span>{formatTimeID(e.event_time)} </span>}
                          {e.title}
                        </div>
                        <div className="truncate text-[9px] opacity-80">
                          <span className="material-symbols-outlined" style={{ fontSize: 9, verticalAlign: "middle" }}>person</span> {creatorLabel(e.created_by)}
                        </div>
                      </div>
                    ))}
                    {(byDay.get(d)?.length ?? 0) > 3 && (
                      <div className="text-[9px] font-semibold text-on-surface-variant">+{byDay.get(d)!.length - 3} lainnya</div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
