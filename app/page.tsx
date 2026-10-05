import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/destination/photo";
import { placePhoto, roomPhoto, type SceneId } from "@/lib/covers";
import { DISTRICTS, dateParts, pad2, SLOTS } from "@/lib/destination";
import { upcomingEvents } from "@/lib/queries";
import { listBusinesses, listEvents, listPlaces } from "@/lib/server/repo";
import { SITE_URL } from "@/lib/site";
import type { Place } from "@/lib/types";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "SISAKET — The Soul of Isan | ศรีสะเกษ เมืองเล็ก ไม่ธรรมดา" },
  description: "Discover Sisaket, Thailand: Khmer temples, silk, volcanic-soil durian, night markets and a way of life with another rhythm. ที่เที่ยว ของกิน วัฒนธรรม และงานในศรีสะเกษ",
  alternates: { canonical: "/" },
  openGraph: { title: "SISAKET — The Soul of Isan", description: "A place shaped by people, culture and another rhythm.", type: "website" },
};

const WRAP = "mx-auto w-full max-w-[1600px] px-5 sm:px-10 lg:px-16";
const SECTION = `${WRAP} py-24 sm:py-28 lg:py-36`;
const NOT_A_DESTINATION = /ฟิตเนส|ยิม|พริ้นท์|ซ่อม|อู่|คลินิก|ธนาคาร/;

/** The artwork scene to show for a place: its own landmark scene if it has one, otherwise one that suits its category. */
function sceneOf(p: Place): SceneId {
  const own = placePhoto(p.slug);
  if (own) return own.scene;
  const fallback = roomPhoto(p.category === "cafe" ? "cafe" : p.category === "restaurant" ? "food" : p.category === "shopping" ? "market" : "travel");
  return fallback?.scene ?? "city";
}

function Head({ no, label, title, sub, className = "", size = "clamp(3rem,9vw,8.5rem)" }: { no: string; label: string; title: string; sub?: string; className?: string; size?: string }) {
  return (
    <header data-reveal className={`mb-14 sm:mb-20 ${className}`}>
      <p className="kicker flex items-center gap-4"><span className="num text-base tracking-normal text-gold">{no}</span><span className="h-px w-10 bg-line" />{label}</p>
      <h2 className="display mt-6 uppercase" style={{ fontSize: size }}>{title}</h2>
      {sub && <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{sub}</p>}
    </header>
  );
}

function More({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="link-u kicker text-ink hover:text-gold">
      {children} <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} />
    </Link>
  );
}

