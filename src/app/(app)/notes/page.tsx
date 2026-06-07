import { requireFamily } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatDateShortID } from "@/lib/utils";
import NoteForm from "./form";
import { deleteNoteAction } from "./actions";

export default async function NotesPage() {
  const ctx = await requireFamily();
  const supabase = await createClient();
  const { data: notes } = await supabase
    .from("notes")
    .select("*, profile:profiles!notes_created_by_fkey(full_name)")
    .eq("family_id", ctx.family.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catatan Keluarga</h1>
        <p className="mt-1 text-sm text-slate-600">Resep, daftar belanja, dan pengingat bersama.</p>
      </div>

      <NoteForm />

      {notes?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n) => {
            const author = (n as unknown as { profile: { full_name: string } | null }).profile?.full_name ?? "?";
            const canDelete = ctx.userId === n.created_by || ctx.isAdmin;
            return (
              <div key={n.id} className="card border-yellow-200 bg-yellow-50">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{n.title}</h3>
                  {canDelete && (
                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="text-xs text-red-600 hover:underline" type="submit">Hapus</button>
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
