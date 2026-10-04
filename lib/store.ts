"use client";

import { useSyncExternalStore } from "react";
import { toast } from "@/components/toast";
import type { Post, Viewer } from "@/lib/types";

/**
 * Client state. The server is the source of truth: `viewer` is loaded from /api/viewer and every
 * action is an optimistic update that calls the API and rolls back on failure. Only UI preferences
 * (theme, recent searches) live in localStorage.
 *
 * Counters shown on cards come from server-rendered data; after the viewer acts we keep an
 * `overrides` entry with the authoritative number returned by the API until fresh data arrives.
 */
export interface CountOverride {
  reactions?: number;
  saves?: number;
  comments?: number;
}

export interface SiseState {
  ready: boolean;
  me: Viewer["user"] | null;
  reactions: Viewer["reactions"];
  saves: Viewer["saves"];
  follows: Viewer["follows"];
  votes: Viewer["votes"];
  commentLikes: string[];
  blocked: string[];
  muted: string[];
  unread: number;
  overrides: Record<string, CountOverride>;
  voteTotals: Record<string, { options: { id: string; label: string; votes: number }[] }>;
  theme: "light" | "dark";
  recentSearches: string[];
  installDismissed: boolean;
  loginPrompt: boolean;
}

const EMPTY: Omit<SiseState, "theme" | "recentSearches" | "installDismissed"> = {
  ready: false,
  me: null,
  reactions: {},
  saves: { posts: [], places: [], events: [], listings: [] },
  follows: { rooms: [], users: [], places: [], events: [] },
  votes: {},
  commentLikes: [],
  blocked: [],
  muted: [],
  unread: 0,
  overrides: {},
  voteTotals: {},
  loginPrompt: false,
};

export const DEFAULT_STATE: SiseState = { ...EMPTY, theme: "light", recentSearches: [], installDismissed: false };

const PREFS_KEY = "sise:prefs";
let state: SiseState = DEFAULT_STATE;
let prefsLoaded = false;
const listeners = new Set<() => void>();

function loadPrefs() {
  if (prefsLoaded || typeof window === "undefined") return;
  prefsLoaded = true;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Pick<SiseState, "theme" | "recentSearches" | "installDismissed">>;
      state = {
        ...state,
        theme: p.theme === "dark" ? "dark" : "light",
        recentSearches: Array.isArray(p.recentSearches) ? p.recentSearches.slice(0, 6) : [],
        installDismissed: !!p.installDismissed,
      };
    }
  } catch {
    /* storage unavailable: defaults */
  }
}

function persistPrefs() {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: state.theme, recentSearches: state.recentSearches, installDismissed: state.installDismissed }));
  } catch {
    /* ignore quota/private mode */
  }
}

function set(update: (s: SiseState) => SiseState, persist = false) {
  loadPrefs();
  state = update(state);
  if (persist) persistPrefs();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Selectors must return stable references (slices of state), never fresh objects. */
export function useSise<T>(selector: (s: SiseState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      loadPrefs();
      return selector(state);
    },
    () => selector(DEFAULT_STATE),
  );
}

export const getSise = () => {
  loadPrefs();
  return state;
};

/* ------------------------------- API plumbing ------------------------------- */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; code?: string; status: number };

export async function api<T = unknown>(url: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "POST", body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean; data?: T; error?: string; code?: string } | null;
    if (res.ok && json?.ok) return { ok: true, data: json.data as T };
    if (res.status === 401) set((s) => ({ ...s, me: null, loginPrompt: true }));
    return { ok: false, error: json?.error ?? "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง", code: json?.code, status: res.status };
  } catch {
    return { ok: false, error: "เชื่อมต่อไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่", status: 0 };
  }
}

/** Returns true when signed in; otherwise opens the login sheet. */
export function requireLogin(): boolean {
  if (getSise().me) return true;
  set((s) => ({ ...s, loginPrompt: true }));
  return false;
}

export async function loadViewer() {
  const r = await api<Viewer | null>("/api/viewer", "GET");
  if (!r.ok) {
    set((s) => ({ ...s, ready: true }));
    return;
  }
  const v = r.data;
  set((s) => ({
    ...s,
    ready: true,
    me: v?.user ?? null,
    reactions: v?.reactions ?? {},
    saves: v?.saves ?? EMPTY.saves,
    follows: v?.follows ?? EMPTY.follows,
    votes: v?.votes ?? {},
    commentLikes: v?.commentLikes ?? [],
    blocked: v?.blocked ?? [],
    muted: v?.muted ?? [],
    unread: v?.unread ?? 0,
  }));
}

const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
const setOverride = (id: string, patch: CountOverride) => set((s) => ({ ...s, overrides: { ...s.overrides, [id]: { ...s.overrides[id], ...patch } } }));

/** Fresh server data supersedes any optimistic number we were holding. */
export function syncPosts(posts: Post[]) {
  if (!posts.length) return;
  set((s) => {
    if (!posts.some((p) => s.overrides[p.id])) return s;
    const next = { ...s.overrides };
    for (const p of posts) delete next[p.id];
    return { ...s, overrides: next };
  });
}

export const countOf = (s: SiseState, post: Post) => ({
  reactions: s.overrides[post.id]?.reactions ?? post.stats.reactions,
  saves: s.overrides[post.id]?.saves ?? post.stats.saves,
  comments: s.overrides[post.id]?.comments ?? post.stats.comments,
});

/* --------------------------------- actions --------------------------------- */

const fail = (message: string) => toast(message);

