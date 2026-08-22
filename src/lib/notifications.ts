/**
 * Central notifications — client of sanapp-main's notification hub.
 * Applications push events here (server-side, x-app-key) and read their
 * users' notifications back; the shared header bell groups them by app.
 *
 * These helpers are for SERVER code (route handlers / server components).
 * Client components fetch the app's own /api/notifications proxy instead.
 */

export type AppNotificationItem = {
  id: string;
  appClientId: string;
  appName: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
};

export type AppNotificationList = {
  notifications: AppNotificationItem[];
  unread: number;
  total: number;
  page: number;
  limit: number;
};

export type PushNotificationInput = {
  username: string;
  title: string;
  body?: string | null;
  /** Absolute deep link into the pushing app. */
  href?: string | null;
};

/** An application pushes notifications for its users (best-effort, never throws). */
export async function pushAppNotifications(opts: {
  mainBaseUrl: string;
  appKey: string | undefined;
  /** This app's base path (/logrequest, /facilities, ...) — resolves the app in Main's registry. */
  basePath: string;
  items: PushNotificationInput[];
}): Promise<boolean> {
  const items = opts.items.filter((i) => i.username && i.title);
  if (items.length === 0) return true;
  try {
    const res = await fetch(`${opts.mainBaseUrl}/api/notifications`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-app-key": opts.appKey ?? "" },
      body: JSON.stringify({ basePath: opts.basePath, items }),
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    console.error("pushAppNotifications failed:", e);
    return false;
  }
}

/** Read a user's notifications from the central hub (server-side). */
export async function queryAppNotifications(opts: {
  mainBaseUrl: string;
  appKey: string | undefined;
  username: string;
  /** "all" powers the header bell; "app" scopes to basePath's application. */
  scope?: "all" | "app";
  basePath?: string;
  unreadOnly?: boolean;
  limit?: number;
  page?: number;
}): Promise<AppNotificationList> {
  const empty: AppNotificationList = { notifications: [], unread: 0, total: 0, page: 1, limit: 30 };
  try {
    const res = await fetch(`${opts.mainBaseUrl}/api/notifications/query`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-app-key": opts.appKey ?? "" },
      body: JSON.stringify({
        username: opts.username,
        scope: opts.scope ?? "all",
        basePath: opts.basePath,
        unreadOnly: opts.unreadOnly === true,
        limit: opts.limit,
        page: opts.page,
      }),
      cache: "no-store",
    });
    if (!res.ok) return empty;
    const data = await res.json();
    return {
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      unread: Number(data.unread ?? 0),
      total: Number(data.total ?? 0),
      page: Number(data.page ?? 1),
      limit: Number(data.limit ?? 30),
    };
  } catch (e) {
    console.error("queryAppNotifications failed:", e);
    return empty;
  }
}

/** Mark a user's notifications read — by ids, or all (optionally scoped to one app). */
export async function markAppNotificationsRead(opts: {
  mainBaseUrl: string;
  appKey: string | undefined;
  username: string;
  ids?: string[];
  all?: boolean;
  basePath?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${opts.mainBaseUrl}/api/notifications/read`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-app-key": opts.appKey ?? "" },
      body: JSON.stringify({
        username: opts.username,
        ids: opts.ids,
        all: opts.all,
        basePath: opts.basePath,
      }),
      cache: "no-store",
    });
    return res.ok;
  } catch (e) {
    console.error("markAppNotificationsRead failed:", e);
    return false;
  }
}
