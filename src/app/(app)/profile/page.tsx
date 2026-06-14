import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth";
import { Icon } from "@/components/Icon";
import { ProfileAvatarUpload } from "./AvatarUpload";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const auth = await getAuthContext();
  if (!auth) redirect("/login");

  const initials = auth.profile.full_name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="text-center md:text-left">
        <h1 className="text-display-lg-mobile md:text-headline-md">Profil Saya</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Kelola foto, nama, tanggal lahir, dan deskripsi diri kamu.
        </p>
      </header>

      <section className="glass-card neon-card p-6 md:p-8">
        <div className="mb-6 flex flex-col items-center gap-2 md:flex-row md:items-end md:justify-between">
          <ProfileAvatarUpload currentUrl={auth.profile.avatar_url} initials={initials} />
          <div className="text-center md:text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Akun</div>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-on-surface">
              <Icon name="mail" className="text-sm" />
              {auth.profile.email}
            </div>
            {auth.family && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Icon name="groups" className="text-sm" />
                {auth.family.family_name} · {auth.isAdmin ? "Admin" : "Anggota"}
              </div>
            )}
          </div>
        </div>

        <ProfileForm profile={auth.profile} />
      </section>
    </div>
  );
}
