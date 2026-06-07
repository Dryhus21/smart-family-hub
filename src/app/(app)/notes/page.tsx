import { requireFamily } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import { SubmitButton } from "@/components/SubmitButton";
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catatan Keluarga</h1>
        <p className="mt-1 text-sm text-slate-600">Resep, daftar belanja, dan pengingat bersama.</p>
      </div>

      <NoteForm />

      {notes?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(notes as { id: string; title: string; content: string; created_by: string; created_at: string }[]).map((n) => {
            const author = nameMap.get(n.created_by) ?? "Anggota";
            const canDelete = ctx.userId === n.created_by || ctx.isAdmin;
            return (
              <div key={n.id} className="card border-yellow-200 bg-yellow-50">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{n.title}</h3>
                  {canDelete && (
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <SubmitButton className="text-xs text-red-600 hover:underline" pendingLabel="...">Hapus</SubmitButton>
                    </form>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{n.content}</p>
                <div className="mt-3 text-xs text-slate-500">
                  Oleh {author} · {formatDateShortID(n.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-sm text-slate-500">Belum ada catatan. Buat catatan pertama Anda!</div>
      )}
    </div>
  );
}
