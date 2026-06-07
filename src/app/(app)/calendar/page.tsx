import Link from "next/link";
import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatTimeID } from "@/lib/utils";

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

  const supabase = await createClient();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("family_id", ctx.family.id)
    .gte("event_date", `${monthStr}-01`)
    .lte("event_date", `${monthStr}-${String(daysInMonth).padStart(2, "0")}`)
    .order("event_date");

  const byDay = new Map<number, typeof events>();
  events?.forEach((e) => {
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
  const isToday = (d: number) => d === todayDate.getDate() && month === todayDate.getMonth() && year === todayDate.getFullYear();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kalender Keluarga</h1>
          <p className="mt-1 text-sm text-slate-600">Klik tanggal untuk melihat acara.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/calendar?m=${prevMonth}&y=${prevYear}`} className="btn btn-secondary">‹</Link>
          <div className="min-w-[180px] text-center font-medium text-slate-900">{monthName}</div>
          <Link href={`/calendar?m=${nextMonth}&y=${nextYear}`} className="btn btn-secondary">›</Link>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500">{d}</div>
          ))}
          {cells.map((d, i) => (
            <div key={i} className={`min-h-24 rounded-lg border p-2 ${d ? "border-slate-100 bg-white" : "border-transparent bg-slate-50"} ${d && isToday(d) ? "ring-2 ring-indigo-500" : ""}`}>
              {d && (
                <>
                  <div className={`text-xs font-medium ${isToday(d) ? "text-indigo-600" : "text-slate-700"}`}>{d}</div>
                  <div className="mt-1 space-y-1">
                    {(byDay.get(d) ?? []).slice(0, 3).map((e) => (
                      <div key={e.id} className="truncate rounded bg-indigo-100 px-1.5 py-0.5 text-[11px] text-indigo-800" title={e.title}>
                        {e.event_time && <span className="font-medium">{formatTimeID(e.event_time)} </span>}
                        {e.title}
                      </div>
                    ))}
                    {(byDay.get(d)?.length ?? 0) > 3 && (
                      <div className="text-[10px] text-slate-500">+{byDay.get(d)!.length - 3} lainnya</div>
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
