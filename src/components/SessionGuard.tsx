"use client";
import { apiPath } from "../lib/api";

import { useEffect, useRef } from "react";

export type SessionGuardProps = {
  /** Inactivity after which the session is ended (default 30 min). */
  idleTimeoutMs?: number;
  /** Renew the session cookie at most this often while active (default 4 min). */
  keepaliveMs?: number;
  /** How often to re-validate the SSO session (default 30 s). */
  statusIntervalMs?: number;
  /** App endpoint that clears the local session and starts the SSO logout chain. */
  logoutPath?: string;
  /** Broadcast channel name — same-app tabs share it (default "iipe-session"). */
  channel?: string;
};

/**
 * Mount once per protected page. Renders nothing.
 *
 * - Idle watchdog: no activity for `idleTimeoutMs` → sign out (all tabs).
 * - Sliding renewal: while the user is active, POST /api/session/keepalive so
 *   the app session cookie's expiry keeps moving (capped by the server's
 *   absolute maximum session length).
 * - SSO validation: every `statusIntervalMs` the app asks the SSO whether the
 *   central session is still valid, so signing out in ANY tab or ANY app ends
 *   the session everywhere.
 * - Multi-tab: same-app tabs share activity via BroadcastChannel; a logout in
 *   one tab signs out every tab, and each tab returns to the page it was on
 *   after re-login (current path is carried through the logout chain).
 */
export function SessionGuard({
  idleTimeoutMs = 30 * 60 * 1000,
  keepaliveMs = 4 * 60 * 1000,
  statusIntervalMs = 30 * 1000,
  logoutPath = "/api/logout",
  channel = "iipe-session",
}: SessionGuardProps) {
  const lastActivity = useRef<number>(Date.now());
  const lastKeepalive = useRef<number>(0);
  const loggedOut = useRef(false);
  const config = useRef({ idleTimeoutMs, keepaliveMs, statusIntervalMs, logoutPath, channel });

  useEffect(() => {
    const { idleTimeoutMs, keepaliveMs, statusIntervalMs, logoutPath, channel } = config.current;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(channel);
    } catch {
      bc = null;
    }

    const broadcast = (msg: string) => {
      try {
        bc?.postMessage(msg);
      } catch {
        /* ignore */
      }
    };

    function doLogout(reason: string) {
      if (loggedOut.current) return;
      loggedOut.current = true;
      try {
        localStorage.setItem(channel, JSON.stringify({ reason, at: Date.now() }));
      } catch {
        /* ignore */
      }
      broadcast("logout");
      const current = window.location.pathname + window.location.search;
      const q = new URLSearchParams({ returnTo: current });
      window.location.assign(`${apiPath(logoutPath)}?${q.toString()}`);
    }

    function onActivity() {
      lastActivity.current = Date.now();
      const now = Date.now();
      if (now - lastKeepalive.current >= keepaliveMs) {
        lastKeepalive.current = now;
        fetch(apiPath("/api/session/keepalive"), { method: "POST", credentials: "same-origin" })
          .then((r) => {
            if (r.status === 401) doLogout("expired");
          })
          .catch(() => {
            /* transient network error — next activity will retry */
          });
      }
      broadcast("activity");
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;
    let throttled = 0;
    const handle = () => {
      const now = Date.now();
      if (now - throttled < 2000) return;
      throttled = now;
      onActivity();
    };
    events.forEach((e) => window.addEventListener(e, handle, { passive: true }));

    if (bc) {
      bc.onmessage = (ev) => {
        if (ev.data === "logout") doLogout("broadcast");
        else if (ev.data === "activity") lastActivity.current = Date.now();
      };
    }
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === channel) doLogout("storage");
    };
    window.addEventListener("storage", onStorage);

    const idleTimer = window.setInterval(() => {
      if (Date.now() - lastActivity.current >= idleTimeoutMs) {
        doLogout("idle");
      }
    }, 15000);

    const statusTimer = window.setInterval(() => {
      fetch(apiPath("/api/session/status"), { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : { valid: false }))
        .then((data) => {
          if (data && data.valid === false) doLogout("session-ended");
        })
        .catch(() => {
          /* SSO unreachable — keep the session until it is */
        });
    }, statusIntervalMs);

    return () => {
      events.forEach((e) => window.removeEventListener(e, handle));
      window.clearInterval(idleTimer);
      window.clearInterval(statusTimer);
      window.removeEventListener("storage", onStorage);
      try {
        bc?.close();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return null;
}
