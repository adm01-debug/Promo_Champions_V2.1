#!/usr/bin/env python3
"""Fix CORS in edge functions: replace static corsHeaders with getCorsHeaders(req)."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
PATTERN_IMPORT = re.compile(
    r'import \{([^}]+)\} from ["\']\.\.\/_shared/cors\.ts["\'];'
)
PATTERN_HEADERS = re.compile(
    r'(\{\s*(?:\.\.\.)?corsHeaders)\b'
)

def fix_file(path: Path) -> bool:
    content = path.read_text(encoding="utf-8")

    # Skip if already uses getCorsHeaders
    if "getCorsHeaders" in content and "corsHeaders" not in content:
        return False

    original = content

    # Fix import: add getCorsHeaders
    def fix_import(m: re.Match) -> str:
        names = m.group(1)
        if "getCorsHeaders" in names:
            return m.group(0)
        # Remove existing corsHeaders and re-add with getCorsHeaders
        names = names.strip()
        # Already has getCorsHeaders?
        return f'import {{ {names}, getCorsHeaders }} from "../_shared/cors.ts";'

    content = PATTERN_IMPORT.sub(fix_import, content)

    # Fix all corsHeaders usages in header objects
    # Pattern: { ...corsHeaders, 'Content-Type': ... } or { headers: corsHeaders }
    # Replace: { ...getCorsHeaders(req), ... } or { headers: getCorsHeaders(req) }
    def replace_cors(m: re.Match) -> str:
        return m.group(1).replace("corsHeaders", "getCorsHeaders(req)")

    content = PATTERN_HEADERS.sub(replace_cors, content)

    if content != original:
        path.write_text(content, encoding="utf-8")
        return True
    return False

def main():
    shared = ROOT / "supabase" / "functions" / "_shared"
    fixed = 0
    skipped = 0

    for index_ts in sorted((ROOT / "supabase" / "functions").rglob("index.ts")):
        if "_shared" in index_ts.parts:
            skipped += 1
            continue
        if fix_file(index_ts):
            print(f"  FIXED {index_ts.relative_to(ROOT)}")
            fixed += 1
        else:
            skipped += 1

    # Also fix test files
    for test_file in sorted((ROOT / "supabase" / "functions").rglob("*.test.ts")):
        if fix_file(test_file):
            print(f"  FIXED {test_file.relative_to(ROOT)} (test)")
            fixed += 1

    print(f"\nTotal fixed: {fixed}, skipped: {skipped}")

if __name__ == "__main__":
    main()