export const actions = {
  async react(post: Post) {
    if (!requireLogin()) return;
    const had = !!getSise().reactions[post.id];
    const base = countOf(getSise(), post).reactions;
    set((s) => {
      const reactions = { ...s.reactions };
      if (had) delete reactions[post.id];
      else reactions[post.id] = "like";
      return { ...s, reactions };
    });
    setOverride(post.id, { reactions: Math.max(0, base + (had ? -1 : 1)) });
    const r = await api<{ reacted: boolean; count: number }>(`/api/posts/${post.id}/react`);
    if (!r.ok) {
      set((s) => {
        const reactions = { ...s.reactions };
        if (had) reactions[post.id] = "like";
        else delete reactions[post.id];
        return { ...s, reactions };
      });
      setOverride(post.id, { reactions: base });
      fail(r.error);
    } else setOverride(post.id, { reactions: r.data.count });
  },

  async save(kind: keyof SiseState["saves"], id: string, post?: Post) {
    if (!requireLogin()) return false;
    const had = getSise().saves[kind].includes(id);
    const type = ({ posts: "POST", places: "PLACE", events: "EVENT", listings: "LISTING" } as const)[kind];
    const base = post ? countOf(getSise(), post).saves : 0;
    set((s) => ({ ...s, saves: { ...s.saves, [kind]: toggle(s.saves[kind], id) } }));
    if (post) setOverride(post.id, { saves: Math.max(0, base + (had ? -1 : 1)) });
    const r = await api(`/api/save`, "POST", { type, id });
    if (!r.ok) {
      set((s) => ({ ...s, saves: { ...s.saves, [kind]: toggle(s.saves[kind], id) } }));
      if (post) setOverride(post.id, { saves: base });
      fail(r.error);
      return had;
    }
    return !had;
  },

  async follow(kind: keyof SiseState["follows"], id: string) {
    if (!requireLogin()) return false;
    const had = getSise().follows[kind].includes(id);
    const type = ({ rooms: "ROOM", users: "USER", places: "PLACE", events: "EVENT" } as const)[kind];
    set((s) => ({ ...s, follows: { ...s.follows, [kind]: toggle(s.follows[kind], id) } }));
    const r = await api(`/api/follow`, "POST", { type, id });
    if (!r.ok) {
      set((s) => ({ ...s, follows: { ...s.follows, [kind]: toggle(s.follows[kind], id) } }));
      fail(r.error);
      return had;
    }
    return !had;
  },

  async vote(postId: string, optionId: string) {
    if (!requireLogin()) return;
    if (getSise().votes[postId]) return;
    set((s) => ({ ...s, votes: { ...s.votes, [postId]: optionId } }));
    const r = await api<{ options: { id: string; label: string; votes: number }[]; voted: string }>(`/api/posts/${postId}/vote`, "POST", { optionId });
    if (!r.ok) {
      set((s) => {
        const votes = { ...s.votes };
        delete votes[postId];
        return { ...s, votes };
      });
      fail(r.error);
    } else set((s) => ({ ...s, voteTotals: { ...s.voteTotals, [postId]: { options: r.data.options } } }));
  },

  async likeComment(id: string) {
    if (!requireLogin()) return null;
    const had = getSise().commentLikes.includes(id);
    set((s) => ({ ...s, commentLikes: toggle(s.commentLikes, id) }));
    const r = await api<{ liked: boolean; count: number }>(`/api/comments/${id}/like`);
    if (!r.ok) {
      set((s) => ({ ...s, commentLikes: toggle(s.commentLikes, id) }));
      fail(r.error);
      return null;
    }
    return { liked: !had, count: r.data.count };
  },

  async block(userId: string, mute = false) {
    if (!requireLogin()) return false;
    const r = await api(`/api/block`, "POST", { userId, mute });
    if (!r.ok) {
      fail(r.error);
      return false;
    }
    set((s) => ({ ...s, blocked: mute ? s.blocked : Array.from(new Set([...s.blocked, userId])), muted: mute ? Array.from(new Set([...s.muted, userId])) : s.muted }));
    return true;
  },

  async unblock(userId: string) {
    const r = await api(`/api/block`, "POST", { userId, undo: true });
    if (r.ok) set((s) => ({ ...s, blocked: s.blocked.filter((x) => x !== userId), muted: s.muted.filter((x) => x !== userId) }));
    else fail(r.error);
  },

  async report(input: { targetType: "POST" | "COMMENT" | "USER" | "LISTING"; targetId: string; reason: string; note?: string }) {
    if (!requireLogin()) return false;
    const r = await api(`/api/report`, "POST", input);
    if (!r.ok) {
      fail(r.error);
      return false;
    }
    return true;
  },

  async readNotifications(ids: string[] | "all") {
    if (!getSise().me) return;
    const r = await api<{ unread: number }>(`/api/notifications/read`, "POST", ids === "all" ? { all: true } : { ids });
    if (r.ok) set((s) => ({ ...s, unread: r.data.unread }));
  },

  bumpComments(post: Post, delta: number) {
    setOverride(post.id, { comments: Math.max(0, countOf(getSise(), post).comments + delta) });
  },

  addRecentSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    set((s) => ({ ...s, recentSearches: [t, ...s.recentSearches.filter((x) => x !== t)].slice(0, 6) }), true);
  },
  setTheme(theme: SiseState["theme"]) {
    set((s) => ({ ...s, theme }), true);
  },
  dismissInstall() {
    set((s) => ({ ...s, installDismissed: true }), true);
  },
  closeLoginPrompt() {
    set((s) => ({ ...s, loginPrompt: false }));
  },
  async setProfile(p: { name?: string; bio?: string }) {
    const r = await api<{ name: string; bio: string }>("/api/me", "PATCH", p);
    if (r.ok) set((s) => (s.me ? { ...s, me: { ...s.me, name: r.data.name } } : s));
    else fail(r.error);
    return r.ok;
  },
  async logout() {
    await api("/api/auth/logout");
    // full reload on purpose: drops all signed-in client state
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/";
  },
};
