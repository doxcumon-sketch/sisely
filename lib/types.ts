// Domain model for SISE. These mirror the future database tables 1:1 so the mock
// layer in lib/data can be swapped for a real backend without touching components.

export type Tone = "jade" | "laterite" | "gold" | "indigo" | "plum" | "sky" | "ink";

export type PostType =
  | "discussion"
  | "question"
  | "recommendation"
  | "event"
  | "deal"
  | "marketplace"
  | "story"
  | "poll"
  | "announcement";

export type ReactionKind = "like" | "love" | "helpful" | "wow";

export interface User {
  id: string;
  pictureUrl?: string | null;
  handle: string;
  name: string;
  bio: string;
  area: string; // อำเภอ / ย่าน
  tone: Tone;
  joinedDays: number; // days since joining (relative to demo "now")
  followers: number;
  following: number;
  reputation: number; // 0-100, shown subtly
  badge?: "founder" | "local-guide" | "business" | "moderator";
}

export interface Room {
  id: string;
  slug: string;
  name: string;
  icon: string; // lucide icon key, see components/icons.ts
  tone: Tone;
  tagline: string;
  description: string;
  members: number;
  posts: number;
  trending?: boolean;
  group: "city" | "life" | "money" | "interest";
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface SeedPost {
  id: string;
  type: PostType;
  roomSlug: string;
  authorId: string;
  title: string;
  body: string;
  ageMin: number; // minutes since posted (seed data)
  createdAt?: number; // epoch ms (user-created posts)
  images?: Tone[]; // generated art stand-ins for seed content
  poll?: { options: PollOption[]; endsInHours: number };
  placeSlug?: string;
  eventSlug?: string;
  dealId?: string;
  listingId?: string;
  location?: string;
  pinned?: boolean;
  solved?: boolean;
  stats: {
    views: number;
    comments: number;
    reactions: number;
    saves: number;
    shares: number;
    velocity: number; // interactions in the last hour
  };
}

export interface SeedComment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  body: string;
  ageMin: number;
  createdAt?: number;
  likes: number;
  best?: boolean;
}

export type PlaceCategory =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "attraction"
  | "shopping"
  | "activity"
  | "nightlife"
  | "service";

export interface Place {
  id: string;
  slug: string;
  name: string;
  category: PlaceCategory;
  tone: Tone;
  tagline: string;
  description: string;
  address: string;
  district: string;
  lat: number;
  lng: number;
  hours: { day: string; time: string }[];
  phone?: string;
  facebook?: string;
  line?: string;
  priceLevel: 1 | 2 | 3;
  rating: number; // community sentiment 0-5
  reviews: number;
  mentions: string[]; // "คนพูดถึงที่นี่ว่า..."
  highlights: string[];
  followers: number;
  businessSlug?: string;
}

export type EventCategory =
  | "concert"
  | "festival"
  | "market"
  | "sports"
  | "workshop"
  | "exhibition"
  | "community"
  | "food"
  | "culture";

export interface SiseEvent {
  id: string;
  slug: string;
  title: string;
  category: EventCategory;
  tone: Tone;
  summary: string;
  description: string;
  dayOffset: number; // 0 = today, 1 = tomorrow ... resolved at render time
  durationDays: number;
  startTime: string; // "18:00"
  endTime?: string;
  venue: string;
  placeSlug?: string;
  address: string;
  price: string;
  organizer: string;
  contact: string;
  ticketInfo: string;
  interested: number;
  going: number;
}

export interface Deal {
  id: string;
  title: string;
  businessName: string;
  placeSlug?: string;
  businessSlug?: string;
  tone: Tone;
  description: string;
  discount: string;
  endsInHours: number;
  terms: string;
  claimed: number;
  sponsored?: boolean;
}

export type ListingCategory =
  | "electronics"
  | "cars"
  | "motorcycles"
  | "furniture"
  | "local-products"
  | "agriculture"
  | "services"
  | "second-hand";

export interface Listing {
  id: string;
  title: string;
  category: ListingCategory;
  price: number;
  negotiable: boolean;
  condition: "new" | "like-new" | "used" | "n/a";
  location: string;
  description: string;
  sellerId: string;
  tone: Tone;
  ageMin: number;
  saves: number;
  views: number;
  contact: string;
  promoted?: boolean;
}

export type BusinessPlan = "free" | "pro" | "featured" | "sponsored";

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  tone: Tone;
  plan: BusinessPlan;
  verified: boolean;
  address: string;
  phone: string;
  line?: string;
  hours: string;
  offerings: { name: string; note: string; price?: string }[];
  placeSlug?: string;
  followers: number;
  mentions: number;
}

export interface Guide {
  slug: string;
  title: string;
  kicker: string;
  tone: Tone;
  summary: string;
  seoKeywords: string[];
  sections: { heading: string; body: string; placeSlugs?: string[] }[];
  readMin: number;
}

export type NotificationKind =
  | "comment"
  | "reply"
  | "mention"
  | "room"
  | "event"
  | "place"
  | "market"
  | "system";

export interface Notification {
  id: string;
  kind: NotificationKind;
  text: string;
  detail?: string;
  href: string;
  ageMin: number;
  unread: boolean;
  actorId?: string;
}

export interface Report {
  id: string;
  targetType: "post" | "comment" | "user" | "listing";
  targetId: string;
  reason: "spam" | "abuse" | "scam" | "misinfo" | "other";
  reporterId: string;
  ageMin: number;
  status: "open" | "resolved" | "dismissed";
  note?: string;
}

// ---------------------------------------------------------------------------
// View models returned by the server (lib/server/repo.ts) and consumed by components.
// ---------------------------------------------------------------------------

export interface AuthorLite {
  id: string;
  handle: string;
  name: string;
  tone: Tone;
  pictureUrl?: string | null;
  badge?: User["badge"];
}

export interface Post {
  id: string;
  type: PostType;
  roomSlug: string;
  room: { slug: string; name: string; icon: string };
  authorId: string;
  author: AuthorLite;
  title: string;
  body: string;
  ageMin: number; // computed when the server rendered it
  createdAt: number; // epoch ms; clients recompute age from this
  images?: Tone[]; // generated art stand-ins for seeded content
  photos?: string[]; // uploaded photo URLs
  poll?: { options: PollOption[]; endsInHours: number };
  placeRef?: { slug: string; name: string };
  eventRef?: { slug: string; title: string };
  dealId?: string;
  listingId?: string;
  location?: string;
  pinned?: boolean;
  featured?: boolean;
  solved?: boolean;
  status?: "PUBLISHED" | "PENDING_REVIEW" | "HIDDEN";
  stats: {
    views: number;
    comments: number;
    reactions: number;
    saves: number;
    shares: number;
    velocity: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  author: AuthorLite;
  body: string;
  ageMin: number;
  createdAt: number;
  likes: number;
  best?: boolean;
}

export interface Viewer {
  user: { id: string; handle: string; name: string; pictureUrl: string | null; role: "MEMBER" | "MODERATOR" | "ADMIN" };
  reactions: Record<string, ReactionKind>;
  saves: { posts: string[]; places: string[]; events: string[]; listings: string[] };
  follows: { rooms: string[]; users: string[]; places: string[]; events: string[] };
  votes: Record<string, string>;
  commentLikes: string[];
  blocked: string[];
  muted: string[];
  unread: number;
}
