# Builds the single-document review site from site/ and writes everything into review/out/ (not tracked by git).
#
#   python review/make.py
#
# Steps, in order (each reads the previous one's output):
#   1. build.py en   the English homepage as a fragment, links pointing at the shell's hash routes
#   2. build.py ar   the Arabic homepage, same
#   3. build_pages.py   the inner pages as views of one document
#   4. build_single.py  the shell: inner pages + the two homepages as full-screen iframes
# Then it writes:
#   review/out/maydi-house-single.html   publish this one as the artifact's main page
#   review/out/publish-files.json        the files to pass beside it (assets the page uses, plus the engine)
#   review/out/preview/                  the same site as the artifact serves it, for local tests
import json, pathlib, re, shutil, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
OUT = HERE / 'out'
OUT.mkdir(exist_ok=True)

def run(*args):
    r = subprocess.run([sys.executable, str(HERE / args[0]), *args[1:]], cwd=str(ROOT), capture_output=True, text=True, encoding='utf-8')
    if r.returncode:
        sys.exit(f'{args[0]} failed:\n{r.stdout}\n{r.stderr}')

run('build.py', 'en', 'ar.html', 'public', 'pages.html')
run('build.py', 'ar', 'index.html', 'public', 'pages.html')
run('build_pages.py', '#home')
run('build_single.py')

single = (OUT / 'maydi-house-single.html').read_text(encoding='utf-8')
assert 'Thmanyah' not in single, 'a licensed font reference slipped into the review page'
assert 'fonts-local' not in single and 'assets/type' not in single

# files the published page needs beside it: every assets/ path it mentions, plus the engine
refs = sorted(set(re.findall(r'assets/[A-Za-z0-9_./-]+\.(?:webp|mp4)', single)))
missing = [r for r in refs if not (ROOT / 'site' / r).exists()]
assert not missing, f'referenced but missing from site/: {missing}'
files = {r: r for r in refs}
files['scrollcraft.css'] = 'scrollcraft.css'
files['scrollcraft.js'] = 'scrollcraft.js'
(OUT / 'publish-files.json').write_text(json.dumps({'root': str(ROOT / 'site'), 'files': files}, indent=1), encoding='utf-8')

# local preview, laid out the way the artifact serves it
PREVIEW = OUT / 'preview'
if PREVIEW.exists():
    shutil.rmtree(PREVIEW)
(PREVIEW / 'assets').mkdir(parents=True)
for r in refs:
    dest = PREVIEW / r
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(ROOT / 'site' / r, dest)
for f in ['scrollcraft.css', 'scrollcraft.js']:
    shutil.copy(ROOT / 'site' / f, PREVIEW / f)
HEAD = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<style>[hidden]{display:none!important}</style></head><body>\n')
(PREVIEW / 'index.html').write_text(HEAD + single + '\n</body></html>\n', encoding='utf-8')
# the artifact viewer runs the page in a sandboxed iframe; tests use the same frame
(PREVIEW / 'sandbox.html').write_text(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><body style="margin:0">'
    '<iframe id="f" style="width:100vw;height:100vh;border:0" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock" src="/review/out/preview/index.html"></iframe>',
    encoding='utf-8')

print(f'built {OUT / "maydi-house-single.html"} ({len(single):,} bytes), {len(files)} files to publish with it')
