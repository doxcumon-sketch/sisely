import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post-detail";
import { getDeal, getListing, getPlace, getEvent, getPost, listComments, queryPosts } from "@/lib/server/repo";
import { getSession } from "@/lib/server/session";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Read per request: the author must be able to see their own pending post, and counts stay fresh.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "ไม่พบโพสต์", robots: { index: false } };
  const description = post.body.replace(/\s+/g, " ").slice(0, 150) || post.title;
  return {
    title: `${post.title} — ${post.room.name}`,
    description,
    alternates: { canonical: `/post/${post.id}` },
    openGraph: { type: "article", title: post.title, description, url: `/post/${post.id}`, authors: [post.author.name] },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const viewer = await getSession();
  const post = await getPost(id, viewer?.id);
  if (!post) notFound();

  const raw = await prisma.post.findUnique({ where: { id }, select: { placeId: true, eventId: true, dealId: true, listingId: true } });
  const [comments, related, place, event, deal, listing] = await Promise.all([
    listComments(id),
    queryPosts({ mode: "hot", roomSlug: post.roomSlug, viewerId: viewer?.id, limit: 4 }),
    post.placeRef ? getPlace(post.placeRef.slug) : null,
    post.eventRef ? getEvent(post.eventRef.slug) : null,
    raw?.dealId ? getDeal(raw.dealId) : null,
    raw?.listingId ? getListing(raw.listingId) : null,
  ]);

  const jsonLd = post.status === "PUBLISHED" ? {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    text: post.body,
    url: `${SITE_URL}/post/${post.id}`,
    datePublished: new Date(post.createdAt).toISOString(),
    author: { "@type": "Person", name: post.author.name },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: post.stats.comments },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: post.stats.reactions },
    ],
    inLanguage: "th",
  } : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <PostDetail
        post={post}
        comments={comments}
        related={related.posts.filter((p) => p.id !== id).slice(0, 3)}
        place={place ?? undefined}
        event={event ?? undefined}
        deal={deal ?? undefined}
        listing={listing ? { ...listing.listing, sellerName: listing.seller.name } : undefined}
      />
    </>
  );
}
