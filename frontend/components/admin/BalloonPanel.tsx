"use client";

import { useState } from "react";
import { Balloon } from "@/lib/types";
import { adminApi } from "@/lib/api";

interface BalloonPanelProps {
  items: Balloon[];
  onItemsChange: (items: Balloon[]) => void;
}

export function BalloonPanel({
  items,
  onItemsChange,
}: BalloonPanelProps) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    const message = draft.trim();

    if (!message || adding) return;

    setError(null);
    setAdding(true);

    try {
      const created = await adminApi.createBalloon({
        message,
        enabled: true,
        order_index: items.length,
      });

      onItemsChange([...items, created]);
      setDraft("");
    } catch (err) {
      console.error("Failed to add balloon:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't add balloon message."
      );
    } finally {
      setAdding(false);
    }
  }

  async function update(
    id: string,
    patch: Partial<Balloon>
  ) {
    if (busyId === id) return;

    setError(null);
    setBusyId(id);

    try {
      const updated = await adminApi.updateBalloon(id, patch);

      onItemsChange(
        items.map((balloon) =>
          balloon.id === id ? updated : balloon
        )
      );
    } catch (err) {
      console.error("Failed to update balloon:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update balloon message."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (busyId === id) return;

    const balloon = items.find((item) => item.id === id);

    if (
      balloon &&
      !window.confirm(
        "Remove this balloon message?"
      )
    ) {
      return;
    }

    setError(null);
    setBusyId(id);

    try {
      await adminApi.deleteBalloon(id);

      onItemsChange(
        items.filter((balloon) => balloon.id !== id)
      );
    } catch (err) {
      console.error("Failed to remove balloon:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't remove balloon message."
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-white">
          Balloon Messages
        </h3>

        <p className="mt-1 text-sm leading-6 text-white/60">
          Hidden messages revealed when each balloon is
          popped during the countdown.
        </p>
      </div>

      {/* Add message */}
      <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-3 backdrop-blur-xl">
        <div className="flex gap-2">
          <input
            type="text"
            className="min-h-[44px] flex-1 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm text-white outline-none placeholder:text-white/35 transition-all duration-300 focus:border-[#f4c97a]/60 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#f4c97a]/20"
            placeholder="Write a balloon message..."
            value={draft}
            maxLength={180}
            disabled={adding}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />

          <button
            type="button"
            onClick={add}
            disabled={!draft.trim() || adding}
            className="min-h-[44px] min-w-[82px] rounded-full border border-white/10 bg-white/[0.08] px-5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f4c97a]/40 hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {adding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-white/30 border-t-white" />
                Add
              </span>
            ) : (
              "Add"
            )}
          </button>
        </div>

        <div className="mt-2 flex justify-between px-1 text-[11px] text-white/35">
          <span>Press Enter to add</span>
          <span>{draft.length}/180</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="grid gap-3">
        {items.map((balloon, index) => {
          const busy = busyId === balloon.id;

          return (
            <div
              key={balloon.id}
              className={`group rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f4c97a]/30 hover:bg-white/[0.05] ${
                busy ? "opacity-70" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Order */}
                <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-xs text-white/50">
                  {index + 1}
                </div>

                {/* Enable */}
                <label className="mt-1.5 flex shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={balloon.enabled}
                    disabled={busy}
                    onChange={(e) =>
                      update(balloon.id, {
                        enabled: e.target.checked,
                      })
                    }
                    className="h-4 w-4 cursor-pointer accent-pink-400"
                    title="Enable balloon"
                  />
                </label>

                {/* Message */}
                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    defaultValue={balloon.message}
                    disabled={busy}
                    maxLength={180}
                    aria-label={`Balloon message ${index + 1}`}
                    className="w-full bg-transparent text-sm leading-6 text-white outline-none placeholder:text-white/30 transition-colors focus:text-[#fff3ea]"
                    onBlur={(e) => {
                      const value = e.target.value.trim();

                      if (
                        value &&
                        value !== balloon.message
                      ) {
                        update(balloon.id, {
                          message: value,
                        });
                      } else if (!value) {
                        e.target.value = balloon.message;
                      }
                    }}
                  />

                  <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                    {balloon.enabled
                      ? "Visible during countdown"
                      : "Disabled"}
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(balloon.id)}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs text-rose-300/70 transition-all duration-200 hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? "..." : "Remove"}
                </button>
              </div>
            </div>
          );
        })}

        {!items.length && (
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
            <div className="mb-3 text-3xl opacity-60">
              🎈
            </div>

            <p className="text-sm text-white/55">
              No balloon messages yet.
            </p>

            <p className="mt-1 text-xs text-white/30">
              Add a hidden message above.
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      {items.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-xs text-white/30">
          <span>
            {items.length}{" "}
            {items.length === 1 ? "message" : "messages"}
          </span>

          <span>
            {items.filter((item) => item.enabled).length} enabled
          </span>
        </div>
      )}
    </div>
  );
}