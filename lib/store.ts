"use client";

import { useSyncExternalStore } from "react";
import type { Comment, Post, PostType, ReactionKind, Report, Tone } from "@/lib/types";

/**
 * Client store: everything a signed-in user would write to the backend lives here for now
 * (reactions, saves, follows, posts, comments, votes, blocks, reports). It persists to
 * localStorage so the prototype feels real across reloads. Replace the actions with API
 * calls later — components only use the hooks and action functions exported below.
 */
export interface SiseState {
  reactions: Record<string, ReactionKind>;
  saves: { posts: string[]; places: string[]; events: string[]; listings: string[] };
  follows: { rooms: string[]; users: string[]; places: string[]; events: string[] };
  interested: string[]; // event slugs
  userPosts: Post[];
  userComments: Comment[];
  commentLikes: string[];
  votes: Record<string, string>;
  blocked: string[];
  muted: string[];
  reports: Report[];
  readNotifs: string[];
  viewedTopics: string[];
  recentSearches: string[];
  profile: { name: string; bio: string };
  theme: "light" | "dark";
  installDismissed: boolean;
}

export const DEFAULT_STATE: SiseState = {
  reactions: {},
  saves: { posts: [], places: [], events: [], listings: [] },
  follows: { rooms: ["sisaket", "food", "cafe", "events"], users: [], places: [], events: [] },
  interested: [],
  userPosts: [],
  userComments: [],
  commentLikes: [],
  votes: {},
  blocked: [],
  muted: [],
  reports: [],
  readNotifs: [],
  viewedTopics: [],
  recentSearches: [],
  profile: { name: "คุณ (ผู้เยี่ยมชม)", bio: "เพิ่งมาถึงศรีสะเกษ กำลังสำรวจเมืองนี้อยู่" },
  theme: "light",
  installDismissed: false,
};

const KEY = "sise:v1";
let state: SiseState = DEFAULT_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiseState>;
      state = {
        ...DEFAULT_STATE,
        ...parsed,
        saves: { ...DEFAULT_STATE.saves, ...parsed.saves },
        follows: { ...DEFAULT_STATE.follows, ...parsed.follows },
        profile: { ...DEFAULT_STATE.profile, ...parsed.profile },
      };
    }
  } catch {
    /* storage unavailable or corrupt: start fresh */
  }
}

function emit() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota / private mode: keep in memory only */
  }
  listeners.forEach((l) => l());
}

function set(update: (s: SiseState) => SiseState) {
  load();
  state = update(state);
  emit();
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
      load();
      return selector(state);
    },
    () => selector(DEFAULT_STATE),
  );
}

export const getSise = () => {
  load();
  return state;
};

const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

export const actions = {
  react(postId: string, kind: ReactionKind = "like") {
    set((s) => {
      const next = { ...s.reactions };
      if (next[postId] === kind) delete next[postId];
      else next[postId] = kind;
      return { ...s, reactions: next };
    });
  },
  save(kind: keyof SiseState["saves"], id: string) {
    set((s) => ({ ...s, saves: { ...s.saves, [kind]: toggle(s.saves[kind], id) } }));
  },
  follow(kind: keyof SiseState["follows"], id: string) {
    set((s) => ({ ...s, follows: { ...s.follows, [kind]: toggle(s.follows[kind], id) } }));
  },
  interested(slug: string) {
    set((s) => ({ ...s, interested: toggle(s.interested, slug) }));
  },
  vote(postId: string, optionId: string) {
    set((s) => (s.votes[postId] ? s : { ...s, votes: { ...s.votes, [postId]: optionId } }));
  },
  likeComment(id: string) {
    set((s) => ({ ...s, commentLikes: toggle(s.commentLikes, id) }));
  },
  block(userId: string) {
    set((s) => ({ ...s, blocked: s.blocked.includes(userId) ? s.blocked : [...s.blocked, userId] }));
  },
  unblock(userId: string) {
    set((s) => ({ ...s, blocked: s.blocked.filter((x) => x !== userId) }));
  },
  mute(roomOrUser: string) {
    set((s) => ({ ...s, muted: toggle(s.muted, roomOrUser) }));
  },
  report(input: Omit<Report, "id" | "ageMin" | "status" | "reporterId">) {
    set((s) => ({
      ...s,
      reports: [{ ...input, id: `rp-${Date.now()}`, ageMin: 0, status: "open", reporterId: "u-me" }, ...s.reports],
    }));
  },
  readNotification(id: string) {
    set((s) => (s.readNotifs.includes(id) ? s : { ...s, readNotifs: [...s.readNotifs, id] }));
  },
  readAllNotifications(ids: string[]) {
    set((s) => ({ ...s, readNotifs: Array.from(new Set([...s.readNotifs, ...ids])) }));
  },
  viewTopic(roomSlug: string) {
    set((s) => (s.viewedTopics[0] === roomSlug ? s : { ...s, viewedTopics: [roomSlug, ...s.viewedTopics.filter((x) => x !== roomSlug)].slice(0, 8) }));
  },
  addRecentSearch(term: string) {
    const t = term.trim();
    if (!t) return;
    set((s) => ({ ...s, recentSearches: [t, ...s.recentSearches.filter((x) => x !== t)].slice(0, 6) }));
  },
  setProfile(p: Partial<SiseState["profile"]>) {
    set((s) => ({ ...s, profile: { ...s.profile, ...p } }));
  },
  setTheme(theme: SiseState["theme"]) {
    set((s) => ({ ...s, theme }));
  },
  dismissInstall() {
    set((s) => ({ ...s, installDismissed: true }));
  },
  resetDemo() {
    set(() => DEFAULT_STATE);
  },
  addPost(input: {
    type: PostType;
    roomSlug: string;
    title: string;
    body: string;
    images?: Tone[];
    photos?: string[];
    poll?: string[];
    location?: string;
    placeSlug?: string;
  }): Post {
    const post: Post = {
      id: `up-${Date.now().toString(36)}`,
      type: input.type,
      roomSlug: input.roomSlug,
      authorId: "u-me",
      title: input.title,
      body: input.body,
      ageMin: 0,
      createdAt: Date.now(),
      images: input.images,
      photos: input.photos,
      location: input.location,
      placeSlug: input.placeSlug,
      poll: input.poll ? { endsInHours: 24, options: input.poll.map((label, i) => ({ id: `o${i}`, label, votes: 0 })) } : undefined,
      stats: { views: 1, comments: 0, reactions: 0, saves: 0, shares: 0, velocity: 3 },
    };
    set((s) => ({ ...s, userPosts: [post, ...s.userPosts] }));
    return post;
  },
  deletePost(id: string) {
    set((s) => ({ ...s, userPosts: s.userPosts.filter((p) => p.id !== id) }));
  },
  addComment(input: { postId: string; body: string; parentId?: string }): Comment {
    const comment: Comment = {
      id: `uc-${Date.now().toString(36)}`,
      postId: input.postId,
      parentId: input.parentId,
      authorId: "u-me",
      body: input.body,
      ageMin: 0,
      createdAt: Date.now(),
      likes: 0,
    };
    set((s) => ({ ...s, userComments: [...s.userComments, comment] }));
    return comment;
  },
  deleteComment(id: string) {
    set((s) => ({ ...s, userComments: s.userComments.filter((c) => c.id !== id && c.parentId !== id) }));
  },
};
