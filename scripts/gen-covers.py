#!/usr/bin/env python3
"""
Generates SISE's original cover artwork (contemporary "noir & gold" editorial style) as SVG.
Render to JPEG with:  node scripts/render-covers.mjs   (uses Playwright/Chromium)
The art is ours: no third-party imagery, so there is nothing to license or credit.
"""
import math, random, os, sys

W, H = 1600, 900
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/covers-svg"
os.makedirs(OUT, exist_ok=True)

GOLD = "#e1cca7"; GOLD2 = "#a78461"; IVORY = "#f3ecde"; EM = "#5f432e"; EMD = "#261b13"; INK = "#130d09"; LAT = "#ad7f51"

def lg(i, stops, x1=0, y1=0, x2=0, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'

def rg(i, stops, cx=.5, cy=.5, r=.5):
    s = "".join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'

COMMON = (
    '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7" result="n"/>'
    '<feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>'
    '<filter id="blur30"><feGaussianBlur stdDeviation="30"/></filter><filter id="blur12"><feGaussianBlur stdDeviation="12"/></filter><filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>'
    + rg("vig", [(.5, "#000", 0), (1, "#000", .5)], .5, .5, .75)
)

def frame(defs, body, grain=.10, vig=True):
    g = f'<rect width="{W}" height="{H}" filter="url(#grain)" opacity="{grain}" style="mix-blend-mode:overlay"/>' if grain else ""
    v = f'<rect width="{W}" height="{H}" fill="url(#vig)"/>' if vig else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{COMMON}{defs}</defs>{body}{v}{g}</svg>'

def contour(y, amp, seed, steps=10, base=H):
    random.seed(seed)
    pts = [(W * i / steps, y + random.uniform(-amp, amp)) for i in range(steps + 1)]
    d = f"M0 {base} L{pts[0][0]:.0f} {pts[0][1]:.1f} "
    for i in range(1, len(pts)):
        x0, y0 = pts[i - 1]; x1, y1 = pts[i]; cx = (x0 + x1) / 2
        d += f"C{cx:.0f} {y0:.1f} {cx:.0f} {y1:.1f} {x1:.0f} {y1:.1f} "
    return d + f"L{W} {base} Z"

def line_of(y, amp, seed, steps=10):
    return contour(y, amp, seed, steps).replace(f"M0 {H} L", "M").rsplit(" L", 1)[0].replace(f"{W} {H}", "")

def hair(d, col=GOLD, w=1.6, op=.9, extra=""):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{w}" opacity="{op}" {extra}/>'

S = {}

# ---- pha-mo-i-daeng: dawn over layered ridges
defs = lg("sky", [(0, "#19120c", 1), (.5, "#4d3f34", 1), (.82, "#cda766", 1), (1, "#e8d7ba", 1)]) + rg("sun", [(0, "#f7f0e5", 1), (.35, "#e8d4b1", .55), (1, "#e8d4b1", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/>'
b += '<circle cx="1010" cy="520" r="330" fill="url(#sun)"/><circle cx="1010" cy="520" r="62" fill="#f8f3e9"/>'
cols = ["#988e85", "#7d7064", "#605447", "#453a31", "#31261e", "#1f1711"]
for i, c in enumerate(cols):
    b += f'<path d="{contour(520 + i * 62, 22 + i * 4, 30 + i)}" fill="{c}" opacity="{.55 + i * .08:.2f}"/>'
    b += hair(line_of(520 + i * 62, 22 + i * 4, 30 + i), GOLD, 1.1, .35)
b += f'<rect y="560" width="{W}" height="120" fill="#f7f0e4" opacity=".14" filter="url(#blur30)"/><rect y="660" width="{W}" height="90" fill="#f7f0e4" opacity=".12" filter="url(#blur30)"/>'
b += f'<path d="M0 900 L0 700 C160 660 300 690 430 760 L520 900 Z" fill="#120d0a"/><path d="M1180 900 C1230 800 1380 760 1600 730 L1600 900 Z" fill="#120d0a"/>'
b += '<g fill="#120d0a"><circle cx="430" cy="706" r="9"/><path d="M416 716 Q430 708 444 716 L447 760 L413 760 Z"/></g>'
S["pha-mo-i-daeng"] = frame(defs, b)

# ---- sa-kamphaeng-yai: gold prang on deep emerald
defs = lg("bg", [(0, INK, 1), (.6, EMD, 1), (1, "#3f2d1f", 1)]) + rg("glow", [(0, "#e1cca7", .5), (1, "#e1cca7", 0)], .5, .55, .5) + lg("tw", [(0, "#f0e3cc", 1), (1, "#a78461", 1)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="800" cy="470" r="420" fill="url(#glow)"/>'
b += '<circle cx="800" cy="300" r="120" fill="none" stroke="#e1cca7" stroke-width="1.5" opacity=".5"/><circle cx="800" cy="300" r="180" fill="none" stroke="#e1cca7" stroke-width="1" opacity=".25"/>'
def prang(cx, base, h, w, op=1):
    o = f'<g opacity="{op}">'
    for i in range(6):
        tw = w * (1 - i * .13); y = base - h * (i * .15)
        o += f'<path d="M{cx - tw / 2:.0f} {y:.0f} L{cx - tw / 2 + 12:.0f} {y - h * .13:.0f} L{cx + tw / 2 - 12:.0f} {y - h * .13:.0f} L{cx + tw / 2:.0f} {y:.0f} Z" fill="url(#tw)" opacity="{.95 - i * .06:.2f}"/>'
        o += f'<path d="M{cx - tw / 2 + 12:.0f} {y - h * .13:.0f} L{cx + tw / 2 - 12:.0f} {y - h * .13:.0f}" stroke="#261b13" stroke-width="2"/>'
    o += f'<path d="M{cx - w * .1:.0f} {base - h * .9:.0f} Q{cx} {base - h * 1.2:.0f} {cx + w * .1:.0f} {base - h * .9:.0f} Z" fill="url(#tw)"/><rect x="{cx - 2}" y="{base - h * 1.28:.0f}" width="4" height="{h * .1:.0f}" fill="#ebddc4"/>'
    o += f'<rect x="{cx - w * .08:.0f}" y="{base - h * .2:.0f}" width="{w * .16:.0f}" height="{h * .2:.0f}" fill="#261b13"/></g>'
    return o
b += prang(800, 760, 380, 250) + prang(600, 760, 230, 150, .85) + prang(1000, 760, 230, 150, .85)
b += f'<rect y="760" width="{W}" height="140" fill="#20160f"/>' + hair(f"M0 760 H{W}", GOLD, 1.5, .6)
for i in range(9): b += hair(f"M{200 + i * 150} 760 V900", GOLD, 1, .12)
S["sa-kamphaeng-yai"] = frame(defs, b)

# ---- temple: concentric gold chedi
defs = lg("bg", [(0, "#1b130d", 1), (.7, "#3f2d1f", 1), (1, "#7a5b3d", 1)]) + rg("halo", [(0, "#f2e6d1", .65), (1, "#f2e6d1", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="800" cy="420" r="400" fill="url(#halo)"/>'
for r in [150, 220, 290, 360]: b += f'<circle cx="800" cy="420" r="{r}" fill="none" stroke="#e1cca7" stroke-width="1.2" opacity="{.5 - r / 1000:.2f}"/>'
b += '<g transform="translate(800 790)"><path d="M-210 0 L-176 -74 L176 -74 L210 0 Z" fill="#98795a"/><path d="M-150 -74 L-118 -150 L118 -150 L150 -74 Z" fill="#bfa16d"/><path d="M-96 -150 L-72 -240 L72 -240 L96 -150 Z" fill="#98795a"/><path d="M-64 -240 Q0 -490 64 -240 Z" fill="#d9c196"/><rect x="-3" y="-560" width="6" height="86" fill="#d9c196"/><circle cy="-568" r="9" fill="#f7f0e5"/></g>'
b += f'<path d="M0 790 H{W}" stroke="#e1cca7" stroke-width="1.5" opacity=".6"/><rect y="790" width="{W}" height="110" fill="#0c1413"/>'
S["temple"] = frame(defs, b)

# ---- rice-field: flowing terraces at golden hour
defs = lg("sky", [(0, "#213835", 1), (.5, "#8da5a2", 1), (1, "#ecdfc9", 1)]) + rg("sun", [(0, "#f6eedf", 1), (1, "#f6eedf", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="520" cy="430" r="300" fill="url(#sun)" opacity=".7"/><circle cx="520" cy="430" r="46" fill="#fbf7f0"/>'
gs = ["#84a6a2", "#6a8e89", "#5c7a76", "#4a6562", "#324c48", "#223936"]
for i, c in enumerate(gs):
    b += f'<path d="{contour(480 + i * 70, 30 + i * 8, 40 + i)}" fill="{c}"/>' + hair(line_of(480 + i * 70, 30 + i * 8, 40 + i), "#d6e9e6", 1.1, .35)
    random.seed(60 + i)
    for k in range(18 + i * 6):
        x = random.uniform(0, W); y = 500 + i * 70 + random.uniform(0, 60)
        b += f'<path d="M{x:.0f} {y:.0f} q3 -{14 + i * 3} 8 -{22 + i * 5}" stroke="#bedad7" stroke-width="2" fill="none" opacity=".35"/>'
S["rice-field"] = frame(defs, b)

# ---- river-mun: liquid gold reflection
defs = lg("sky", [(0, "#261c14", 1), (.55, "#6f5a45", 1), (1, "#d5b47b", 1)]) + lg("wat", [(0, "#d5b47b", 1), (.35, "#594e43", 1), (1, "#261c14", 1)]) + rg("sun", [(0, "#f6eedf", 1), (1, "#e9d4b2", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="800" cy="440" r="330" fill="url(#sun)" opacity=".7"/><circle cx="800" cy="440" r="54" fill="#f7f0e5"/>'
b += f'<rect y="470" width="{W}" height="430" fill="url(#wat)"/>'
for i in range(34):
    y = 484 + i * 12.5; w = 40 + i * 20; op = max(.08, .85 - i * .03)
    b += f'<rect x="{800 - w / 2:.0f}" y="{y:.0f}" width="{w}" height="3" rx="1.5" fill="#efe2ca" opacity="{op:.2f}"/>'
for i in range(12):
    y = 520 + i * 30
    b += hair(f"M0 {y} C400 {y - 14} 800 {y + 14} 1200 {y - 10} S1500 {y + 6} 1600 {y}", "#e0ccaa", 1, .18)
b += f'<path d="M0 470 C260 440 440 468 640 468 L640 500 L0 540 Z" fill="#1c1611"/><path d="M1600 470 C1340 440 1180 468 1000 468 L1000 500 L1600 560 Z" fill="#1c1611"/>'
S["river-mun"] = frame(defs, b)

# ---- durian: macro spikes pattern, emerald & gold
defs = lg("bg", [(0, "#5f432e", 1), (1, "#261b13", 1)], 0, 0, 1, 1) + rg("hl", [(0, "#ebddc4", .55), (1, "#ebddc4", 0)], .3, .25, .6)
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect width="{W}" height="{H}" fill="url(#hl)"/>'
random.seed(5)
for r_ in range(-1, 9):
    for c in range(-1, 14):
        x = c * 130 + (65 if r_ % 2 else 0); y = r_ * 112
        sh = random.uniform(.55, 1)
        b += f'<path d="M{x} {y - 62} L{x + 56} {y - 4} L{x} {y + 62} L{x - 56} {y - 4} Z" fill="url(#bg)" stroke="#e1cca7" stroke-width="1.3" opacity="{.4 + sh * .5:.2f}"/>'
        b += f'<path d="M{x} {y - 62} L{x} {y + 62} M{x - 56} {y - 4} L{x + 56} {y - 4}" stroke="#e1cca7" stroke-width=".7" opacity="{.15 + sh * .25:.2f}"/>'
b += '<circle cx="1180" cy="330" r="190" fill="#261b13" opacity=".55"/><circle cx="1180" cy="330" r="190" fill="none" stroke="#e1cca7" stroke-width="1.5" opacity=".7"/>'
S["durian"] = frame(defs, b)

# ---- shallot: perspective rows
defs = lg("sky", [(0, "#33261c", 1), (.55, "#b9a47f", 1), (1, "#e8d5b4", 1)]) + lg("soil", [(0, "#554030", 1), (1, "#261c14", 1)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/>' + f'<path d="{contour(420, 12, 70)}" fill="#4f4840" opacity=".7"/><rect y="430" width="{W}" height="470" fill="url(#soil)"/>'
vx, vy = 800, 430
for k in range(-12, 13):
    xb = 800 + k * 190
    b += f'<path d="M{vx} {vy} L{xb - 44} {H} L{xb + 44} {H} Z" fill="#6d553d" opacity=".5"/>' + hair(f"M{vx} {vy} L{xb} {H}", "#e1cca7", 1, .28)
random.seed(8)
for r_ in range(1, 17):
    t = (r_ / 16) ** 1.9; y = vy + t * (H - vy)
    for k in range(-12, 13):
        x = vx + (k * 190) * t
        s = .12 + t * 1.15
        b += f'<g transform="translate({x:.0f} {y:.0f}) scale({s:.2f})"><ellipse cx="0" cy="-8" rx="13" ry="16" fill="#9f7d5b"/><ellipse cx="-3" cy="-12" rx="4" ry="7" fill="#dfcaa7" opacity=".6"/><path d="M0 -22 C-5 -52 0 -70 -10 -94 M0 -22 C3 -54 9 -66 15 -90" stroke="#8ab4af" stroke-width="4" fill="none" stroke-linecap="round"/></g>'
b += f'<rect y="430" width="{W}" height="60" fill="#e8d5b4" opacity=".2" filter="url(#blur30)"/>'
S["shallot"] = frame(defs, b)

# ---- silk: refined matmi lattice, indigo & gold
defs = lg("bg", [(0, "#261b13", 1), (1, "#36271c", 1)], 0, 0, 1, 1) + rg("hl", [(0, "#e1cca7", .35), (1, "#e1cca7", 0)], .7, .3, .7)
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect width="{W}" height="{H}" fill="url(#hl)"/>'
bands = [GOLD, "#f3ecde", "#a17447", "#779893"]
y = 0
for i in range(8):
    hh = 112; col = bands[i % 4]
    b += f'<rect y="{y}" width="{W}" height="{hh}" fill="#000" opacity="{.18 if i % 2 else .06}"/>'
    for x in range(-35, W + 70, 70):
        off = 35 if i % 2 else 0; cx = x + off; cy = y + hh / 2
        b += f'<path d="M{cx} {cy - 42} L{cx + 32} {cy} L{cx} {cy + 42} L{cx - 32} {cy} Z" fill="none" stroke="{col}" stroke-width="2" opacity=".85"/><path d="M{cx} {cy - 22} L{cx + 17} {cy} L{cx} {cy + 22} L{cx - 17} {cy} Z" fill="{col}" opacity=".75"/>'
    b += f'<rect y="{y + hh - 3}" width="{W}" height="1.5" fill="{GOLD}" opacity=".6"/>'
    y += hh
S["silk"] = frame(defs, b, grain=.16)

# ---- lamduan: botanical gold line-art on emerald
defs = lg("bg", [(0, "#483322", 1), (1, "#20160f", 1)], 0, 0, 1, 1) + rg("bk", [(0, "#ebddc4", .5), (1, "#ebddc4", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
random.seed(4)
for _ in range(10): b += f'<circle cx="{random.uniform(0, W):.0f}" cy="{random.uniform(0, H):.0f}" r="{random.uniform(40, 110):.0f}" fill="url(#bk)" opacity="{random.uniform(.25, .6):.2f}"/>'
b += hair("M-40 780 C300 620 640 660 900 480 C1180 300 1400 330 1660 150", GOLD, 3, .8)
def leaf(x, y, rot, s):
    return f'<g transform="translate({x} {y}) rotate({rot}) scale({s})"><path d="M0 0 C40 -34 120 -34 176 0 C120 34 40 34 0 0 Z" fill="#254440" stroke="{GOLD}" stroke-width="1.5" opacity=".95"/><path d="M0 0 L168 0" stroke="{GOLD}" stroke-width="1.2" opacity=".7"/></g>'
for x, y, r, s in [(250, 668, -32, 1.1), (520, 600, 30, 1.25), (770, 520, -36, 1), (1040, 380, 26, 1.1), (1310, 296, -30, 1)]: b += leaf(x, y, r, s)
def lam(cx, cy, s, rot=0, op=1):
    o = f'<g transform="translate({cx} {cy}) rotate({rot}) scale({s})" opacity="{op}">'
    for k in range(6): o += f'<path d="M0 0 C-28 -52 -28 -124 0 -156 C28 -124 28 -52 0 0 Z" fill="#e2d0b2" fill-opacity=".92" stroke="#f8f3e9" stroke-width="1.5" transform="rotate({k * 60})"/>'
    for k in range(6): o += f'<path d="M0 0 C-18 -34 -18 -80 0 -102 C18 -80 18 -34 0 0 Z" fill="#f7f0e5" stroke="#e1cca7" stroke-width="1.2" transform="rotate({k * 60 + 30})"/>'
    o += '<circle r="15" fill="#98795a"/>' + "".join(f'<circle cx="{20 * math.cos(k):.1f}" cy="{20 * math.sin(k):.1f}" r="3.2" fill="#634d37"/>' for k in range(7)) + "</g>"
    return o
b += lam(1030, 430, 1.55, -8) + lam(560, 560, 1.05, 12) + lam(1340, 250, .8, 20, .9) + lam(330, 330, .6, 34, .55)
S["lamduan"] = frame(defs, b)

# ---- market: dawn lanterns & silhouetted stalls
defs = lg("bg", [(0, "#221913", 1), (.55, "#394846", 1), (1, "#c5a670", 1)]) + rg("glow", [(0, "#e9d4b2", .9), (1, "#e9d4b2", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><rect y="520" width="{W}" height="200" fill="#e9d4b2" opacity=".25" filter="url(#blur30)"/>'
random.seed(31)
for i in range(16):
    x = 50 + i * 100; y = 150 + math.sin(i * .9) * 26
    b += f'<circle cx="{x}" cy="{y:.0f}" r="70" fill="url(#glow)" opacity=".55"/><ellipse cx="{x}" cy="{y:.0f}" rx="16" ry="22" fill="#d9b982"/><ellipse cx="{x}" cy="{y:.0f}" rx="7" ry="12" fill="#f6eedf"/><path d="M{x} {y - 22:.0f} V90" stroke="#e1cca7" stroke-width="1.2" opacity=".6"/>'
b += hair("M0 90 H1600", GOLD, 1.5, .5)
for i in range(5):
    x = 40 + i * 312
    b += f'<path d="M{x} 360 L{x + 290} 360 L{x + 270} 300 L{x + 20} 300 Z" fill="#14110e"/><rect x="{x + 14}" y="360" width="6" height="360" fill="#14110e"/><rect x="{x + 270}" y="360" width="6" height="360" fill="#14110e"/><rect x="{x + 14}" y="560" width="262" height="160" fill="#14110e"/>'
    b += f'<rect x="{x + 30}" y="548" width="230" height="14" fill="#d9b982" opacity=".85"/><rect x="{x + 30}" y="548" width="230" height="14" fill="#e9d4b2" opacity=".6" filter="url(#blur4)"/>'
    for k in range(9): b += f'<circle cx="{x + 42 + k * 25}" cy="528" r="12" fill="{["#ad7f51", "#89b1ac", "#bfa16d", "#ad8d6d"][(k + i) % 4]}" opacity=".9"/>'
    b += f'<circle cx="{x + 145}" cy="450" r="15" fill="#0a0807"/><path d="M{x + 120} 470 Q{x + 145} 458 {x + 170} 470 L{x + 176} 548 L{x + 114} 548 Z" fill="#0a0807"/>'
b += f'<rect y="720" width="{W}" height="180" fill="#0a0807"/>' + hair(f"M0 722 H{W}", GOLD, 1.5, .6)
S["market"] = frame(defs, b, grain=.12)

# ---- street-food: embers & smoke
defs = lg("bg", [(0, "#0c0907", 1), (1, "#36281e", 1)]) + rg("fire", [(0, "#dbbf8e", .95), (.4, "#d0a75f", .5), (1, "#d0a75f", 0)], .5, .72, .55)
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="800" cy="650" r="560" fill="url(#fire)"/>'
for i in range(10): b += f'<path d="M{480 + i * 70} 620 q-60 -90 0 -170 q60 -80 0 -170 q-40 -60 10 -120" stroke="#fff" stroke-width="30" fill="none" opacity=".05" stroke-linecap="round" filter="url(#blur12)"/>'
b += '<rect x="360" y="610" width="880" height="150" rx="6" fill="#1b140e"/><rect x="380" y="628" width="840" height="26" fill="#d0a75f" opacity=".9"/><rect x="380" y="628" width="840" height="26" fill="#e9d4b2" opacity=".5" filter="url(#blur4)"/>'
for k in range(15):
    x = 410 + k * 55
    b += f'<g transform="translate({x} 520) rotate(12)"><rect x="0" y="30" width="5" height="100" fill="#decdb0"/><ellipse cx="2" cy="28" rx="14" ry="22" fill="#78542f"/><ellipse cx="2" cy="4" rx="12" ry="19" fill="#986a3c"/><ellipse cx="2" cy="4" rx="5" ry="10" fill="#d9b982" opacity=".5"/></g>'
random.seed(21)
for _ in range(60): b += f'<circle cx="{random.uniform(380, 1220):.0f}" cy="{random.uniform(300, 620):.0f}" r="{random.uniform(1, 3.2):.1f}" fill="#dbbf8e" opacity="{random.uniform(.3, .9):.2f}"/>'
S["street-food"] = frame(defs, b)

# ---- cafe: moody still life
defs = lg("bg", [(0, "#100b08", 1), (1, "#35261a", 1)]) + rg("spot", [(0, "#ecdabc", .7), (.5, "#cdb07f", .22), (1, "#cdb07f", 0)], .5, .45, .6)
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><circle cx="800" cy="470" r="560" fill="url(#spot)"/>'
b += hair("M0 640 H1600", GOLD, 1.5, .55) + f'<rect y="640" width="{W}" height="260" fill="#090604"/><rect y="640" width="{W}" height="60" fill="#cdb07f" opacity=".08"/>'
for r in [260, 330, 400]: b += f'<circle cx="800" cy="470" r="{r}" fill="none" stroke="{GOLD}" stroke-width="1" opacity="{.4 - r / 1400:.2f}"/>'
b += '<g transform="translate(800 540)"><ellipse cx="0" cy="104" rx="240" ry="30" fill="#000" opacity=".5"/><ellipse cx="0" cy="92" rx="220" ry="34" fill="#f3ecde"/><ellipse cx="0" cy="84" rx="170" ry="24" fill="#e6dbc7"/>'
b += '<path d="M-140 -60 L140 -60 L108 84 Q0 128 -108 84 Z" fill="#f3ecde"/><path d="M138 -40 q84 14 64 70 q-16 42 -80 34" stroke="#f3ecde" stroke-width="26" fill="none"/><ellipse cx="0" cy="-60" rx="140" ry="34" fill="#352519"/><ellipse cx="0" cy="-66" rx="112" ry="23" fill="#5f432d"/><path d="M-36 -74 q26 13 0 26 q-26 13 0 26" stroke="#e1d4bf" stroke-width="10" fill="none"/>'
b += f'<path d="M-140 -60 L140 -60" stroke="{GOLD}" stroke-width="3"/></g>'
for x in [740, 800, 860]: b += f'<path d="M{x} 440 q-34 -70 0 -130 q38 -60 0 -130" stroke="#fff" stroke-width="16" fill="none" opacity=".5" stroke-linecap="round" filter="url(#blur12)"/>'
S["cafe"] = frame(defs, b, grain=.14)

# ---- city: dusk silhouette with lit windows
defs = lg("sky", [(0, "#291e16", 1), (.55, "#635a51", 1), (.85, "#d5af6d", 1), (1, "#ecdabc", 1)]) + rg("moon", [(0, "#f8f3e9", .8), (1, "#f8f3e9", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="1180" cy="230" r="220" fill="url(#moon)"/><circle cx="1180" cy="230" r="40" fill="#f8f3e9"/>'
random.seed(12)
for i in range(70): b += f'<circle cx="{random.uniform(0, W):.0f}" cy="{random.uniform(0, 380):.0f}" r="{random.uniform(.6, 1.6):.1f}" fill="#fff" opacity="{random.uniform(.25, .7):.2f}"/>'
x = -20
while x < 1640:
    w = random.choice([150, 190, 230]); h = random.choice([150, 200, 260, 340]); top = 760 - h
    b += f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="#1a1410"/><rect x="{x}" y="{top}" width="{w}" height="6" fill="{GOLD}" opacity=".5"/>'
    for r_ in range(int((h - 60) // 62)):
        for k in range(int(w // 46)):
            if random.random() < .45: b += f'<rect x="{x + 16 + k * 42}" y="{top + 30 + r_ * 62}" width="20" height="30" fill="#e0c597" opacity="{random.uniform(.55, .95):.2f}"/>'
    x += w + 8
b += f'<rect y="760" width="{W}" height="140" fill="#0c0a08"/>' + hair(f"M0 762 H{W}", GOLD, 1.8, .7) + f'<path d="M0 830 H{W}" stroke="#e9d4b2" stroke-width="3" stroke-dasharray="80 60" opacity=".4"/>'
S["city"] = frame(defs, b)

# ---- festival: golden fireworks
defs = lg("bg", [(0, "#120c08", 1), (1, "#413023", 1)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
random.seed(14)
for _ in range(120): b += f'<circle cx="{random.uniform(0, W):.0f}" cy="{random.uniform(0, 520):.0f}" r="{random.uniform(.6, 1.8):.1f}" fill="#fff" opacity="{random.uniform(.25, .8):.2f}"/>'
def fw(cx, cy, r, col, n=36):
    o = f'<circle cx="{cx}" cy="{cy}" r="{r * 1.1}" fill="{col}" opacity=".10" filter="url(#blur30)"/>'
    for k in range(n):
        a = k * math.pi * 2 / n; r0 = r * (.3 + (k % 3) * .07); r1 = r * (.82 + (k % 4) * .08)
        o += f'<path d="M{cx + math.cos(a) * r0:.0f} {cy + math.sin(a) * r0:.0f} L{cx + math.cos(a) * r1:.0f} {cy + math.sin(a) * r1:.0f}" stroke="{col}" stroke-width="3" stroke-linecap="round" opacity=".9"/><circle cx="{cx + math.cos(a) * r * 1.05:.0f}" cy="{cy + math.sin(a) * r * 1.05:.0f}" r="4" fill="{col}"/>'
    return o
b += fw(430, 300, 190, "#e2c89a") + fw(1120, 250, 230, "#e5cda4") + fw(800, 440, 120, "#9bc7c1", 28)
b += f'<path d="{contour(760, 14, 15)}" fill="#140e0a"/>'
random.seed(16)
for i in range(70):
    x = i * 24 + random.uniform(-5, 5); hh = random.uniform(40, 76)
    b += f'<g fill="#140e0a"><circle cx="{x:.0f}" cy="{790 - hh:.0f}" r="9"/><rect x="{x - 8:.0f}" y="{800 - hh:.0f}" width="16" height="{hh}" rx="6"/></g>'
S["festival"] = frame(defs, b, grain=.12)

# ---- night: bokeh string lights
defs = lg("bg", [(0, "#17100b", 1), (1, "#3a2c22", 1)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
random.seed(22)
for row in range(5):
    y0 = 90 + row * 120
    for i in range(0, W + 40, 44):
        y = y0 + math.sin(i / W * math.pi * 3 + row) * 38
        col = ["#e2c89a", "#ddbf8c", "#f2e6d1", "#a6ccc7", "#edddc2"][(i // 44 + row) % 5]
        r = 10 + (row % 3) * 4
        b += f'<circle cx="{i}" cy="{y:.0f}" r="{r * 3.2:.0f}" fill="{col}" opacity=".16" filter="url(#blur12)"/><circle cx="{i}" cy="{y:.0f}" r="{r}" fill="{col}" opacity=".95"/>'
for i in range(14):
    x = random.uniform(0, W); y = random.uniform(560, 860); r = random.uniform(30, 80)
    b += f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{["#e2c89a", "#ddbf8c", "#a6ccc7"][i % 3]}" opacity="{random.uniform(.12, .3):.2f}" filter="url(#blur12)"/>'
S["night"] = frame(defs, b, grain=.12)

# ---- countryside: dusk hills & lit stilt house
defs = lg("sky", [(0, "#3c2b1f", 1), (.6, "#9d8975", 1), (1, "#e7d1ab", 1)]) + rg("win", [(0, "#e9d4b2", .9), (1, "#e9d4b2", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#sky)"/><circle cx="380" cy="360" r="38" fill="#f6eedf"/><circle cx="380" cy="360" r="170" fill="url(#win)" opacity=".4"/>'
for i, c in enumerate(["#736a61", "#615951", "#4e4239", "#3d3127", "#2b2119"]):
    b += f'<path d="{contour(470 + i * 82, 34, 100 + i)}" fill="{c}"/>' + hair(line_of(470 + i * 82, 34, 100 + i), GOLD, 1.1, .3)
b += '<g transform="translate(980 700)"><g fill="#18120e">' + "".join(f'<rect x="{x}" y="-8" width="11" height="104"/>' for x in [0, 70, 140, 210, 280]) + '</g><rect x="-20" y="-132" width="340" height="124" fill="#18120e"/><path d="M-52 -132 L150 -246 L352 -132 Z" fill="#18120e"/><rect x="38" y="-100" width="62" height="66" fill="#e0c597"/><rect x="200" y="-100" width="62" height="66" fill="#e0c597"/><circle cx="69" cy="-67" r="80" fill="url(#win)" opacity=".6"/><rect x="-20" y="-8" width="340" height="14" fill="#0c0a08"/></g>'
b += hair(f"M0 810 H{W}", GOLD, 1.5, .5)
S["countryside"] = frame(defs, b)

# ---- cinema: projector beam, glowing screen, rows of seats
defs = lg("bg", [(0, "#120c08", 1), (1, "#312318", 1)]) + lg("beam", [(0, "#f4ebdb", .55), (1, "#f4ebdb", 0)], 0, 0, 0, 1) + lg("scr", [(0, "#f8f3e9", 1), (1, "#e1cca7", 1)]) + rg("glow", [(0, "#e1cca7", .6), (1, "#e1cca7", 0)])
b = f'<rect width="{W}" height="{H}" fill="url(#bg)"/><ellipse cx="800" cy="330" rx="760" ry="330" fill="url(#glow)" opacity=".55"/>'
b += '<path d="M800 -20 L520 330 L1080 330 Z" fill="url(#beam)" opacity=".35"/>'
b += '<rect x="480" y="230" width="640" height="300" fill="url(#scr)"/><rect x="480" y="230" width="640" height="300" fill="none" stroke="#f4ebdb" stroke-width="3"/>'
b += '<circle cx="800" cy="380" r="64" fill="none" stroke="#5f432e" stroke-width="5" opacity=".7"/><path d="M782 348 L782 412 L832 380 Z" fill="#5f432e" opacity=".75"/>'
b += '<rect x="440" y="530" width="720" height="10" fill="#f4ebdb" opacity=".35" filter="url(#blur4)"/>'
random.seed(5)
for row in range(5):
    y = 640 + row * 62; sc = 1 + row * .22; wseat = 58 * sc; gap = 16 * sc; n = int((W + 100) / (wseat + gap))
    x0 = (W - n * (wseat + gap)) / 2
    for i in range(n):
        if row == 0 and 5 < i < n - 6: pass
        x = x0 + i * (wseat + gap); col = ["#100b07", "#18110c", "#211710"][row % 3]
        b += f'<rect x="{x:.0f}" y="{y:.0f}" width="{wseat:.0f}" height="{52 * sc:.0f}" fill="{col}"/><rect x="{x:.0f}" y="{y:.0f}" width="{wseat:.0f}" height="3" fill="#e1cca7" opacity=".22"/>'
b += '<g fill="#090604"><circle cx="760" cy="760" r="24"/><path d="M730 800 Q760 770 790 800 L794 860 L726 860 Z"/><circle cx="846" cy="768" r="22"/><path d="M818 806 Q846 778 874 806 L878 860 L814 860 Z"/></g>'
S["cinema"] = frame(defs, b, grain=.1)

for name, svg in S.items():
    open(f"{OUT}/{name}.svg", "w").write(svg)
print(len(S), "scenes ->", OUT)
