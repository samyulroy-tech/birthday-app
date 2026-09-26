"use client";

import { useRef, useState } from "react";

import { AdminConfig, MediaItem } from "@/lib/types";

import { adminApi } from "@/lib/api";

import { MediaVisual } from "@/components/MediaFrame";

interface MediaPanelProps {
  config: AdminConfig;
  items: MediaItem[];
  onItemsChange: (items: MediaItem[]) => void;
  onConfigChange: (config: AdminConfig) => void;
}

export function MediaPanel({
  config,
  items,
  onItemsChange,
  onConfigChange,
}: MediaPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  // Added only for replacing an existing media file
  const replaceFileRef = useRef<HTMLInputElement>(null);
  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length || uploading) return;

    setUploading(true);
    setUploadError("");
    setUploadProgress("");

    try {
      const selectedFiles = Array.from(files);
      const createdItems: MediaItem[] = [];

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];

        setUploadProgress(
          `Uploading ${index + 1} of ${selectedFiles.length}...`
        );

        // Upload actual file
        const uploaded = await adminApi.upload(file);

        // Remove extension from filename
        const title =
          file.name.replace(/\.[^.]+$/, "").trim() ||
          `Memory ${items.length + index + 1}`;

        // Create media record
        const created = await adminApi.createMedia({
          media_type: uploaded.media_type,
          url: uploaded.url,
          thumbnail_url: uploaded.thumbnail_url,
          title,
          caption: "",
          date_label: "",
          duration_seconds: config.photo_duration_seconds,
          include_in_finale: true,
          include_in_gallery: true,
          order_index: items.length + createdItems.length,
        });

        createdItems.push(created);
      }

      if (createdItems.length) {
        onItemsChange([...items, ...createdItems]);
      }

      setUploadProgress("");
    } catch (error) {
      console.error("Media upload failed:", error);

      setUploadError(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    } finally {
      setUploading(false);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  // ============================================================
  // CHANGE / RE-UPLOAD EXISTING PHOTO OR VIDEO
  // ============================================================
  async function replaceMedia(item: MediaItem, file: File) {
    if (busyId === item.id) return;

    setBusyId(item.id);
    setActionError("");
    setUploadError("");
    setUploadProgress(`Replacing "${item.title || "memory"}"...`);

    try {
      // Upload the new physical file first
      const uploaded = await adminApi.upload(file);

      // Update ONLY the file-related fields.
      // Everything else remains unchanged.
      const updated = await adminApi.updateMedia(item.id, {
        media_type: uploaded.media_type,
        url: uploaded.url,
        thumbnail_url: uploaded.thumbnail_url,
      });

      // Update same item in frontend state
      onItemsChange(
        items.map((media) =>
          media.id === item.id ? updated : media
        )
      );

      setUploadProgress("");
    } catch (error) {
      console.error("Failed to replace media:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't replace this photo."
      );
    } finally {
      setBusyId(null);
      setUploadProgress("");

      if (replaceFileRef.current) {
        replaceFileRef.current.value = "";
      }

      setReplaceTargetId(null);
    }
  }

  function openReplacePicker(itemId: string) {
    if (busyId) return;

    setReplaceTargetId(itemId);

    // Open the hidden file picker
    setTimeout(() => {
      replaceFileRef.current?.click();
    }, 0);
  }

  async function handleReplaceFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !replaceTargetId) {
      event.target.value = "";
      return;
    }

    const item = items.find(
      (media) => media.id === replaceTargetId
    );

    if (!item) {
      event.target.value = "";
      setReplaceTargetId(null);
      return;
    }

    await replaceMedia(item, file);

    event.target.value = "";
  }

  async function update(
    id: string,
    patch: Partial<MediaItem>
  ) {
    if (busyId === id) return;

    setBusyId(id);
    setActionError("");

    try {
      const updated = await adminApi.updateMedia(id, patch);

      onItemsChange(
        items.map((media) =>
          media.id === id ? updated : media
        )
      );
    } catch (error) {
      console.error("Failed to update media:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't update this memory."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (busyId === id) return;

    const item = items.find(
      (media) => media.id === id
    );

    if (
      !window.confirm(
        `Delete "${item?.title || "this memory"}"? This can't be undone.`
      )
    ) {
      return;
    }

    setBusyId(id);
    setActionError("");

    try {
      await adminApi.deleteMedia(id);

      const remaining = items.filter(
        (media) => media.id !== id
      );

      onItemsChange(remaining);

      // Keep frontend config in sync if this was the special media.
      if (config.special_media_id === id) {
        const updated = await adminApi.updateConfig({
          special_media_id: null,
        });

        onConfigChange(updated);
      }
    } catch (error) {
      console.error("Failed to delete media:", error);

      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't delete this memory."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function move(
    id: string,
    direction: -1 | 1
  ) {
    if (busyId) return;

    const index = items.findIndex(
      (media) => media.id === id
    );

    if (index < 0) return;

    const swapIndex = index + direction;

    if (
      swapIndex < 0 ||
      swapIndex >= items.length
    ) {
      return;
    }

    const previous = [...items];
    const next = [...items];

    [next[index], next[swapIndex]] = [
      next[swapIndex],
      next[index],
    ];

    setActionError("");

    // Optimistic update
    onItemsChange(next);

    try {
      await adminApi.reorderMedia(
        next.map((media) => media.id)
      );
    } catch (error) {
      console.error("Failed to reorder media:", error);

      // Restore previous order
      onItemsChange(previous);

      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't save the new order."
      );
    }
  }

  async function setSpecial(id: string) {
    if (busyId) return;

    setBusyId(id);
    setActionError("");

    try {
      const updated = await adminApi.updateConfig({
        special_media_id: id,
      });

      onConfigChange(updated);
    } catch (error) {
      console.error(
        "Failed to set special media:",
        error
      );

      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't set special memory."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      {/* Upload header */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="min-h-[46px] rounded-full border border-[#f4c97a]/50 bg-gradient-to-br from-[#ff7fa9] to-[#8a63d8] px-5 font-semibold text-white shadow-glow transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-glow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {uploading
              ? uploadProgress || "Uploading..."
              : "＋ Add photos or videos"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            multiple
            hidden
            onChange={(event) =>
              handleFiles(event.target.files)
            }
          />

          {/* Hidden input ONLY for Change Photo */}
          <input
            ref={replaceFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            hidden
            onChange={handleReplaceFile}
          />

          <span className="text-xs text-white/40">
            JPG, PNG, WebP, GIF, MP4, WebM, MOV — up to
            80MB each
          </span>
        </div>

        {uploading && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[#ff7fa9] to-[#f4c97a]" />
          </div>
        )}
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
          {uploadError}
        </div>
      )}

      {/* Action error */}
      {actionError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
          <span>{actionError}</span>

          <button
            type="button"
            onClick={() => setActionError("")}
            className="shrink-0 text-white/50 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Media list */}
      <div className="grid gap-4">
        {items.map((item, index) => {
          const busy = busyId === item.id;

          const isSpecial =
            config.special_media_id === item.id;

          return (
            <div
              key={item.id}
              className={`glass rounded-2xl border border-white/10 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f4c97a]/30 hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)] ${
                busy ? "opacity-65" : ""
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* Preview */}
                <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-black/40 sm:w-40">
                  <MediaVisual
                    item={item}
                    index={index}
                    className="h-full w-full object-cover"
                    autoPlayVideo={false}
                  />

                  <div className="pointer-events-none absolute left-2 top-2 flex gap-1.5">
                    <span className="rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-md">
                      {item.media_type}
                    </span>

                    {isSpecial && (
                      <span className="rounded-full border border-[#f4c97a]/30 bg-[#f4c97a]/20 px-2 py-1 text-[10px] text-[#f4c97a] backdrop-blur-md">
                        ★ Special
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="grid min-w-0 flex-1 gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Memory {index + 1}
                    </span>

                    {isSpecial && (
                      <span className="text-xs text-[#f4c97a]">
                        Special memory
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <input
                    type="text"
                    disabled={busy}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#f4c97a]/50 focus:bg-white/[0.08]"
                    placeholder="Title"
                    defaultValue={item.title}
                    onBlur={(event) => {
                      const value =
                        event.target.value.trim();

                      if (
                        value &&
                        value !== item.title
                      ) {
                        update(item.id, {
                          title: value,
                        });
                      } else if (!value) {
                        event.target.value =
                          item.title;
                      }
                    }}
                  />

                  {/* Caption */}
                  <input
                    type="text"
                    disabled={busy}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#f4c97a]/50 focus:bg-white/[0.08]"
                    placeholder="Caption"
                    defaultValue={item.caption}
                    onBlur={(event) => {
                      const value =
                        event.target.value.trim();

                      if (
                        value !== item.caption
                      ) {
                        update(item.id, {
                          caption: value,
                        });
                      }
                    }}
                  />

                  {/* Date + duration */}
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      disabled={busy}
                      className="w-28 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#f4c97a]/50"
                      placeholder="Date label"
                      defaultValue={item.date_label}
                      onBlur={(event) => {
                        const value =
                          event.target.value.trim();

                        if (
                          value !==
                          item.date_label
                        ) {
                          update(item.id, {
                            date_label: value,
                          });
                        }
                      }}
                    />

                    {item.media_type === "photo" && (
                      <input
                        type="number"
                        min={1}
                        max={300}
                        disabled={busy}
                        className="w-24 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#f4c97a]/50"
                        placeholder="Seconds"
                        defaultValue={
                          item.duration_seconds
                        }
                        onBlur={(event) => {
                          const value = Math.max(
                            1,
                            Number(
                              event.target.value
                            ) || 1
                          );

                          if (
                            value !==
                            item.duration_seconds
                          ) {
                            update(item.id, {
                              duration_seconds:
                                value,
                            });
                          }
                        }}
                      />
                    )}
                  </div>

                  {/* Visibility controls */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/60">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          item.include_in_gallery
                        }
                        disabled={busy}
                        onChange={(event) =>
                          update(item.id, {
                            include_in_gallery:
                              event.target.checked,
                          })
                        }
                        className="h-4 w-4 cursor-pointer accent-pink-400"
                      />

                      <span>Gallery wall</span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          item.include_in_finale
                        }
                        disabled={busy}
                        onChange={(event) =>
                          update(item.id, {
                            include_in_finale:
                              event.target.checked,
                          })
                        }
                        className="h-4 w-4 cursor-pointer accent-pink-400"
                      />

                      <span>Finale collage</span>
                    </label>

                    {!isSpecial && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          setSpecial(item.id)
                        }
                        className="text-[#f4c97a]/75 transition-colors hover:text-[#f4c97a] disabled:opacity-40"
                      >
                        ★ Set as special
                      </button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 justify-end gap-2 sm:flex-col">
                  <button
                    type="button"
                    onClick={() =>
                      move(item.id, -1)
                    }
                    disabled={
                      index === 0 || !!busyId
                    }
                    className="min-h-[38px] min-w-[42px] rounded-xl border border-white/10 bg-white/[0.05] text-sm text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1] active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                    title="Move up"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      move(item.id, 1)
                    }
                    disabled={
                      index === items.length - 1 ||
                      !!busyId
                    }
                    className="min-h-[38px] min-w-[42px] rounded-xl border border-white/10 bg-white/[0.05] text-sm text-white transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1] active:scale-95 disabled:pointer-events-none disabled:opacity-25"
                    title="Move down"
                  >
                    ↓
                  </button>

                  {/* CHANGE PHOTO / RE-UPLOAD */}
                  <button
                    type="button"
                    onClick={() =>
                      openReplacePicker(item.id)
                    }
                    disabled={busy}
                    className="min-h-[38px] rounded-xl border border-[#f4c97a]/30 bg-[#f4c97a]/10 px-3 text-sm text-[#f4c97a] transition-all duration-200 hover:border-[#f4c97a]/50 hover:bg-[#f4c97a]/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    title="Change photo or video"
                  >
                    {busy ? "..." : "Change Photo"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(item.id)
                    }
                    disabled={busy}
                    className="min-h-[38px] rounded-xl bg-rose-400/10 px-3 text-sm text-rose-300 transition-all duration-200 hover:bg-rose-400/20 hover:text-rose-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {busy ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!items.length && (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-12 text-center">
            <div className="mb-3 text-4xl opacity-60">
              📸
            </div>

            <p className="text-sm text-white/55">
              No photos or videos yet.
            </p>

            <p className="mt-1 text-xs text-white/30">
              Add some memories above to build the surprise.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-white/30">
          <span>
            {items.length}{" "}
            {items.length === 1
              ? "memory"
              : "memories"}
          </span>

          <span>
            {
              items.filter(
                (item) => item.include_in_gallery
              ).length
            }{" "}
            in gallery ·{" "}
            {
              items.filter(
                (item) => item.include_in_finale
              ).length
            }{" "}
            in finale
          </span>
        </div>
      )}
    </div>
  );
}