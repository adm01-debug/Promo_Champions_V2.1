import re

def patch(path, old, new, expect=1):
    with open(path, encoding="utf-8") as f:
        content = f.read()
    n = content.count(old)
    assert n == expect, f"{path}: encontrou {n} ocorrencias, esperava {expect}\nOLD: {old!r}"
    content = content.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"OK {path}")

# 1) pipeline-pulse-aggregator — filtros
p = "supabase/functions/pipeline-pulse-aggregator/index.ts"
patch(p,
  '''      ).in("status", [
        "lead",
        "qualified",
        "pending",
        "proposal",
        "negotiation",
      ]).limit(1000),''',
  '      ).in("status", [...OPEN_SALE_STATUSES]).limit(1000),')
patch(p,
  '''      supabase.from("sales").select("id, amount, updated_at").eq(
        "status",
        "won",
      ).gte("updated_at", since30).limit(1000),
      supabase.from("sales").select("id, amount, updated_at").eq(
        "status",
        "lost",
      ).gte("updated_at", since30).limit(1000),''',
  '''      supabase.from("sales").select("id, amount, updated_at").in(
        "status",
        [...WON_SALE_STATUSES],
      ).gte("updated_at", since30).limit(1000),
      supabase.from("sales").select("id, amount, updated_at").in(
        "status",
        [...LOST_SALE_STATUSES],
      ).gte("updated_at", since30).limit(1000),''')

# 2) useDealProbability — lista aberta errada
p2 = "src/hooks/useDealProbability.ts"
patch(p2, ".in('status', ['pending', 'completed']);", ".in('status', [...OPEN_SALE_STATUSES]);")
