"use client";

import { useState } from "react";
import { AdminConfig } from "@/lib/types";
import { adminApi } from "@/lib/api";

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  textarea?: boolean;
  placeholder?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  placeholder,
}: FieldProps) {
  const commonClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-[#f4c97a]/60 focus:bg-white/[0.08] focus:ring-1 focus:ring-[#f4c97a]/20";

  return (
    <label className="block text-sm">
      <span className="text-white/75">{label}</span>

      {textarea ? (
        <textarea
          className={`${commonClass} min-h-[110px] resize-y leading-6`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className={commonClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export function ConfigPanel({
  config,
  onSaved,
}: {
  config: AdminConfig;
  onSaved: (config: AdminConfig) => void;
}) {
  const [form, setForm] = useState({
    recipient_name: config.recipient_name,
    birthday_date: config.birthday_date,
    birthday_time: config.birthday_time,
    timezone: config.timezone,
    unlock_password: "",
    music_url: config.music_url || "",
    photo_duration_seconds: config.photo_duration_seconds,
    intro_message: config.intro_message,
    birthday_message: config.birthday_message,
    cake_message: config.cake_message,
    gift_message: config.gift_message,
    final_message: config.final_message,
    finale_subtitle: config.finale_subtitle,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (value: string) => {
      setForm((current) => ({
        ...current,
        [key]:
          key === "photo_duration_seconds"
            ? Number(value)
            : value,
      }));
    };

  async function save() {
    if (saving) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    const payload: Record<string, unknown> = {
      ...form,
    };

    // Empty password means:
    // keep the existing password unchanged.
    if (!payload.unlock_password) {
      delete payload.unlock_password;
    }

    try {
      const updated = await adminApi.updateConfig(payload);

      onSaved(updated);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to save configuration:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid max-w-3xl gap-6">
      {/* Basic information */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            Birthday details
          </h3>

          <p className="mt-1 text-sm text-white/45">
            The basic information shown throughout the
            experience.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Recipient's name"
            value={form.recipient_name}
            onChange={set("recipient_name")}
            placeholder="Priya"
          />

          <Field
            label="Time zone (IANA)"
            value={form.timezone}
            onChange={set("timezone")}
            placeholder="Asia/Kathmandu"
          />

          <Field
            label="Birthday date"
            type="date"
            value={form.birthday_date}
            onChange={set("birthday_date")}
          />

          <Field
            label="Birthday time"
            type="time"
            value={form.birthday_time}
            onChange={set("birthday_time")}
          />
        </div>
      </section>

      {/* Experience settings */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            Experience settings
          </h3>

          <p className="mt-1 text-sm text-white/45">
            Control how the surprise starts and how memories
            are presented.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Unlock password"
            value={form.unlock_password}
            onChange={set("unlock_password")}
            type="password"
            placeholder="Leave blank to keep current"
          />

          <Field
            label="Default photo duration (seconds)"
            type="number"
            value={form.photo_duration_seconds}
            onChange={set("photo_duration_seconds")}
          />

          <div className="sm:col-span-2">
            <Field
              label="Music URL"
              value={form.music_url}
              onChange={set("music_url")}
              placeholder="https://youtu.be/..."
            />

            <p className="mt-2 text-xs text-white/30">
              Leave blank to use the built-in melody.
            </p>
          </div>
        </div>
      </section>

      {/* Messages */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-white">
            Messages
          </h3>

          <p className="mt-1 text-sm text-white/45">
            These lines appear during the different moments
            of the surprise.
          </p>
        </div>

        <div className="grid gap-4">
          <Field
            label="Intro message"
            value={form.intro_message}
            onChange={set("intro_message")}
            textarea
          />

          <Field
            label="Birthday message"
            value={form.birthday_message}
            onChange={set("birthday_message")}
            placeholder="Another year of you..."
          />

          <Field
            label="Cake message"
            value={form.cake_message}
            onChange={set("cake_message")}
            placeholder="Happy Birthday"
          />

          <Field
            label="Gift message"
            value={form.gift_message}
            onChange={set("gift_message")}
            placeholder="Wait... there's still one more surprise."
          />

          <Field
            label="Final message"
            value={form.final_message}
            onChange={set("final_message")}
            textarea
            placeholder="One line per paragraph"
          />

          <Field
            label="Finale subtitle"
            value={form.finale_subtitle}
            onChange={set("finale_subtitle")}
            placeholder="Made with love, just for you."
          />
        </div>
      </section>

      {/* Save */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="min-h-[46px] rounded-full border border-[#f4c97a]/50 bg-gradient-to-br from-[#ff7fa9] to-[#8a63d8] px-7 font-semibold text-white shadow-glow transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-glow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </span>
          ) : (
            "Save changes"
          )}
        </button>

        {saved && (
          <span className="animate-[fadeIn_0.3s_ease-out] text-sm text-[#f4c97a]">
            Changes saved ✓
          </span>
        )}

        {error && (
          <span className="rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-sm text-rose-200">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
