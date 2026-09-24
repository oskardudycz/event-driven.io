# Visual reference screenshots

These 1440×900 PNGs began as captures from `https://event-driven.io` on 2026-09-24. The category image remains that production reference. The archive image was deliberately refreshed from the corrected local build after its H1 was moved below the header. They are reviewed visual benchmarks, not a claim that every detail of the old design is final.

Normal tests compare a locally served build (or `VISUAL_BASE_URL`) with these files and never contact production. To review the current screenshots and differences, run `yarn test:visual` and open `visual-artifacts/`. CI uploads that directory as an artifact.

Only after reviewing an intentional visual or content change, regenerate the baselines with `yarn test:visual:update` against the local build, inspect the PNG diff, and commit it. To capture production again, set `VISUAL_BASE_URL=https://event-driven.io` when running the update command. Do not update screenshots just to silence a regression.
