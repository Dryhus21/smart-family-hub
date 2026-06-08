import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
import { Icon } from "@/components/Icon";
import NoteForm from "./form";
import { deleteNoteAction } from "./actions";

export default async function NotesPage() {
  const ctx = await requireFamily();
  const service = createServiceClient();

  const { data: notes } = await service
    .from("notes")
    .select("*")
    .eq("family_id", ctx.family.id)
    .order("created_at", { ascending: false });

  const creatorIds = Array.from(new Set((notes ?? []).map((n: { created_by: string }) => n.created_by)));
  const { data: profileRows } = creatorIds.length
    ? await service.from("profiles").select("id, full_name").in("id", creatorIds)
    : { data: [] as { id: string; full_name: string }[] };
  const nameMap = new Map<string, string>();
  (profileRows ?? []).forEach((p: { id: string; full_name: string }) => nameMap.set(p.id, p.full_name));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-display-lg-mobile tracking-tight">
          <span className="text-gradient">Catatan Keluarga</span>
        </h1>
        <p className="mt-2 text-on-surface-variant">Resep, daftar belanja, dan pengingat bersama.</p>
      </header>

      <NoteForm />

      {notes && notes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(notes as { id: string; title: string; content: string; created_by: string; created_at: string }[]).map((n) => {
            const author = nameMap.get(n.created_by) ?? "Anggota";
            const canDelete = ctx.userId === n.created_by || ctx.isAdmin;
            return (
              <div key={n.id} className="glass-card neon-card flex flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container/30 text-secondary">
                    <Icon name="sticky_note_2" filled className="text-base" />
                  </div>
                  {canDelete && (
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <SubmitButton className="rounded-lg p-1.5 text-on-surface-variant hover:bg-danger-red/10 hover:text-danger-red" pendingLabel="">
                        <Icon name="delete" className="text-base" />
                      </SubmitButton>
                    </form>
                  )}
                </div>
                <h3 className="mt-3 font-bold text-on-surface">{n.title}</h3>
                <p className="mt-2 flex-1 whitespace-pre-wrap text-sm text-on-surface-variant">{n.content}</p>
                <div className="mt-4 border-t border-white/10 pt-3 text-xs text-on-surface-variant">
                  <Icon name="person" className="text-xs" /> {author} · {formatDateShortID(n.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-sm text-on-surface-variant">
          <Icon name="note_alt" className="text-3xl" />
          <p className="mt-2">Belum ada catatan. Buat catatan pertama Anda!</p>
        </div>
      )}
    </div>
  );
}
