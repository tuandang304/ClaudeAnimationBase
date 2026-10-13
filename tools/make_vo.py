#!/usr/bin/env python3
# make_vo.py: the voice-over clips for one video, with VieNeu-TTS v3 Turbo (offline, CPU, Apache-2.0: the audio may be
# used in commercial content). Reads videos/<name>/audio/lines.tsv (id, role, text[, tempo]) and writes
# videos/<name>/audio/vo/<id>.wav (48 kHz mono, silence trimmed). Then rebuild that video's soundtrack.
#
#   .venv/bin/python tools/make_vo.py videos/aima-01                  every line whose text, voice or settings changed
#   .venv/bin/python tools/make_vo.py videos/aima-01 c_hook n_2 --force   just these lines, regenerated
#   .venv/bin/python tools/make_vo.py --list                          the preset voices
#   .venv/bin/python tools/make_vo.py --say="Xin chào" --voice="Ngọc Huyền" --out=test.wav   try a voice
#   .venv/bin/python tools/make_vo.py --audition="Ủa? Hết ngày rồi?"   the line in EVERY preset voice → out/voices/
#                                                                     (open out/voices/index.html to listen and compare)
#
# Settings: tools/voice/voices.json (roles → voices, tempo per role, temperature, takes), overridden per video by
# videos/<name>/audio/voices.json. Pronunciation: tools/voice/pronunciation.tsv (e.g. content → còn ten), plus the
# video's own audio/pronunciation.tsv if it has one; captions keep the real spelling, only the voice hears the respelling.
# A line is spoken a sentence at a time and the sentences are joined with the pauses in voices.json, so it breathes
# like a person talking. Each line is generated `takes` times (seeded, so reruns are repeatable) and the take of median length is kept, which
# drops the occasional rushed or babbled take. To use your own recording instead, save it as vo/<id>.wav: lines that
# aren't in vo/manifest.json are never overwritten.
# Setup (once):  uv venv --python 3.12 .venv && VIRTUAL_ENV=.venv uv pip install -r tools/requirements.txt
import argparse, hashlib, json, os, re, subprocess, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_DIR = os.path.join(ROOT, 'tools/voice')


def load_json(path):
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def load_pron(*paths):
    rules = {}
    for p in paths:
        if not os.path.exists(p): continue
        for ln in open(p, encoding='utf-8'):
            if ln.strip() and not ln.startswith('#'):
                word, spoken = ln.rstrip('\n').split('\t')[:2]
                rules[word.strip()] = spoken.strip()
    return rules


def respell(text, rules):
    for word in sorted(rules, key=len, reverse=True):
        text = re.sub(r'(?<!\w)' + re.escape(word) + r'(?!\w)', rules[word], text, flags=re.IGNORECASE)
    return text


def trim(a, sr, pad, db=-42):
    # cut the silence at both ends: everything quieter than `db` below the peak, keeping `pad` seconds
    env = np.convolve(np.abs(a), np.ones(int(.01 * sr)) / int(.01 * sr), 'same')
    loud = np.nonzero(env > np.abs(a).max() * 10 ** (db / 20))[0]
    if not len(loud): return a
    i0, i1 = max(0, loud[0] - int(pad * sr)), min(len(a), loud[-1] + int(pad * 1.5 * sr))
    out = a[i0:i1].copy(); n = int(.006 * sr)
    out[:n] *= np.linspace(0, 1, n); out[-n:] *= np.linspace(1, 0, n)
    return out


def sentences(text):
    # [(sentence, pause after it)]: split after '…'/'...' (a trailing-off pause) and '.', '!', '?' (a full stop)
    parts = re.findall(r'.+?(?:\.\.\.|…|[.!?]+)(?=\s|$)|.+?$', text.strip())
    out = []
    for p in (x.strip() for x in parts):
        if not p: continue
        out.append((p, 'ellipsis' if p.endswith(('...', '…')) else 'sentence'))
    return out


def speak(tts, text, voice, cfg):
    # one sentence at a time, joined with a real pause: the model on its own barely stops between sentences
    sr, pauses, out = tts.sample_rate, cfg.get('pauses', {}), []
    parts = sentences(text)
    for i, (p, kind) in enumerate(parts):
        out.append(trim(tts.infer(p, voice=voice, temperature=cfg['temperature']), sr, cfg['pad']))
        if i < len(parts) - 1: out.append(np.zeros(int(pauses.get(kind, 0) * sr)))
    return np.concatenate(out)


def write_wav(path, a, sr, tempo=1.):
    a = np.clip(a / max(1e-9, np.abs(a).max()) * .89, -1, 1)
    tmp = path + '.tmp.wav'
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype('<i2').tobytes())
    if abs(tempo - 1) < 1e-3: os.replace(tmp, path); return
    # slower or faster without changing the pitch
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', f'atempo={tempo}', path], check=True); os.remove(tmp)


