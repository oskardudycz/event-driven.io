# Shared header and Open Sans visual review

Reviewed locally on 2026-10-11. The owner authorized https://event-driven.io as the visual baseline and requested consistent Open Sans for interface text. Hosted CI and deployment of the local changes are still pending.

## What caused the two failures

Both Firefox homepage tests were comparing against historical Chromium production screenshots from September. Those references also predate the current menu and theme control. The unchanged Git version `74a1705` reproduces both failures: 39,854 differing pixels for English and 47,048 for Polish, exceeding the existing 3% limit.

An isolated build of that Git version and the shared-shell implementation, before the font correction, produce **zero differing pixels** on both Firefox homepages. The isolated build also matches the current production Firefox captures with zero differing pixels in both locales. The header refactor did not introduce a new homepage layout.

Native controls were also using browser defaults: the hero button used Arial in Chromium and generic sans-serif in Firefox while surrounding text used Open Sans. The shared base stylesheet now makes controls inherit the page font family. Component font sizes/weights and loading-failure fallbacks remain intact. This follows [MDN's documented form-font inheritance](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Styling_web_forms#fonts_and_text).

## Comparison with current production

Captures use Playwright 1.64.0 on Linux, a 1440 × 900 viewport, loaded application fonts and a decoded hero background. Third-party requests are blocked consistently in both captures. Consecutive screenshots must be identical before capture is accepted. Pixelmatch uses the existing 0.2 color threshold; the 3% test tolerance is unchanged.

| Locale | Browser  | Production/local differing pixels | Ratio  |
| ------ | -------- | --------------------------------- | ------ |
| EN     | Chromium | 2,941 / 1,296,000                 | 0.227% |
| PL     | Chromium | 3,728 / 1,296,000                 | 0.288% |
| EN     | Firefox  | 2,548 / 1,296,000                 | 0.197% |
| PL     | Firefox  | 3,178 / 1,296,000                 | 0.245% |

Manual inspection of the screenshots and diffs shows the authorized Open Sans correction in the hero's latest-articles button: its label and width change, while its height, position and surrounding layout remain stable. The header and hero geometry match production within each browser. Raw screenshots, computed typography and an HTML comparison are retained locally in `visual-artifacts/header-review/`.

## Reference decision

Keep the existing Chromium reference files unchanged. Add English/Polish **production Firefox** captures under `tests/fixtures/visual/firefox/`; these are not captures of the failing local version. Playwright's native optional project-name path separates `--browser firefox` references from the unnamed default Chromium run. Other named browser runs require their own reviewed references, rather than silently using another engine's PNGs. [Playwright documents browser-specific references and snapshot path templates](https://playwright.dev/docs/test-snapshots).

The production Firefox images were reviewed against the local correction before adding them. They retain the deployed button font, so the local test continues to compare the authorized font correction against production. No geometry regression, assertion relaxation or automatic local snapshot update is accepted.

## Repeating the checks

```bash
npm run build
npm run test
npm run test:visual
npm run test:visual -- navigation.spec.ts theme.spec.ts browser-fonts.spec.ts fonts.spec.ts --browser firefox
npm run test:visual -- styles.spec.ts --browser firefox --grep 'usable fallback'
```

Review intentional visual differences before updating a reference. Use the same browser, platform, viewport and readiness checks for both images. See [the fixture instructions](../tests/fixtures/visual/README.md) for production capture commands. The selected Firefox group includes both homepage comparisons; do not omit them to report a passing header group.
