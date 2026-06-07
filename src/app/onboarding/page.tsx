import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import OnboardingForms from "./forms";
import { logoutAction } from "../(auth)/actions";

export default async function OnboardingPage() {
  const ctx = await requireAuth();
  if (ctx.family) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Halo, {ctx.profile.full_name}!</h1>
            <p className="mt-1 text-sm text-slate-600">Untuk memulai, buat keluarga baru atau gabung dengan kode undangan.</p>
          </div>
          <form action={logoutAction}>
            <button className="btn btn-ghost" type="submit">Keluar</button>
          </form>
        </div>
        <OnboardingForms />
      </div>
    </div>
  );
}
