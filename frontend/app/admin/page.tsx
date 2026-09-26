"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import {
  adminApi,
  clearToken,
  getToken,
} from "@/lib/api";

import { AdminConfig } from "@/lib/types";

import { ConfigPanel } from "@/components/admin/ConfigPanel";
import { MediaPanel } from "@/components/admin/MediaPanel";
import { BalloonPanel } from "@/components/admin/BalloonPanel";

type Tab = "config" | "media" | "balloons";

const TABS: [Tab, string][] = [
  ["config", "Event & messages"],
  ["media", "Photos & videos"],
  ["balloons", "Balloon messages"],
];

export default function AdminDashboard() {
  const router = useRouter();

  const [config, setConfig] =
    useState<AdminConfig | null>(null);

  const [tab, setTab] =
    useState<Tab>("config");

  const [loading, setLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState(false);

  /* -------------------------------------------------------
     AUTH + CONFIG
  ------------------------------------------------------- */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    adminApi
      .getConfig()
      .then((data) => {
        setConfig(data);
      })
      .catch((error) => {
        console.error(
          "Failed to load admin config:",
          error
        );

        setAuthError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  /* -------------------------------------------------------
     LOGOUT
  ------------------------------------------------------- */

  function logout() {
    clearToken();
    router.replace("/admin/login");
  }

  /* -------------------------------------------------------
     AUTH ERROR
  ------------------------------------------------------- */

  if (authError) {
    router.replace("/admin/login");
    return null;
  }

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading || !config) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090711] text-white">

        {/* Background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-[120px]"
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="relative z-10 flex flex-col items-center gap-5"
        >
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-white/10 border-t-pink-400"
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.p
            className="text-sm text-white/65 sm:text-base"
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading dashboard...
          </motion.p>
        </motion.div>
      </main>
    );
  }

  /* -------------------------------------------------------
     DASHBOARD
  ------------------------------------------------------- */

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#090711] text-white">

      {/* ===================================================
          BACKGROUND
      =================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-120px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-pink-500/10 blur-[120px]" />

        <div className="absolute bottom-[-100px] right-[-80px] h-[400px] w-[400px] rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="absolute left-[-100px] top-[40%] h-[300px] w-[300px] rounded-full bg-gold/5 blur-[120px]" />
      </div>

      {/* ===================================================
          HEADER
      =================================================== */}

      <motion.header
        initial={{
          opacity: 0,
          y: -18,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.65,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090711]/85 backdrop-blur-2xl"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">

          {/* Brand */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg shadow-lg">
                ✨
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                  Owner dashboard
                </h1>

                <p className="mt-0.5 truncate text-xs text-white/50 sm:text-sm">
                  Editing the surprise for{" "}
                  <span className="text-pink-300">
                    {config.recipient_name}
                  </span>
                </p>
              </div>

            </div>
          </div>

          {/* Header buttons */}
          <div className="flex w-full gap-2 sm:w-auto">

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[42px] flex-1 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white/80 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:text-white active:scale-95 sm:flex-none"
            >
              View live page
              <span className="ml-1.5 text-white/50">
                ↗
              </span>
            </a>

            <button
              type="button"
              onClick={logout}
              className="min-h-[42px] rounded-full border border-red-400/20 bg-red-500/10 px-4 text-sm text-red-300 transition-all duration-300 hover:border-red-400/30 hover:bg-red-500/20 active:scale-95"
            >
              Sign out
            </button>

          </div>
        </div>
      </motion.header>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6">

        {/* =================================================
            TABS
        ================================================= */}

        <nav
          className="flex w-full gap-2 overflow-x-auto overscroll-x-contain py-5"
          aria-label="Dashboard sections"
        >
          {TABS.map(([id, label]) => {
            const active = tab === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-selected={active}
                className={`relative min-h-[44px] shrink-0 overflow-hidden rounded-full px-5 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "text-white shadow-lg"
                    : "border border-white/10 bg-white/5 text-white/60 hover:border-white/15 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="admin-tab-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}

                <span className="relative z-10">
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* =================================================
            CONTENT
        ================================================= */}

        <AnimatePresence mode="wait">

          <motion.section
            key={tab}
            initial={{
              opacity: 0,
              y: 14,
              filter: "blur(5px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              y: -10,
              filter: "blur(4px)",
            }}
            transition={{
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 shadow-2xl backdrop-blur-xl sm:p-6"
          >

            {/* CONFIG */}
            {tab === "config" && (
              <ConfigPanel
                config={config}
                onSaved={setConfig}
              />
            )}

            {/* MEDIA */}
            {tab === "media" && (
              <MediaPanel
                config={config}
                items={config.media_items}
                onItemsChange={(media_items) => {
                  setConfig({
                    ...config,
                    media_items,
                  });
                }}
                onConfigChange={setConfig}
              />
            )}

            {/* BALLOONS */}
            {tab === "balloons" && (
              <BalloonPanel
                items={config.balloons}
                onItemsChange={(balloons) => {
                  setConfig({
                    ...config,
                    balloons,
                  });
                }}
              />
            )}

          </motion.section>

        </AnimatePresence>
      </main>
    </div>
  );
}