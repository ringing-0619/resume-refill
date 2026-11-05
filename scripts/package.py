"""Build an unpackable extension ZIP and a clean GitHub source ZIP."""
from pathlib import Path
import json
import zipfile

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)
VERSION = json.loads((ROOT / "extension/manifest.json").read_text())["version"]
EXCLUDED = {".git", ".demo-runtime", "node_modules", "dist", "tmp", "private", ".DS_Store", "__pycache__", "test-results", "playwright-report"}


def write_zip(target, entries):
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED) as archive:
        for source, name in sorted(entries, key=lambda entry: entry[1]):
            archive.write(source, name)
    print(f"Created {target.name} ({target.stat().st_size:,} bytes)")


extension = [(file, file.relative_to(ROOT / "extension").as_posix())
             for file in (ROOT / "extension").rglob("*") if file.is_file() and file.name != ".DS_Store"]
extension += [(ROOT / file, file) for file in ("LICENSE", "NOTICE.md", "THIRD_PARTY_NOTICES.md")]
write_zip(DIST / f"resume-refill-extension-v{VERSION}.zip", extension)
public = []
for file in ROOT.rglob("*"):
    rel = file.relative_to(ROOT)
    if file.is_file() and not file.is_symlink() and not any(part in EXCLUDED or part.startswith(".env") for part in rel.parts):
        if file.suffix != ".log" and "resume-backup" not in file.name:
            public.append((file, f"resume-refill/{rel.as_posix()}"))
write_zip(DIST / "resume-refill-github.zip", public)
