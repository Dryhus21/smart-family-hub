"use client";

import { useRef, useState, useTransition } from "react";
import { Icon } from "@/components/Icon";
import { uploadProfileAvatarAction } from "./actions";

export function ProfileAvatarUpload({ currentUrl, initials }: { currentUrl: string | null; initials: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    const fd = new FormData();
    fd.append("avatar", file);
    startTransition(async () => {
      const result = await uploadProfileAvatarAction(fd);
      if (result.error) {
        setError(result.error);
        setPreview(currentUrl);
      } else if (result.url) {
        setPreview(result.url);
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        aria-label="Ganti foto profil"
        className="group relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/60 bg-primary-container/30 shadow-[0_10px_30px_rgba(0,73,83,0.2)] transition hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-primary">
            {initials}
          </span>
        )}
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isPending ? (
            <Icon name="autorenew" className="animate-spin text-white text-2xl" />
          ) : (
            <>
              <Icon name="photo_camera" className="text-white text-2xl" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Ganti foto</span>
            </>
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden
      />
      <p className="text-xs text-on-surface-variant">Klik foto untuk mengganti</p>
      {error && <p className="text-xs text-danger-red">{error}</p>}
    </div>
  );
}
