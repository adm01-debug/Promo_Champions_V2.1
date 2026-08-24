import { lazy, Suspense, useEffect, useState } from "react";

const SemanticSearchDialog = lazy(() =>
  import("./SemanticSearchDialog").then((m) => ({ default: m.SemanticSearchDialog })),
);

export function SemanticSearchMount() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("semantic-search:open", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("semantic-search:open", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!open) return null;
  return (
    <Suspense fallback={null}>
      <SemanticSearchDialog open={open} onOpenChange={setOpen} />
    </Suspense>
  );
}
