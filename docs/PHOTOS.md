# Photography slots (destination home page)

The home page is built so real photographs drop in with no code change. Every image slot is a scene id from
`lib/covers.ts`; replace the file in `public/covers/<scene>.jpg` (same name, ≈2400px wide, ≤400KB, landscape unless noted)
and every slot that uses it upgrades. Add author + licence to the entry in `COVER_PHOTOS` so `/credits` stays honest.
Until then the slots show SISE's own artwork (clearly an illustration, not a stock photo).

| Slot (see `lib/destination.ts`) | Scene file | Shot list |
|---|---|---|
| Hero (full screen, 16:9, subject right of centre) | `pha-mo-i-daeng.jpg` | Dawn mist over the cliffs, wide |
| Discover — large portrait (4:5) | `river-mun.jpg` | River Mun, low sun |
| Discover — square | `silk.jpg` | Mat-mee silk close-up |
| Discover — small portrait (3:4) | `lamduan.jpg` | Lamduan blossoms |
| Eat (portrait on mobile, 7:5 on desktop) | `street-food.jpg` | Charcoal grill, smoke, hands |
| Culture (full-bleed, dark) | `sa-kamphaeng-yai.jpg` | Khmer temple, blue hour |
| People ×3 (3:4) | `silk.jpg`, `market.jpg`, `cafe.jpg` | Portraits of makers at work (needs consent + release) |
| Hidden ×3 (3:4, shown mono until hover) | `countryside.jpg`, `shallot.jpg`, `durian.jpg` | Quiet places off the main road |
| Final CTA (full-bleed) | `river-mun.jpg` | Golden river, wide |
| Places / Eat lists | per-place scene (`PLACE_SCENES`) | One image per landmark |

Add new scenes by extending `SceneId` and `COVER_PHOTOS`; the artwork generator is `scripts/gen-covers.py`.