export default async function HomePage() {
  const [places, events, businesses] = await Promise.all([listPlaces(), listEvents(), listBusinesses()]);

  const visitable = places.filter((p) => p.category !== "service" && !NOT_A_DESTINATION.test(`${p.name} ${p.tagline}`));
  const sights = visitable.filter((p) => !["restaurant", "cafe", "hotel"].includes(p.category));
  const featured = (sights.length >= 4 ? sights : places).slice(0, 4);
  const foods = visitable.filter((p) => p.category === "restaurant" || p.category === "cafe").slice(0, 5);
  const hidden = [...visitable].sort((a, b) => a.reviews - b.reviews).filter((p) => !featured.includes(p)).slice(0, 3);
  const comingUp = upcomingEvents(events, 5);
  const makers = businesses.slice(0, 3);
  const perDistrict = new Map<string, number>();
  for (const p of places) {
    const key = p.district.replace(/^อ\./, "");
    perDistrict.set(key, (perDistrict.get(key) ?? 0) + 1);
  }
  const today = dateParts(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "Sisaket",
    alternateName: "ศรีสะเกษ",
    description: "Sisaket, Thailand — Khmer temples, silk, durian, night markets and a way of life with another rhythm.",
    url: SITE_URL,
    geo: { "@type": "GeoCoordinates", latitude: 15.1186, longitude: 104.3222 },
    touristType: ["Culture", "Food", "Nature", "Local life"],
    containedInPlace: { "@type": "Country", name: "Thailand" },
  };

  return (
    <div className="overflow-x-clip">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* 1 — HERO */}
      <section className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden text-[#f1eadb]" aria-labelledby="hero-title">
        <div className="photo-fill -z-20 hero-parallax"><div className="photo-fill hero-photo"><Photo scene={SLOTS.hero} priority sizes="100vw" alt="Misty dawn over the cliffs of Pha Mo I Daeng, Sisaket" /></div></div>
        <div className="photo-fill -z-10 hero-shade" aria-hidden="true" />
        <div className={`${WRAP} hero-copy pb-10 pt-40 sm:pb-14`}>
          <p className="kicker hero-in d1 !text-[#f1eadb]/70">Destination · Thailand</p>
          <h1 id="hero-title" className="display hero-in d2 mt-5 text-[clamp(3.6rem,19vw,17rem)] uppercase leading-[0.86] tracking-[0.015em]">Sisaket</h1>
          <p className="display-i hero-in d3 mt-4 text-[clamp(1.5rem,3.6vw,3.2rem)] text-[#d8bd8d]">The soul of Isan</p>
          <div className="hero-in d4 mt-12 grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-lg">
              <p className="text-lg leading-relaxed text-[#f1eadb]/85 sm:text-xl">A place shaped by people, culture and another rhythm.</p>
              <p className="mt-2 text-sm text-[#f1eadb]/60">ศรีสะเกษ เมืองเล็ก ไม่ธรรมดา</p>
            </div>
            <a href="#discover" className="link-u kicker !text-[#f1eadb] text-[0.8rem]">Explore <ArrowRight className="arrow h-5 w-5" strokeWidth={1.25} /></a>
          </div>
          <dl className="hero-fade mt-14 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#f1eadb]/20 pt-5 text-[0.7rem] uppercase tracking-[0.22em] text-[#f1eadb]/85 sm:grid-cols-4">
            <div><dt className="sr-only">Location</dt><dd>15.12°N · 104.32°E</dd></div>
            <div><dt className="sr-only">Date</dt><dd>{today.day} {today.month} {today.year}</dd></div>
            <div><dt className="sr-only">Themes</dt><dd>Culture · Food · Nature</dd></div>
            <div className="sm:text-right"><dt className="sr-only">Scroll</dt><dd>Scroll ↓</dd></div>
          </dl>
        </div>
      </section>

      {/* 2 — DISCOVER */}
      <section id="discover" className={SECTION} aria-labelledby="discover-h">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Head no="01" label="Discover Sisaket" title="Another rhythm" size="clamp(2.8rem,5.6vw,6rem)" className="!mb-10 sm:!mb-12" />
              <h3 id="discover-h" className="font-editorial text-[clamp(1.5rem,2.6vw,2.2rem)] font-normal leading-snug" data-reveal>ไม่ใช่เมืองที่ตะโกน แต่เป็นเมืองที่ฮัมเพลงเบาๆ</h3>
              <p className="mt-6 max-w-md leading-[1.9] text-ink-2" data-reveal>
                ที่ราบสูงอีสานตอนล่างติดชายแดน ที่เขมร กูย เยอ และลาว อยู่ร่วมกันมาหลายชั่วอายุคน ปราสาทขอมกลางทุ่ง ผ้าไหมมัดหมี่ที่ทอด้วยมือ ทุเรียนที่เติบโตบนดินภูเขาไฟ ตลาดเช้าที่ตื่นก่อนตะวัน และลำดวน ดอกไม้ประจำจังหวัดที่หอมที่สุดในยามเย็น
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted" data-reveal>A border province where Khmer, Kuy, Yer and Lao communities share one table — slow mornings, silk looms, temple ruins in the fields.</p>
              <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8" data-reveal>
                {[["22", "Districts"], ["4", "Languages"], ["1", "Flower"]].map(([n, l]) => (
                  <div key={l}><dd className="num text-5xl">{n}</dd><dt className="kicker mt-2">{l}</dt></div>
                ))}
              </dl>
            </div>
          </div>
          <div className="relative grid grid-cols-6 gap-4 sm:gap-6 lg:col-span-7">
            <figure className="frame img-wipe col-span-4 aspect-[4/5]"><Photo scene={SLOTS.discover[0]} sizes="(min-width:1024px) 40vw, 70vw" /><figcaption className="sr-only">The Mun river at dusk</figcaption></figure>
            <figure className="frame img-wipe col-span-2 col-start-5 mt-24 aspect-[2/3] sm:mt-40"><Photo scene={SLOTS.discover[1]} sizes="(min-width:1024px) 20vw, 35vw" /><figcaption className="sr-only">Mat-mee silk pattern</figcaption></figure>
            <figure className="frame img-wipe col-span-4 col-start-2 -mt-6 aspect-[16/10] sm:-mt-16"><Photo scene={SLOTS.discover[2]} sizes="(min-width:1024px) 40vw, 70vw" /><figcaption className="sr-only">Lamduan flowers</figcaption></figure>
          </div>
        </div>
      </section>

      {/* 3 — PLACES */}
      <section id="places" className={SECTION} aria-labelledby="places-h">
        <Head no="02" label="Places" title="Places" sub="ผามหมอกยามเช้า ปราสาทกลางทุ่ง และมุมเมืองที่ควรไปยืนสักครั้ง" />
        <h3 id="places-h" className="sr-only">Featured places</h3>
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-12">
          {featured.map((p, i) => {
            const span = ["sm:col-span-7", "sm:col-span-5 sm:mt-32", "sm:col-span-5", "sm:col-span-7 sm:-mt-16"][i] ?? "sm:col-span-6";
            const ratio = ["aspect-[4/5]", "aspect-[1/1]", "aspect-[1/1]", "aspect-[16/10]"][i] ?? "aspect-[4/3]";
            return (
              <Link key={p.id} href={`/places/${p.slug}`} data-reveal className={`group block ${span}`}>
                <div className={`frame frame-shade ${ratio}`}>
                  <Photo scene={sceneOf(p)} sizes="(min-width:1024px) 55vw, 100vw" />
                  <span className="num absolute left-5 top-4 z-10 text-3xl text-[#f1eadb]/90">{pad2(i + 1)}</span>
                  <span className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center border border-[#f1eadb]/40 text-[#f1eadb] opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" strokeWidth={1.5} /></span>
                </div>
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <p className="kicker">{p.district.replace(/^อ\./, "")} · {p.category}</p>
                    <h3 className="font-editorial mt-2 text-2xl font-normal leading-tight sm:text-3xl">{p.name}</h3>
                  </div>
                  <p className="hidden max-w-[16rem] pt-1 text-sm leading-relaxed text-muted sm:block">{p.tagline}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-16 flex justify-end"><More href="/places">All places</More></div>
      </section>

      {/* 4 — EAT */}
      <section id="eat" className="border-y border-line bg-paper-2" aria-labelledby="eat-h">
        <div className={`${WRAP} !px-0`}>
          <div className="grid lg:grid-cols-12">
            <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[44rem]">
              <div className="photo-fill img-wipe"><Photo scene={SLOTS.eat} sizes="(min-width:1024px) 58vw, 100vw" alt="Charcoal grill and smoke at a night food stall" /></div>
              <div className="photo-fill bg-gradient-to-t from-black/70 via-transparent to-transparent" aria-hidden="true" />
              <p className="display absolute bottom-6 left-6 text-[clamp(5rem,16vw,13rem)] uppercase leading-[0.8] text-[#f1eadb] sm:bottom-10 sm:left-10" aria-hidden="true">Eat</p>
            </div>
            <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:col-span-5 lg:px-14 lg:py-28">
              <p className="kicker flex items-center gap-4"><span className="num text-base tracking-normal text-gold">03</span><span className="h-px w-10 bg-line" />Eat &amp; drink</p>
              <h2 id="eat-h" className="font-editorial mt-6 text-[clamp(1.8rem,3.2vw,2.8rem)] font-normal leading-tight" data-reveal>ข้าวเหนียวหมูปิ้งตอนตีห้า กาแฟดริปหลังเที่ยง และควันจากเตาถ่านยามค่ำ</h2>
              <ul className="mt-12 divide-y divide-line border-y border-line">
                {foods.map((p) => (
                  <li key={p.id}>
                    <Link href={`/places/${p.slug}`} className="group flex items-baseline gap-4 py-5 transition-colors hover:text-gold">
                      <span className="kicker w-14 shrink-0">{p.category === "cafe" ? "Café" : "Table"}</span>
                      <span className="min-w-0 flex-1"><span className="font-editorial block truncate text-xl font-normal">{p.name}</span><span className="block truncate text-sm text-muted">{p.tagline}</span></span>
                      <span className="text-xs tracking-widest text-faint">{"฿".repeat(p.priceLevel)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10"><More href="/places?cat=restaurant">All food &amp; cafés</More></div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 — CULTURE */}
      <section id="culture" className="relative isolate overflow-hidden text-[#f1eadb]" aria-labelledby="culture-h">
        <div className="photo-fill -z-20"><div className="photo-fill parallax-slow scale-125"><Photo scene={SLOTS.culture} sizes="100vw" alt="Khmer-style temple glowing at night" /></div></div>
        <div className="photo-fill -z-10 bg-[linear-gradient(180deg,var(--paper)_0%,rgb(11_11_12/0.55)_22%,rgb(11_11_12/0.7)_78%,var(--paper)_100%)]" aria-hidden="true" />
        <div className={SECTION}>
          <p className="kicker flex items-center gap-4 !text-[#f1eadb]/70"><span className="num text-base tracking-normal text-[#d8bd8d]">04</span><span className="h-px w-10 bg-[#f1eadb]/30" />Culture</p>
          <h2 id="culture-h" className="display mt-8 text-[clamp(3rem,10vw,9rem)] uppercase" data-reveal>Khmer. <span className="display-i normal-case text-[#d8bd8d]">Kuy.</span> Yer. <span className="display-i normal-case text-[#d8bd8d]">Lao.</span></h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#f1eadb]/80" data-reveal>หลายภาษา หลายความเชื่อ บนผืนดินเดียวกัน วัฒนธรรมที่ไม่ได้อยู่ในพิพิธภัณฑ์ แต่อยู่ในกี่ทอผ้า ในบทสวด และในมื้อเย็นของทุกบ้าน</p>
          <div className="mt-20 grid gap-px bg-[#f1eadb]/15 sm:grid-cols-3">
            {[
              ["I", "Temples in the fields", "ปราสาทขอมอายุหลายร้อยปีที่ยังมีผู้คนมาไหว้ เดินชมได้ในยามเช้าที่ยังไม่ร้อน"],
              ["II", "Silk, tied by hand", "มัดหมี่ลายโบราณที่ทอด้วยมือ แต่ละผืนใช้เวลานาน และไม่มีผืนไหนเหมือนกัน"],
              ["III", "Lamduan", "ดอกไม้ประจำจังหวัด กลีบเรียวสีนวลที่หอมที่สุดตอนพลบค่ำ"],
            ].map(([n, t, d]) => (
              <div key={n} className="bg-[rgb(11_11_12/0.55)] p-8 backdrop-blur-md sm:p-10" data-reveal>
                <p className="num text-3xl text-[#d8bd8d]">{n}</p>
                <h3 className="display mt-8 text-3xl normal-case leading-tight">{t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[#f1eadb]/70">{d}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap gap-x-10 gap-y-4">
            <Link href="/rooms/culture" className="link-u kicker !text-[#f1eadb]">Culture room <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} /></Link>
            <Link href="/guide" className="link-u kicker !text-[#f1eadb]">City guides <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      {/* 6 — PEOPLE */}
      <section id="people" className={SECTION} aria-labelledby="people-h">
        <Head no="05" label="People" title="People" sub="ผู้คนที่ทำให้ศรีสะเกษเป็นศรีสะเกษ ช่างทอ คนทำกาแฟ ชาวสวน และคนที่เปิดร้านเล็กๆ ในเมือง" />
        <h3 id="people-h" className="sr-only">Makers and local businesses</h3>
        <div className="grid gap-6 sm:grid-cols-3">
          {makers.map((b, i) => (
            <Link key={b.id} href={`/business/${b.slug}`} data-reveal className={`group block ${i === 1 ? "sm:mt-20" : i === 2 ? "sm:mt-40" : ""}`}>
              <div className="frame frame-shade aspect-[3/4]">
                <Photo scene={SLOTS.people[i % SLOTS.people.length]} sizes="(min-width:640px) 30vw, 100vw" />
                {b.verified && <span className="absolute left-4 top-4 z-10 border border-[#f1eadb]/40 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.22em] text-[#f1eadb]">Verified</span>}
                <div className="absolute inset-x-0 bottom-0 z-10 p-5 text-[#f1eadb]">
                  <p className="kicker !text-[#f1eadb]/70">{b.category}</p>
                  <p className="font-editorial mt-2 text-2xl font-normal leading-tight">{b.name}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">{b.tagline}</p>
            </Link>
          ))}
        </div>
        <aside className="mt-24 grid items-end gap-8 border-t border-line pt-10 sm:grid-cols-[1fr_auto]" data-reveal>
          <p className="display-i max-w-2xl text-[clamp(1.6rem,3vw,2.6rem)] leading-snug">Know someone we should meet? <span className="font-editorial text-ink-2 not-italic">แนะนำคนที่ควรได้รู้จักให้เรา</span></p>
          <More href="/create?type=recommendation">Nominate</More>
        </aside>
      </section>

      {/* 7 — EVENTS */}
      <section id="events" className={`${SECTION} border-t border-line`} aria-labelledby="events-h">
        <Head no="06" label="Events" title="Happening" sub="เทศกาล ตลาดนัด ดนตรี และกิจกรรมที่กำลังจะเกิดขึ้นในเมือง" />
        <h3 id="events-h" className="sr-only">Upcoming events</h3>
        <ol className="border-t border-line">
          {comingUp.map((e) => {
            const d = dateParts(e.dayOffset);
            return (
              <li key={e.id} data-reveal>
                <Link href={`/events/${e.slug}`} className="group grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-2 border-b border-line py-7 transition-colors hover:bg-paper-2 sm:grid-cols-[7rem_1fr_14rem_3rem] sm:gap-x-10 sm:px-4">
                  <div><p className="num text-5xl leading-none sm:text-6xl">{d.day}</p><p className="kicker mt-1">{d.month}</p></div>
                  <div className="min-w-0"><p className="font-editorial text-xl font-normal leading-snug transition-colors group-hover:text-gold sm:text-3xl">{e.title}</p><p className="mt-1 text-sm text-muted sm:hidden">{e.startTime} · {e.venue}</p></div>
                  <p className="kicker hidden sm:block">{e.startTime} · {e.venue}</p>
                  <ArrowUpRight className="hidden h-5 w-5 justify-self-end text-faint transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold sm:block" strokeWidth={1.25} />
                </Link>
              </li>
            );
          })}
          {!comingUp.length && <li className="py-10 text-muted">ยังไม่มีงานที่ลงทะเบียน ติดตามเร็วๆ นี้</li>}
        </ol>
        <div className="mt-12 flex justify-end"><More href="/events">Full calendar</More></div>
      </section>

      {/* 8 — HIDDEN */}
      <section id="hidden" className="relative isolate overflow-hidden border-y border-line bg-[#070708] text-[#f1eadb]" aria-labelledby="hidden-h">
        <div className={SECTION}>
          <header data-reveal className="mb-16 grid items-end gap-8 sm:mb-24 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="kicker flex items-center gap-4 !text-[#f1eadb]/60"><span className="num text-base tracking-normal text-[#d8bd8d]">07</span><span className="h-px w-10 bg-[#f1eadb]/25" />Locals only</p>
              <h2 id="hidden-h" className="display mt-6 text-[clamp(3rem,9vw,8.5rem)] uppercase">Hidden <span className="display-i normal-case text-[#d8bd8d]">Sisaket</span></h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#f1eadb]/65">ที่ที่คนในพื้นที่ไม่ค่อยบอกใคร เก็บไว้เล่าต่อกันเงียบๆ<br /><span className="text-[#f1eadb]/40">Told quietly, passed on slowly.</span></p>
          </header>
          <div className="grid gap-px bg-[#f1eadb]/12 sm:grid-cols-3">
            {hidden.map((p, i) => (
              <Link key={p.id} href={`/places/${p.slug}`} className="group relative block bg-[#070708] p-3 sm:p-4" data-reveal>
                <div className="frame mono-hover aspect-[3/4]">
                  <Photo scene={sceneOf(p)} sizes="(min-width:640px) 30vw, 100vw" />
                  <div className="photo-fill bg-gradient-to-t from-black/85 via-transparent to-black/20" aria-hidden="true" />
                  <p className="num absolute left-4 top-3 text-2xl text-[#f1eadb]/80">No. {pad2(i + 1)}</p>
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-editorial text-2xl font-normal leading-tight">{p.name}</p>
                    <p className="mt-2 line-clamp-2 text-sm text-[#f1eadb]/65">{p.tagline}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6">
            <p className="display-i max-w-xl text-2xl text-[#f1eadb]/80">Got a place only locals know?</p>
            <Link href="/create?type=recommendation" className="link-u kicker !text-[#d8bd8d]">Whisper it to us <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} /></Link>
          </div>
        </div>
      </section>

      {/* 9 — DISTRICTS */}
      <section id="districts" className={SECTION} aria-labelledby="districts-h">
        <div className="grid gap-14 lg:grid-cols-12">
          <Head no="08" label="Explore by district" title="22 Districts" sub="เลือกอำเภอ แล้วดูว่ามีอะไรรออยู่" className="!mb-0 lg:col-span-5" />
          <h3 id="districts-h" className="sr-only">Districts of Sisaket</h3>
          <ol className="gap-x-12 sm:columns-2 lg:col-span-7" data-reveal>
            {DISTRICTS.map((d, i) => {
              const n = perDistrict.get(d) ?? 0;
              return (
                <li key={d} className="break-inside-avoid">
                  <Link href={`/places?district=${encodeURIComponent(`อ.${d}`)}`} className="district">
                    <span className="kicker w-7 shrink-0">{pad2(i + 1)}</span>
                    <span className="font-editorial text-xl font-normal">{d}</span>
                    {n > 0 && <span className="text-xs text-faint">{n}</span>}
                    <ArrowRight className="arrow h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 10 — FINAL CTA */}
      <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden text-center text-[#f1eadb]" aria-labelledby="cta-h">
        <div className="photo-fill -z-20"><div className="photo-fill parallax-slow scale-125"><Photo scene={SLOTS.cta} sizes="100vw" alt="Golden light on the Mun river" /></div></div>
        <div className="photo-fill -z-10 bg-[linear-gradient(180deg,var(--paper)_0%,rgb(11_11_12/0.5)_30%,rgb(11_11_12/0.6)_70%,var(--paper)_100%)]" aria-hidden="true" />
        <div className={`${WRAP} py-32`}>
          <p className="kicker !text-[#f1eadb]/70" data-reveal>Your turn</p>
          <h2 id="cta-h" className="display mt-8 text-[clamp(3.2rem,11vw,10rem)] uppercase" data-reveal>Come find<br />your Sisaket</h2>
          <p className="display-i mx-auto mt-8 max-w-xl text-[clamp(1.4rem,2.6vw,2.2rem)] text-[#d8bd8d]" data-reveal>Discover somewhere you didn’t expect.</p>
          <Link href="/discover" className="btn-shine press mt-14 inline-flex items-center gap-4 bg-[#e8d2a8] px-10 py-5 text-[0.78rem] font-medium uppercase tracking-[0.3em] text-[#0b0b0c] hover:bg-[#f3e2bd]" data-reveal>
            Explore Sisaket <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
