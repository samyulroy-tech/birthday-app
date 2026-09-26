"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { adminApi, setToken } from "@/lib/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const { access_token } = await adminApi.login(
        username.trim(),
        password
      );

      setToken(access_token);

      router.push("/admin");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-5 py-10 text-white">

      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose/10 blur-[120px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[10%] top-[15%] h-32 w-32 rounded-full bg-violet/10 blur-[80px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[10%] right-[10%] h-40 w-40 rounded-full bg-gold/10 blur-[90px]"
      />

      {/* Login card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{
          opacity: 0,
          y: 28,
          scale: 0.98,
          filter: "blur(10px)",
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
        }}
        transition={{
          duration: 0.85,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 p-7 shadow-frame sm:p-9"
      >

        {/* Top glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 rounded-full bg-rose/10 blur-3xl"
        />

        {/* Header */}
        <div className="relative mb-8 text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.15,
              duration: 0.6,
            }}
            className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-gold/30 bg-white/5 text-2xl shadow-glow"
          >
            ✨
          </motion.div>

          <h1 className="serif text-3xl font-semibold gradient-text-animated sm:text-4xl">
            Owner sign in
          </h1>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-white/55">
            Manage your surprise — photos, videos, messages,
            dates, and everything in between.
          </p>
        </div>

        {/* Username */}
        <div className="mb-5">
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Username
          </label>

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-gold/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-gold/10"
          />
        </div>

        {/* Password */}
        <div className="mb-5">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Password
          </label>

          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-white/25 outline-none transition-all duration-300 focus:border-gold/60 focus:bg-white/[0.09] focus:ring-2 focus:ring-gold/10"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mb-5 rounded-xl border border-rose/20 bg-rose/10 px-4 py-3"
          >
            <p className="text-sm leading-relaxed text-rose">
              {error}
            </p>
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={
            !loading
              ? {
                  scale: 1.015,
                }
              : undefined
          }
          whileTap={
            !loading
              ? {
                  scale: 0.985,
                }
              : undefined
          }
          className="relative w-full min-h-[50px] overflow-hidden rounded-full border border-gold/50 bg-gradient-to-br from-rose to-violet font-semibold text-white shadow-glow transition-all duration-300 hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative z-10">
            {loading ? "Signing in..." : "Sign in"}
          </span>

          {!loading && (
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 hover:translate-x-full"
            />
          )}
        </motion.button>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          Private owner access
        </p>
      </motion.form>
    </main>
  );
}