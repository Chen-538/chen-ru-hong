"""Subset fonts to the characters the site uses. Rerun after changing any copy."""
import os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FD = 'D:/claude專案/tools/fonts/'
text = open(ROOT + '/index.html', encoding='utf8').read()
text += open(ROOT + '/js/main.js', encoding='utf8').read()
chars = ''.join(sorted(set(text) | set('0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ')))
tmp = ROOT + '/tools/_chars.txt'
open(tmp, 'w', encoding='utf8').write(chars)
for src, out in [('wenkai/LXGWWenKaiTC-Medium.ttf', 'wenkai'), ('genseki/GenSekiGothic2TW-R.otf', 'seki-400'), ('genseki/GenSekiGothic2TW-B.otf', 'seki-700')]:
    subprocess.run([sys.executable, '-m', 'fontTools.subset', FD + src, f'--text-file={tmp}', '--flavor=woff2',
                    f'--output-file={ROOT}/assets/fonts/{out}.woff2', '--layout-features=*', '--no-hinting'], check=True)
    print(out, round(os.path.getsize(f'{ROOT}/assets/fonts/{out}.woff2') / 1024), 'KB')
os.remove(tmp)
print('chars', len(chars))
