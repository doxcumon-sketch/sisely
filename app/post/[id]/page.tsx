import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post-detail";
import { roomBySlug, seedPosts, userById } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return seedPosts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = seedPosts.find((p) => p.id === id);
  if (!post) return { title: "โพสต์ของคุณ", robots: { index: false } };
  const room = roomBySlug(post.roomSlug);
  const description = post.body.replace(/\s+/g, " ").slice(0, 150);
  return {
    title: `${post.title}${room ? ` — ${room.name}` : ""}`,
    description,
    alternates: { canonical: `/post/${post.id}` },
    openGraph: { type: "article", title: post.title, description, url: `/post/${post.id}`, authors: userById(post.authorId)?.name ? [userById(post.authorId)!.name] : undefined },
    twitter: { card: "summary_large_image", title: post.title, description },
  };
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const seed = seedPosts.find((p) => p.id === id);
  if (!seed && !id.startsWith("up-")) notFound();

  const jsonLd = seed
    ? {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        headline: seed.title,
        text: seed.body,
        url: `${SITE_URL}/post/${seed.id}`,
        author: { "@type": "Person", name: userById(seed.authorId)?.name ?? "สมาชิก SISE" },
        interactionStatistic: [
          { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: seed.stats.comments },
          { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: seed.stats.reactions },
        ],
        inLanguage: "th",
      }
    : null;

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <PostDetail id={id} />
    </>
  );
}
