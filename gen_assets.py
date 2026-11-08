#!/usr/bin/env python3
"""Generate ORIGINAL Jungle Ranger art with PIL. No stock, no copied art.
All creatures are drawn from primitives in this file."""
import math, random
from PIL import Image, ImageDraw
random.seed(7)
OUT = __import__('pathlib').Path(__file__).parent

def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))

def ellipse(d, box, fill, outline=None, width=1):
    d.ellipse(box, fill=fill, outline=outline, width=width)
def rect(d, box, fill, outline=None):
    d.rectangle(box, fill=fill, outline=outline)
def poly(d, pts, fill, outline=None):
    d.polygon(pts, fill=fill, outline=outline)
def line(d, pts, fill, width=3):
    d.line(pts, fill=fill, width=width)

# ---------- background 1280x720 ----------
def background():
    W, H = 1280, 720
    img = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(img)
    # sky gradient
    for y in range(420):
        t = y / 420
        d.line([(0, y), (W, y)], fill=(int(135+60*t), int(206-30*t), int(235-60*t)))
    # sun + clouds
    ellipse(d, [1050, 50, 1150, 150], (255, 236, 140))
    ellipse(d, [1065, 65, 1135, 135], (255, 250, 200))
    for cx, cy, s in [(200, 90, 70), (600, 60, 55), (900, 130, 45)]:
        for dx, dy, r in [(-s, 0, s//2), (0, -12, s//2+8), (s, 0, s//2)]:
            ellipse(d, [cx+dx-r, cy+dy-r, cx+dx+r, cy+dy+r], (255, 255, 255))
    # distant jungle (dark green silhouettes)
    for layer, col, base in [(0, (46, 110, 62), 380), (1, (32, 84, 46), 430)]:
        for x in range(0, W, 46):
            h = 90 + ((x*7 + layer*53) % 110)
            poly(d, [(x, base), (x+23, base-h), (x+46, base)], col)
            ellipse(d, [x-10, base-h-30, x+56, base-h+20], col)
    # mid trees: trunks + canopy blobs
    for x in [80, 260, 470, 700, 920, 1150]:
        rect(d, [x, 380, x+26, 560], (90, 60, 30))
        for dx, dy, r in [(-40, -30, 55), (10, -60, 65), (50, -20, 50)]:
            ellipse(d, [x+dx-r, 400+dy-r, x+dx+r, 400+dy+r], (24, 96, 44))
        ellipse(d, [x-20, 330, x+50, 390], (52, 140, 66))
    # hanging vines
    for x in [150, 350, 580, 820, 1040, 1220]:
        line(d, [(x, 0), (x+8, 180), (x-4, 320)], (34, 110, 52), 7)
        for vy in (120, 210, 290):
            ellipse(d, [x-14, vy, x+14, vy+26], (58, 150, 70))
    # ground
    for y in range(540, H):
        t = (y-540)/180
        d.line([(0, y), (W, y)], fill=(int(96-20*t), int(140-30*t), int(52-10*t)))
    for x in range(0, W, 30):
        h = 14 + (x % 37)
        poly(d, [(x, 560), (x+8, 560-h), (x+16, 560)], (70, 160, 60))
        poly(d, [(x+14, 640), (x+22, 640-h), (x+30, 640)], (60, 145, 55))
    # flowers / stones
    for x, y, c in [(120, 620, (255, 120, 160)), (480, 660, (255, 200, 80)), (900, 610, (255, 120, 160)), (1120, 670, (255, 200, 80))]:
        for dx, dy in [(-8,0),(8,0),(0,-8),(0,8)]:
            ellipse(d, [x+dx-6, y+dy-6, x+dx+6, y+dy+6], c)
        ellipse(d, [x-5, y-5, x+5, y+5], (255, 255, 180))
    img.save(OUT/'background.png')

# ---------- player: ranger facing right, 96x96 ----------
def player():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    # legs / boots
    rect(d, [38, 62, 48, 84], (70, 55, 35)); rect(d, [54, 62, 64, 84], (70, 55, 35))
    rect(d, [34, 82, 50, 90], (45, 32, 18)); rect(d, [52, 82, 68, 90], (45, 32, 18))
    # body: green shirt + khaki vest
    poly(d, [(34, 38), (68, 38), (66, 66), (36, 66)], (58, 120, 62))
    rect(d, [34, 38, 68, 50], (190, 175, 120))
    # arms
    line(d, [(36, 44), (24, 60)], (58, 120, 62), 8); line(d, [(66, 44), (80, 58)], (58, 120, 62), 8)
    ellipse(d, [76, 54, 86, 64], (232, 190, 140))  # hand
    # head + hat
    ellipse(d, [38, 8, 64, 36], (232, 190, 140))
    ellipse(d, [40, 20, 46, 26], (30, 30, 30)); ellipse(d, [56, 20, 62, 26], (30, 30, 30))
    poly(d, [(30, 14), (72, 14), (66, 6), (36, 6)], (150, 115, 55))  # hat brim
    ellipse(d, [38, 0, 64, 14], (170, 130, 60))
    img.save(OUT/'player.png')

def coin():
    img = canvas(48, 48); d = ImageDraw.Draw(img)
    ellipse(d, [4, 4, 44, 44], (255, 205, 40), outline=(180, 130, 0), width=3)
    ellipse(d, [12, 12, 36, 36], (255, 225, 110))
    d.text((19, 15), '$', fill=(180, 130, 0))
    img.save(OUT/'coin.png')

def heart():
    img = canvas(48, 48); d = ImageDraw.Draw(img)
    ellipse(d, [4, 8, 24, 28], (230, 40, 60)); ellipse(d, [24, 8, 44, 28], (230, 40, 60))
    poly(d, [(4, 20), (44, 20), (24, 44)], (230, 40, 60))
    img.save(OUT/'heart.png')

# ---------- enemies: each 96x96, distinct ----------
def snake():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    # coiled body
    ellipse(d, [14, 58, 82, 88], (46, 160, 70)); ellipse(d, [24, 66, 72, 82], (30, 120, 50))
    line(d, [(70, 62), (78, 34), (66, 18)], (46, 160, 70), 16)
    ellipse(d, [54, 4, 80, 30], (46, 160, 70))  # head
    ellipse(d, [58, 12, 64, 18], (255, 255, 255)); ellipse(d, [70, 12, 76, 18], (255, 255, 255))
    ellipse(d, [60, 14, 63, 17], (0, 0, 0)); ellipse(d, [72, 14, 75, 17], (0, 0, 0))
    line(d, [(66, 28), (66, 38), (58, 44)], (220, 40, 60), 3); line(d, [(66, 38), (74, 44)], (220, 40, 60), 3)
    img.save(OUT/'enemy.png')  # enemy1 = snake

def monkey():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    ellipse(d, [18, 30, 38, 62], (122, 84, 48)); ellipse(d, [58, 30, 78, 62], (122, 84, 48))  # arms
    ellipse(d, [26, 34, 70, 78], (140, 96, 54))  # body
    ellipse(d, [36, 44, 60, 68], (220, 190, 150))  # belly
    ellipse(d, [28, 6, 68, 46], (140, 96, 54))  # head
    ellipse(d, [24, 14, 36, 28], (140, 96, 54)); ellipse(d, [60, 14, 72, 28], (140, 96, 54))
    ellipse(d, [34, 16, 62, 44], (220, 190, 150))  # face
    ellipse(d, [40, 24, 46, 30], (0, 0, 0)); ellipse(d, [52, 24, 58, 30], (0, 0, 0))
    line(d, [(70, 70), (88, 40), (84, 18)], (140, 96, 54), 7)  # tail
    img.save(OUT/'enemy2.png')

def spider():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    for ang in range(8):
        a = math.radians(ang*45+10)
        x2 = 48 + int(math.cos(a)*42); y2 = 52 + int(math.sin(a)*38)
        line(d, [(48, 52), (x2, y2)], (40, 30, 60), 5)
    ellipse(d, [28, 36, 68, 72], (60, 40, 90))
    ellipse(d, [36, 20, 60, 40], (60, 40, 90))
    for x in (40, 52):
        ellipse(d, [x, 26, x+7, 33], (255, 60, 60))
    ellipse(d, [40, 50, 56, 62], (150, 60, 200))
    img.save(OUT/'enemy3.png')

def boss_snake():
    img = canvas(160, 160); d = ImageDraw.Draw(img)
    ellipse(d, [16, 100, 144, 150], (180, 40, 50)); ellipse(d, [30, 112, 130, 142], (120, 25, 35))
    line(d, [(118, 106), (132, 52), (108, 22)], (180, 40, 50), 26)
    ellipse(d, [84, 4, 136, 56], (180, 40, 50))
    ellipse(d, [92, 18, 104, 30], (255, 255, 0)); ellipse(d, [116, 18, 128, 30], (255, 255, 0))
    ellipse(d, [96, 21, 101, 27], (0, 0, 0)); ellipse(d, [120, 21, 125, 27], (0, 0, 0))
    poly(d, [(88, 52), (132, 52), (110, 78)], (255, 255, 255))
    img.save(OUT/'enemy4.png')

def bat():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    poly(d, [(48, 40), (8, 16), (16, 48), (30, 44)], (90, 50, 140))
    poly(d, [(48, 40), (88, 16), (80, 48), (66, 44)], (90, 50, 140))
    ellipse(d, [32, 28, 64, 66], (70, 40, 110))
    poly(d, [(36, 28), (42, 14), (48, 26)], (70, 40, 110)); poly(d, [(48, 26), (56, 14), (60, 28)], (70, 40, 110))
    ellipse(d, [40, 38, 46, 44], (255, 80, 80)); ellipse(d, [52, 38, 58, 44], (255, 80, 80))
    img.save(OUT/'enemy5.png')

def scorpion():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    ellipse(d, [28, 44, 68, 74], (220, 120, 40))
    ellipse(d, [60, 46, 84, 68], (220, 120, 40))  # head/claw base
    line(d, [(30, 60), (14, 34), (22, 14)], (200, 100, 30), 8)  # tail
    poly(d, [(16, 6), (30, 10), (24, 26)], (240, 60, 40))  # stinger
    for y in (52, 62):
        line(d, [(30, y), (12, y-6)], (200, 100, 30), 6); line(d, [(66, y), (84, y-6)], (200, 100, 30), 6)
    ellipse(d, [70, 52, 76, 58], (0, 0, 0))
    img.save(OUT/'enemy6.png')

def frog():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    ellipse(d, [20, 44, 76, 84], (70, 180, 80))
    ellipse(d, [26, 22, 46, 44], (70, 180, 80)); ellipse(d, [50, 22, 70, 44], (70, 180, 80))
    ellipse(d, [32, 26, 40, 34], (255, 255, 255)); ellipse(d, [56, 26, 64, 34], (255, 255, 255))
    ellipse(d, [34, 28, 38, 32], (0, 0, 0)); ellipse(d, [58, 28, 62, 32], (0, 0, 0))
    line(d, [(34, 62), (62, 62)], (30, 90, 40), 3)
    ellipse(d, [30, 66, 66, 78], (200, 240, 170))
    img.save(OUT/'enemy7.png')

def boss_gorilla():
    img = canvas(160, 160); d = ImageDraw.Draw(img)
    ellipse(d, [18, 60, 52, 130], (60, 55, 60)); ellipse(d, [108, 60, 142, 130], (60, 55, 60))
    ellipse(d, [40, 50, 120, 140], (75, 68, 72))
    ellipse(d, [55, 90, 105, 130], (180, 170, 160))
    ellipse(d, [48, 12, 112, 72], (75, 68, 72))
    ellipse(d, [58, 28, 102, 66], (200, 185, 165))
    ellipse(d, [66, 38, 74, 46], (0, 0, 0)); ellipse(d, [88, 38, 96, 46], (0, 0, 0))
    rect(d, [52, 56, 108, 62], (120, 110, 105))
    img.save(OUT/'enemy8.png')

def beetle():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    ellipse(d, [26, 30, 70, 82], (30, 80, 160))
    line(d, [(48, 30), (48, 82)], (15, 40, 90), 4)
    ellipse(d, [36, 14, 60, 36], (20, 60, 130))
    line(d, [(40, 18), (28, 6)], (20, 60, 130), 4); line(d, [(56, 18), (68, 6)], (20, 60, 130), 4)
    for y in (44, 58, 72):
        line(d, [(28, y), (10, y+8)], (20, 60, 130), 5); line(d, [(68, y), (86, y+8)], (20, 60, 130), 5)
    ellipse(d, [58, 44, 66, 52], (255, 220, 60))
    img.save(OUT/'enemy9.png')

def crocodile():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    ellipse(d, [8, 48, 88, 76], (70, 150, 70))
    poly(d, [(70, 52), (92, 44), (92, 66), (70, 66)], (70, 150, 70))
    ellipse(d, [74, 40, 84, 50], (70, 150, 70)); ellipse(d, [76, 42, 81, 47], (255, 255, 0))
    poly(d, [(16, 58), (10, 50), (20, 56)], (255, 255, 255)); poly(d, [(30, 58), (26, 48), (36, 56)], (255, 255, 255))
    for x in (24, 44, 64):
        poly(d, [(x, 48), (x+6, 40), (x+12, 48)], (45, 110, 45))
    img.save(OUT/'enemy10.png')

def parrot():
    img = canvas(96, 96); d = ImageDraw.Draw(img)
    poly(d, [(48, 44), (10, 20), (22, 52)], (40, 90, 200)); poly(d, [(48, 44), (86, 20), (74, 52)], (40, 90, 200))
    ellipse(d, [32, 30, 64, 74], (220, 60, 50))
    ellipse(d, [38, 52, 58, 72], (255, 200, 40))
    ellipse(d, [38, 14, 62, 40], (220, 60, 50))
    poly(d, [(58, 24), (76, 30), (58, 36)], (255, 180, 0))
    ellipse(d, [44, 22, 50, 28], (0, 0, 0))
    img.save(OUT/'enemy11.png')

def boss_jaguar():
    img = canvas(160, 160); d = ImageDraw.Draw(img)
    ellipse(d, [16, 70, 144, 130], (230, 140, 40))
    ellipse(d, [100, 30, 152, 84], (230, 140, 40))
    poly(d, [(108, 38), (116, 18), (126, 36)], (230, 140, 40)); poly(d, [(132, 36), (142, 18), (148, 38)], (230, 140, 40))
    for x, y in [(40, 90), (70, 100), (100, 92), (55, 115), (90, 118), (120, 60), (135, 50)]:
        ellipse(d, [x, y, x+12, y+10], (40, 30, 20))
    ellipse(d, [118, 48, 126, 56], (0, 0, 0))
    poly(d, [(148, 62), (158, 66), (148, 70)], (20, 20, 20))
    line(d, [(20, 90), (4, 60)], (230, 140, 40), 8)
    img.save(OUT/'enemy12.png')

if __name__ == '__main__':
    background(); player(); coin(); heart()
    snake(); monkey(); spider(); boss_snake(); bat(); scorpion(); frog(); boss_gorilla(); beetle(); crocodile(); parrot(); boss_jaguar()
    print('assets done')
