
Build still failing — the previous write of `PipelineCoveragePanel.tsx` apparently didn't persist (read-only mode prevented the write). Also the file references `usePipelineCoverageAnalyzer` which I'm not sure exists. Let me verify both before planning.
