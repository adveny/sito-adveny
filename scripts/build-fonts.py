"""
Converte i font trial di Area (solo 97 glifi) in woff2 e aggiunge i caratteri
italiani mancanti (vocali accentate, apostrofo, +, %, €, :, /, ecc.)
costruendoli dai glifi esistenti del font stesso, così il disegno resta coerente.

Uso:  python scripts/build-fonts.py "<cartella Area Font 2>" public/fonts
"""
import glob
import math
import os
import sys

from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent

SRC, OUT = sys.argv[1], sys.argv[2]

# (prefisso file, nome output)
WEIGHTS = [
    ("AreaNormalTrial-Regular", "area-normal-400"),
    ("AreaNormalTrial-Medium", "area-normal-500"),
    ("AreaNormalTrial-Semibold", "area-normal-600"),
    ("AreaExtendedTrial-Medium", "area-extended-500"),
    ("AreaExtendedTrial-Bold", "area-extended-700"),
    
    
]


def otf_to_ttf(font):
    """CFF -> glyf (quadratiche), ricetta standard di fontTools."""
    order = font.getGlyphOrder()
    gs = font.getGlyphSet()
    glyf = {}
    for name in order:
        pen = TTGlyphPen(gs)
        gs[name].draw(Cu2QuPen(pen, 1.0, reverse_direction=True))
        glyf[name] = pen.glyph()
    font["loca"] = newTable("loca")
    font["glyf"] = t = newTable("glyf")
    t.glyphOrder = order
    t.glyphs = glyf
    del font["CFF "]
    if "VORG" in font:
        del font["VORG"]
    font["maxp"] = m = newTable("maxp")
    m.tableVersion = 0x00010000
    for attr in ("maxZones", "maxTwilightPoints", "maxStorage", "maxFunctionDefs",
                 "maxInstructionDefs", "maxStackElements", "maxSizeOfInstructions",
                 "maxComponentElements"):
        setattr(m, attr, 0)
    m.maxZones = 1
    m.maxComponentDepth = 1
    post = font["post"]
    post.formatType = 2.0
    post.extraNames = []
    post.mapping = {}
    post.glyphOrder = order
    font["head"].indexToLocFormat = 0
    font["head"].glyphDataFormat = 0
    font.sfntVersion = "\x00\x01\x00\x00"


def bounds(font, name):
    g = font["glyf"][name]
    g.recalcBounds(font["glyf"])
    return g.xMin, g.yMin, g.xMax, g.yMax


def poly_glyph(points):
    pen = TTGlyphPen(None)
    pen.moveTo(points[0])
    for p in points[1:]:
        pen.lineTo(p)
    pen.closePath()
    return pen.glyph()


