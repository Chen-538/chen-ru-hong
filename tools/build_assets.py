"""Copy selected photos into assets/img as webp. Saving through Pillow drops EXIF, including GPS."""
import json, os, shutil, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALB = 'D:/claude專案/總相簿'
BOOK = 'D:/claude專案/我的個人資料/書審資料+接案'
P = ALB + '/個人/個人照/'
L = ALB + '/個人/風景/'
T = ALB + '/個人/頂級照片/'
W = BOOK + '/我覺得不錯的專案+圖片+文件/圖片庫/木工/'
F = ALB + '/我的作品~/'
OUT = ROOT + '/assets/img'

PHOTOS = {
    # 人
    'hero': (P + '2025-10-10_男子坐堤防眺望海景_01.JPG', 2400),
    'me-dock': (P + '2026-06-17_湖畔碼頭電動重機比讚_01.png', 1400),
    'me-cycle': (P + '2026-04-21_鹿耳門聖母廟前騎車_01.JPG', 1400),
    'me-kaohsiung': (P + '2026-04-21_眺望高雄港灣85大樓_01.JPG', 1400),
    'me-costume': (P + '2026-05-22_少數民族服飾扮裝比讚_01.png', 1400),
    'me-river': (P + '2026-05-22_河堤跨步舉手望向天空_01.png', 1400),
    'me-tree': (P + '2025-10-10_男子剪影伸手摘葉_01.JPG', 1400),
    'me-wind': (P + '2026-10-06_逆光剪影人物與風車_01.png', 1400),
    'me-lake': (P + '2026-06-17_湖畔步道遠眺背影_01.png', 1400),
    'me-mrt': (P + '2026-05-26_捷運月台夕陽人像_01.PNG', 1800),
    'me-mrt2': (P + '2026-05-26_捷運站仰頭倚牆而坐_01.PNG', 1400),
    # 木工
    'wood-nail': (T + '2026-08-19_口罩男子操作釘槍_01.jpg', 1600),
    'wood-saw': (T + '2026-08-19_口罩男子裁切木料_01.jpg', 1600),
    'wood-floor': (W + '2026-08-28_室內裁切木料施工_01.jpg', 1400),
    'wood-ceiling': (W + '2026-09-01_天花板骨架接線施工_01.jpg', 1400),
    'wood-panel': (W + '2026-07-09_木紋隔板轉角特寫_01.png', 1400),
    'wood-door': (W + '2026-08-06_裝潢中新木門特寫_01.png', 1400),
    # 攝影
    'ph-coast': (L + '2026-05-22_海岸紅屋頂民宿俯瞰_01.png', 1800),
    'ph-city': (L + '2025-10-18_直幅台北夜景雲海_01.JPG', 1800),
    'ph-jiufen': (L + '2025-10-10_九份老街夜市人潮_01.JPG', 1800),
    'ph-bridge': (L + '2026-05-22_紅色拱橋河畔夜景_01.png', 1800),
    'ph-valley': (L + '2026-05-26_草原步道通往山谷_01.png', 1800),
    'ph-tamsui': (L + '2026-06-17_山頂俯瞰淡水河出海口_01.png', 1800),
    'ph-sunmoon': (L + '2026-06-17_日月潭湖景全景_01.png', 1800),
    'ph-riverset': (L + '2026-06-17_河濱夕陽高樓天際線_01.png', 1800),
    'ph-street': (L + '2026-06-17_都市街道夕陽晚霞車流_01.png', 1800),
    'ph-rays': (L + '2026-08-06_夕陽雲彩放射光芒_01.png', 1800),
    'ph-storm': (L + '2026-08-06_烏雲籠罩山谷河流_01.png', 1800),
    'ph-lake': (L + '2026-08-06_陰天湖水環山景色_01.png', 1800),
    'ph-fireworks': (L + '2026-08-15_金色煙火燈柱剪影_01.jpg', 1800),
    'ph-clouds': (L + '2026-09-20_藍天雲層與街道_01.jpg', 1800),
    'ph-dusk': (L + '2026-09-28_黃昏河岸晚霞_01.JPG', 1800),
}
KEEP_FOOD = {2, 3, 7, 39, 55, 64}   # 首頁六道菜，數字是資料夾排序後的索引


def save(src, dst, size):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    im.thumbnail((size, size))
    im.save(dst, 'WEBP', quality=80, method=5)
    return im.size


os.makedirs(OUT + '/food', exist_ok=True)
manifest = {}
for k, (src, size) in PHOTOS.items():
    manifest[k] = save(src, f'{OUT}/{k}.webp', size)

foods = sorted(f for f in os.listdir(F) if f.lower().endswith(('.jpg', '.jpeg', '.png')))
food_sizes = []
for i, f in enumerate(foods):
    if i not in KEEP_FOOD:
        continue
    n = len(food_sizes) + 1
    # 保留原始索引，首頁精選才對得上
    name = f'{i:02d}.webp'
    food_sizes.append({'f': name, 'wh': save(F + f, f'{OUT}/food/{name}', 1000)})
manifest['food'] = food_sizes


json.dump(manifest, open(ROOT + '/tools/assets.json', 'w', encoding='utf8'), ensure_ascii=False, indent=0)
total = sum(os.path.getsize(os.path.join(d, x)) for d, _, fs in os.walk(OUT) for x in fs)
print('photos', len(PHOTOS), 'food', len(food_sizes), 'MB', round(total / 1e6, 1))
