import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { Icon } from "@/components/Icon";
import CalendarGrid from "./CalendarGrid";

type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
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
    .select("id, title, event_date, event_time, location, description, created_by")
    .eq("family_id", ctx.family.id)
    .gte("event_date", `${monthStr}-01`)
    .lte("event_date", `${monthStr}-${String(daysInMonth).padStart(2, "0")}`)
    .order("event_date");

  const evs = (events ?? []) as CalendarEvent[];

  const creatorIds = Array.from(new Set(evs.map((e) => e.created_by)));
  const { data: profileRows } = creatorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const nameMapObj: Record<string, string> = {};
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => { nameMapObj[p.id] = p.full_name; });
  const creatorLabels: Record<string, string> = {};
  evs.forEach((e) => {
    if (!(e.created_by in creatorLabels)) {
      const name = nameMapObj[e.created_by] ?? "Anggota";
      creatorLabels[e.created_by] = e.created_by === ctx.userId ? `${name} (Anda)` : name;
    }
  });

  const byDayMap = new Map<number, CalendarEvent[]>();
  evs.forEach((e) => {
    const d = new Date(e.event_date).getDate();
    if (!byDayMap.has(d)) byDayMap.set(d, []);
    byDayMap.get(d)!.push(e);
  });
  const byDay = Object.fromEntries(byDayMap);

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

      <CalendarGrid
        cells={cells}
        byDay={byDay}
        todayDay={todayDate.getDate()}
        todayMonth={todayDate.getMonth()}
        todayYear={todayDate.getFullYear()}
        viewMonth={month}
        viewYear={year}
        dayNames={dayNames}
        creatorLabels={creatorLabels}
      />
    </div>
  );
}