def build(src_path, out_path):
    f = TTFont(src_path)
    otf_to_ttf(f)
    glyf, hmtx, order = f["glyf"], f["hmtx"], f.getGlyphOrder()
    os2 = f["OS/2"]
    cap = os2.sCapHeight or bounds(f, "H")[3]
    xh = os2.sxHeight or bounds(f, "x")[3]

    stem = bounds(f, "I")[2] - bounds(f, "I")[0]
    px0, py0, px1, py1 = bounds(f, "period")
    dot = py1 - py0

    def add(name, glyph, adv, lsb=None):
        glyf.glyphs[name] = glyph
        glyph.recalcBounds(glyf)
        if name not in order:
            order.append(name)
        hmtx.metrics[name] = (int(adv), int(lsb if lsb is not None else getattr(glyph, "xMin", 0)))

    def comp(name, base, dx=0, dy=0, transform=None):
        c = GlyphComponent()
        c.glyphName = base
        c.x, c.y = int(round(dx)), int(round(dy))
        c.flags = 0x4 if base == name else 0
        if transform:
            c.transform = transform
        return c

    def composite(name, parts, adv):
        g = Glyph()
        g.numberOfContours = -1
        g.components = []
        for (base, dx, dy, tr) in parts:
            c = GlyphComponent()
            c.glyphName = base
            c.x, c.y = int(round(dx)), int(round(dy))
            c.flags = 0
            if tr is not None:
                a, b, cc, d = tr
                c.transform = [[a, b], [cc, d]]
            g.components.append(c)
        g.components[0].flags |= 0x0200  # USE_MY_METRICS
        add(name, g, adv)

    # --- accenti (disegnati sullo spessore del punto del font) ---
    t = max(dot * 0.78, stem * 0.55)          # spessore del tratto
    w = t * 2.1                                # estensione orizzontale
    h = t * 1.25                               # altezza
    gap = t * 0.55
    # grave: parte in alto a sinistra e scende verso destra
    add("_grave", poly_glyph([(0, h + t * 0.4), (t * 1.05, h + t * 0.4), (w, 0), (w - t * 1.05, 0)]), w)
    add("_acute", poly_glyph([(w - t * 1.05, h + t * 0.4), (w, h + t * 0.4), (t * 1.05, 0), (0, 0)]), w)

    def accented(char, base, accent):
        bx0, by0, bx1, by1 = bounds(f, base)
        adv = hmtx.metrics[base][0]
        top = by1 if base.isupper() else xh
        if base == "i":  # la i accentata perde il punto: usiamo il gambo di dotless
            top = xh
        ax = (bx0 + bx1) / 2 - w / 2
        ay = top + gap
        name = "uni%04X" % ord(char)
        composite(name, [(base if base != "i" else "_dotlessi", 0, 0, None), (accent, ax, ay, None)], adv)
        return name

    # i senza punto: rettangolo del gambo della i
    ix0, iy0, ix1, iy1 = bounds(f, "l")
    # gambo della 'l' tagliato all'altezza x
    add("_dotlessi", poly_glyph([(ix0, 0), (ix0, xh), (ix1, xh), (ix1, 0)]), hmtx.metrics["i"][0], ix0)
    # allinea la dotless alla posizione della i originale
    i0 = bounds(f, "i")[0]
    if abs(i0 - ix0) > 1:
        add("_dotlessi", poly_glyph([(i0, 0), (i0, xh), (i0 + (ix1 - ix0), xh), (i0 + (ix1 - ix0), 0)]),
            hmtx.metrics["i"][0], i0)

    new_cmap = {}
    for ch, base, acc in [
        ("à", "a", "_grave"), ("è", "e", "_grave"), ("é", "e", "_acute"), ("ì", "i", "_grave"),
        ("ò", "o", "_grave"), ("ù", "u", "_grave"), ("À", "A", "_grave"), ("È", "E", "_grave"),
        ("É", "E", "_acute"), ("Ì", "I", "_grave"), ("Ò", "O", "_grave"), ("Ù", "U", "_grave"),
    ]:
        new_cmap[ord(ch)] = accented(ch, base, acc)

    # --- punteggiatura e simboli dai glifi esistenti ---
    cx0, cy0, cx1, cy1 = bounds(f, "comma")
    comma_adv = hmtx.metrics["comma"][0]
    composite("quoteright", [("comma", 0, cap - cy1, None)], comma_adv)
    new_cmap[0x2019] = "quoteright"
    new_cmap[0x27] = "quoteright"
    per_adv = hmtx.metrics["period"][0]
    composite("colon", [("period", 0, 0, None), ("period", 0, xh - py1, None)], per_adv)
    new_cmap[ord(":")] = "colon"
    composite("semicolon", [("comma", 0, 0, None), ("period", (comma_adv - per_adv) / 2, xh - py1, None)], comma_adv)
    new_cmap[ord(";")] = "semicolon"
    composite("periodcentered", [("period", 0, xh / 2 - (py0 + py1) / 2, None)], per_adv)
    new_cmap[0xB7] = "periodcentered"

    hx0, hy0, hx1, hy1 = bounds(f, "hyphen")
    hadv = hmtx.metrics["hyphen"][0]
    hcx, hcy = (hx0 + hx1) / 2, (hy0 + hy1) / 2
    hl = hx1 - hx0
    # + : trattino orizzontale + trattino ruotato di 90°, bracci uguali
    pw = hl * 1.25
    plus_adv = pw + hx0 * 2
    s = pw / hl
    composite("plus", [
        ("hyphen", -hx0 * s + hx0, 0, (s, 0, 0, 1)),
        ("hyphen", hx0 + pw / 2 + hcy, hcy - pw / 2 - (-hx0 * s) * 0 - hx0 * s * 0 - (hx0) * s + hx0 * 0, (0, s, -1, 0)),
    ], plus_adv)
    new_cmap[ord("+")] = "plus"
    add("endash", poly_glyph([(hx0, hy0), (hx0, hy1), (hx1 + hl * 0.7, hy1), (hx1 + hl * 0.7, hy0)]), hadv + hl * 0.7, hx0)
    new_cmap[0x2013] = "endash"
    add("emdash", poly_glyph([(hx0, hy0), (hx0, hy1), (hx1 + hl * 1.9, hy1), (hx1 + hl * 1.9, hy0)]), hadv + hl * 1.9, hx0)
    new_cmap[0x2014] = "emdash"

    # / e |
    sw = stem * 0.95
    sl_h = cap
    sl_w = cap * 0.42
    m = stem * 0.3
    add("slash", poly_glyph([(m, -cap * 0.06), (m + sw, -cap * 0.06), (m + sl_w + sw, sl_h), (m + sl_w, sl_h)]),
        sl_w + sw + m * 2, m)
    new_cmap[ord("/")] = "slash"
    add("bar", poly_glyph([(stem, -cap * 0.2), (stem, cap * 1.08), (stem * 2, cap * 1.08), (stem * 2, -cap * 0.2)]),
        stem * 3, stem)
    new_cmap[ord("|")] = "bar"

    # % : due "o" rimpicciolite + barra
    ox0, oy0, ox1, oy1 = bounds(f, "o")
    k = (cap * 0.42) / (oy1 - oy0)
    ow = (ox1 - ox0) * k
    pct_w = ow * 2 + stem * 1.6
    composite("percent", [
        ("o", stem * 0.4 - ox0 * k, cap - (oy1 * k), (k, 0, 0, k)),
        ("o", stem * 0.4 + pct_w - ow - ox0 * k, -oy0 * k, (k, 0, 0, k)),
        ("slash", stem * 0.4 + pct_w / 2 - (sl_w + sw) / 2 - m, 0, None),
    ], pct_w + stem * 0.8)
    new_cmap[ord("%")] = "percent"

    # € : C con due traverse
    Cx0, Cy0, Cx1, Cy1 = bounds(f, "C")
    cadv = hmtx.metrics["C"][0]
    shift = stem * 0.9
    bar_len = (Cx1 - Cx0) * 0.72
    bs = bar_len / hl
    bh = (hy1 - hy0)
    bh = bh * 0.9
    ex0 = Cx0
    add("_eurobars", poly_glyph([(ex0, Cy1 * 0.60 - bh / 2), (ex0, Cy1 * 0.60 + bh / 2), (ex0 + bar_len, Cy1 * 0.60 + bh / 2), (ex0 + bar_len, Cy1 * 0.60 - bh / 2)]), cadv)
    add("_eurobars2", poly_glyph([(ex0, Cy1 * 0.38 - bh / 2), (ex0, Cy1 * 0.38 + bh / 2), (ex0 + bar_len, Cy1 * 0.38 + bh / 2), (ex0 + bar_len, Cy1 * 0.38 - bh / 2)]), cadv)
    composite("Euro", [
        ("C", shift, 0, None),
        ("_eurobars", 0, 0, None),
        ("_eurobars2", 0, 0, None),
    ], cadv + shift)
    new_cmap[0x20AC] = "Euro"

    # * asterisco: tre trattini ruotati
    ast_s = (cap * 0.42) / hl
    a_cx = hl * ast_s / 2 + stem * 0.4
    a_cy = cap - hl * ast_s / 2
    parts = []
    for ang in (90, 30, -30):
        r = math.radians(ang)
        c, sn = math.cos(r), math.sin(r)
        tr = (ast_s * c, ast_s * sn, -sn, c)
        # centro del trattino scalato+ruotato -> (a_cx, a_cy)
        mx, my = hcx * ast_s * c - hcy * sn, hcx * ast_s * sn + hcy * c
        parts.append(("hyphen", a_cx - mx, a_cy - my, tr))
    composite("asterisk", parts, a_cx * 2)
    new_cmap[ord("*")] = "asterisk"

    f.setGlyphOrder(order)
    f["glyf"].glyphOrder = order
    for table in f["cmap"].tables:
        if table.isUnicode():
            table.cmap.update(new_cmap)

    # correggi il + : ricentra il braccio verticale sul centro del braccio orizzontale
    g = glyf["plus"]
    h_comp, v_comp = g.components
    hb = (h_comp.x + hx0 * s, h_comp.y + hy0, h_comp.x + hx1 * s, h_comp.y + hy1)
    center = ((hb[0] + hb[2]) / 2, (hb[1] + hb[3]) / 2)
    # vertice (x,y) -> (-y, x*s) con transform (0,s,-1,0): colonne = (xx,xy,yx,yy)
    # fontTools: x' = xx*x + yx*y ; y' = xy*x + yy*y
    vx = lambda x, y: 0 * x + -1 * y
    vy = lambda x, y: s * x + 0 * y
    vcx = vx(hcx, hcy)
    vcy = vy(hcx, hcy)
    v_comp.x = int(round(center[0] - vcx))
    v_comp.y = int(round(center[1] - vcy))

    f["maxp"].numGlyphs = len(order)
    f["maxp"].maxComponentElements = 3
    f["maxp"].maxComponentDepth = 1
    f["post"].glyphOrder = order
    f.flavor = "woff2"
    f.save(out_path)


os.makedirs(OUT, exist_ok=True)
for prefix, out in WEIGHTS:
    src = glob.glob(os.path.join(SRC, prefix + "-*.otf"))[0]
    build(src, os.path.join(OUT, out + ".woff2"))
    print("ok", out)
