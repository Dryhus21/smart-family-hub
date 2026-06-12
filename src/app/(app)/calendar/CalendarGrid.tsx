"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { formatDateID, formatTimeID } from "@/lib/utils";

type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  created_by: string;
};

type Props = {
  cells: (number | null)[];
  byDay: Record<number, CalendarEvent[]>;
  todayDay: number;
  todayMonth: number;
  todayYear: number;
  viewMonth: number;
  viewYear: number;
  dayNames: string[];
  creatorLabel: (uid: string) => string;
};

export default function CalendarGrid({ cells, byDay, todayDay, todayMonth, todayYear, viewMonth, viewYear, dayNames, creatorLabel }: Props) {
  const isToday = (d: number) =>
    d === todayDay && viewMonth === todayMonth && viewYear === todayYear;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const selectedEvents = selectedDay ? (byDay[selectedDay] ?? []) : [];

  return (
    <div className="glass-card p-4">
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant"
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => (
          <button
            key={i}
            type="button"
            disabled={!d}
            onClick={() => d && setSelectedDay(selectedDay === d ? null : d)}
            className={`min-h-20 rounded-lg border p-2 text-left transition ${
              d
                ? "border-white/5 bg-surface-container-low/50 hover:bg-surface-container-low cursor-pointer"
                : "border-transparent bg-transparent cursor-default"
            } ${
              d && isToday(d)
                ? "border-primary/60 bg-primary-container/10 ring-1 ring-primary/40"
                : ""
            } ${
              d && selectedDay === d
                ? "!border-primary/70 !bg-primary-container/20 ring-2 ring-primary/50"
                : ""
            }`}
          >
            {d && (
              <>
                <div
                  className={`text-xs font-bold ${
                    isToday(d) ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  {d}
                </div>
                <div className="mt-1 space-y-1">
                  {(byDay[d] ?? []).slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className="rounded border border-primary/30 bg-primary-container/15 px-1.5 py-1 text-[10px] text-primary"
                    >
                      <div className="truncate font-semibold">
                        {e.event_time && <span>{formatTimeID(e.event_time)} </span>}
                        {e.title}
                      </div>
                    </div>
                  ))}
                  {(byDay[d]?.length ?? 0) > 3 && (
                    <div className="text-[9px] font-semibold text-on-surface-variant">
                      +{byDay[d].length - 3} lainnya
                    </div>
                  )}
                </div>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Popup detail acara */}
      {selectedDay !== null && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary-container/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-primary">
              <Icon name="event" className="text-base" />
              Acara {selectedDay && formatDateLabel(selectedDay)}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="rounded-lg p-1 text-on-surface-variant hover:bg-white/30 hover:text-on-surface"
              aria-label="Tutup"
            >
              <Icon name="close" className="text-base" />
            </button>
          </div>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-on-surface-variant">Tidak ada acara hari ini.</p>
          ) : (
            <ul className="space-y-3">
              {selectedEvents.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-white/60 bg-white/70 px-4 py-3"
                >
                  <div className="font-semibold text-on-surface">{e.title}</div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-on-surface-variant">
                    {e.event_time && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="schedule" className="text-sm" />
                        {formatTimeID(e.event_time)}
                      </span>
                    )}
                    {e.location && (
                      <span className="inline-flex items-center gap-1">
                        <Icon name="location_on" className="text-sm" />
                        {e.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Icon name="person" className="text-sm" />
                      {creatorLabel(e.created_by)}
                    </span>
                  </div>
                  {e.description && (
                    <p className="mt-2 text-sm text-on-surface">{e.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatDateLabel(day: number) {
  return `${day}`;
}
