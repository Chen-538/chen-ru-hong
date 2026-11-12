"""分享預覽圖、小圖示。重跑會覆蓋輸出。"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = 'D:/claude專案/tools/fonts/wenkai/LXGWWenKaiTC-Medium.ttf'
SKY = (14, 99, 199)
SUN = (240, 84, 30)

# 分享預覽圖 1200x630：Hero 照片，左邊壓深藍漸層後寫名字
hero = ImageOps.exif_transpose(Image.open(ROOT + '/assets/img/hero.webp')).convert('RGB')
og = ImageOps.fit(hero, (1200, 630), centering=(0.7, 0.42))
shade = Image.new('L', (1200, 630))
ImageDraw.Draw(shade).rectangle((0, 0, 1200, 630), fill=0)
for x in range(1200):
    a = int(max(0, 165 * (1 - x / 760)))
    ImageDraw.Draw(shade).line((x, 0, x, 630), fill=a)
og = Image.composite(Image.new('RGB', og.size, (5, 38, 96)), og, shade)
d = ImageDraw.Draw(og)
d.text((72, 168), '早安，我是', font=ImageFont.truetype(FONT, 44), fill='white')
d.text((64, 222), '陳儒紘', font=ImageFont.truetype(FONT, 168), fill='white')
d.text((72, 446), '網站與 LINE 機器人開發', font=ImageFont.truetype(FONT, 42), fill='white')
d.text((72, 506), '也做木工、煮菜、拍照', font=ImageFont.truetype(FONT, 34), fill=(220, 232, 248))
og.save(ROOT + '/assets/og.jpg', quality=86, optimize=True)

# 小圖示：晨藍底上一顆日光橘的太陽
for size, name in [(64, 'favicon.png'), (180, 'apple-touch-icon.png')]:
    s = size * 4
    im = Image.new('RGB', (s, s), SKY)
    r = s * 0.25
    ImageDraw.Draw(im).ellipse((s / 2 - r, s / 2 - r, s / 2 + r, s / 2 + r), fill=SUN)
    im.resize((size, size), Image.LANCZOS).save(ROOT + '/assets/' + name)
print('og', og.size)