def audition(tts, cfg, text, out_dir):
    # every preset voice reading the same text, and a page to compare them side by side
    import html
    os.makedirs(out_dir, exist_ok=True)
    rules = load_pron(os.path.join(VOICE_DIR, 'pronunciation.tsv'))
    spoken, rows = respell(text, rules), []
    for n, (label, vid) in enumerate(tts.list_preset_voices(), 1):
        np.random.seed(n)
        fn = f'{n:02d}.wav'
        write_wav(os.path.join(out_dir, fn), speak(tts, spoken, vid, cfg), tts.sample_rate)
        name, _, desc = label.lstrip('⭐ ').partition(' — ')
        now = [r for r, v in cfg['roles'].items() if v == vid]
        rows.append(f'<tr><td>{n}</td><td><b>{html.escape(name)}</b>{" ⭐" if label.startswith("⭐") else ""}</td><td>{html.escape(desc)}</td>'
                    f'<td>{html.escape(", ".join(now))}</td><td><audio controls preload="none" src="{fn}"></audio></td></tr>')
        print(f'{n:02d} {label}')
    open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8').write(f'''<!doctype html><meta charset="utf-8"><title>Voices</title>
<style>body{{font:15px system-ui;margin:24px;background:#faf8f5;color:#222}} td{{padding:6px 12px;border-bottom:1px solid #e5e0d8}} th{{text-align:left;padding:6px 12px}}</style>
<h2>VieNeu-TTS preset voices</h2><p>Line: <i>{html.escape(text)}</i><br>⭐ = the model's recommended voices. "In use" = the role that uses it now (tools/voice/voices.json).</p>
<table><tr><th>#</th><th>Voice</th><th>Gender · region · style</th><th>In use</th><th></th></tr>{''.join(rows)}</table>''')
    print('open', os.path.join(out_dir, 'index.html'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video', nargs='?'); ap.add_argument('ids', nargs='*')
    ap.add_argument('--force', action='store_true'); ap.add_argument('--list', action='store_true')
    ap.add_argument('--say'); ap.add_argument('--voice'); ap.add_argument('--out', default='say.wav')
    ap.add_argument('--audition')
    a = ap.parse_args()

    from vieneu import Vieneu
    tts = Vieneu()
    if a.list:
        for label, _ in tts.list_preset_voices(): print(label)
        return
    cfg = load_json(os.path.join(VOICE_DIR, 'voices.json'))
    if a.audition:
        audition(tts, cfg, a.audition, os.path.join(ROOT, 'out/voices')); return
    if a.say:
        rules = load_pron(os.path.join(VOICE_DIR, 'pronunciation.tsv'))
        voice = a.voice or cfg['roles']['creator']
        write_wav(a.out, speak(tts, respell(a.say, rules), voice, cfg), tts.sample_rate)
        print('wrote', a.out); return
    if not a.video: ap.error('which video? e.g. videos/aima-01')

    vdir = os.path.join(a.video, 'audio')
    over = load_json(os.path.join(vdir, 'voices.json'))
    cfg = {**cfg, **over, 'roles': {**cfg.get('roles', {}), **over.get('roles', {})}}
    rules = load_pron(os.path.join(VOICE_DIR, 'pronunciation.tsv'), os.path.join(vdir, 'pronunciation.tsv'))
    out_dir = os.path.join(vdir, 'vo'); os.makedirs(out_dir, exist_ok=True)
    man_path = os.path.join(out_dir, 'manifest.json'); man = load_json(man_path)

    for ln in open(os.path.join(vdir, 'lines.tsv'), encoding='utf-8'):
        if not ln.strip() or ln.startswith('#'): continue
        f = ln.rstrip('\n').split('\t')
        lid, role, text = f[0], f[1], f[2]
        tempo = cfg['tempo'].get(role, 1.) if isinstance(cfg['tempo'], dict) else cfg['tempo']
        if len(f) > 3 and f[3]: tempo = float(f[3])
        if a.ids and lid not in a.ids: continue
        voice = cfg['roles'].get(role, role)
        spoken = respell(text, rules)
        spec = {'text': text, 'spoken': spoken, 'voice': voice, 'tempo': tempo, 'temperature': cfg['temperature'], 'takes': cfg['takes'], 'pauses': cfg.get('pauses')}
        path = os.path.join(out_dir, lid + '.wav')
        if os.path.exists(path) and lid not in man and not a.force:
            print(f'{lid}: your own recording, kept'); continue
        if os.path.exists(path) and man.get(lid) == spec and not a.force:
            continue
        takes = []
        for k in range(cfg['takes']):
            np.random.seed(int(hashlib.md5(f'{lid}/{k}/{spoken}/{voice}'.encode()).hexdigest()[:8], 16))
            takes.append(speak(tts, spoken, voice, cfg))
        lens = [len(t) / tts.sample_rate for t in takes]
        best = takes[int(np.argsort(lens)[len(lens) // 2])]
        write_wav(path, best, tts.sample_rate, tempo)
        man[lid] = spec
        print(f'{lid:12s} {voice:12s} {len(best) / tts.sample_rate / tempo:5.2f} s  (takes {" ".join(f"{x:.2f}" for x in lens)})  {spoken}')
    json.dump(man, open(man_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    sys.exit(main())
