# Hero artwork exports

The editable originals remain `hero-background.pdn` and `hero-background-right.pdn`. The website uses exports from **hero-background-right.pdn**, a 3840×2160 Paint.NET document. No portrait retouching, generated imagery, upscaling or sharpening is applied.

The exports separate the photo from the texture so responsive layout cannot crop the face or paint text over the yellow shape.

| Website asset                     | Source layers (zero-based, bottom to top)                                                                  | Export                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/images/png/hero-speaker.png` | Layer 9, `Warstwa 9` (yellow shape, opacity 174/255), and layer 12, `Warstwa 7` (speaker, opacity 255/255) | Transparent PNG; trim to the combined alpha bounds `(2191, 306)–(3735, 1750)`, yielding 1544×1444. Keep the complete speaker and laptop as authored. |
| `src/images/png/hero-tiles.webp`  | Layer 1, `Warstwa 6` (black canvas), plus layers 2 and 3, `Warstwa 4` (original tiles)                     | Composite at the original 3840×2160 canvas size; WebP quality 88. Preserve the original canvas ratio and authored tile placement.                    |

To re-export in Paint.NET, work on a copy, hide all other layers, and keep the original pixels and layer opacity. For the transparent shape/photo export, use normal alpha compositing: the shape's original Screen blend depended on the underlying tile image, which now belongs to CSS. Retain its yellow pixels and 174/255 opacity. Trim only the transparent photo canvas to the bounds above before saving. Keep the tile canvas at its original size, without the old darkness masks or header strip; the hero applies one uniform 63% dark overlay in its own CSS Module, corresponding to the original 160/255 darkness mask. Cropping the tile export changed its covering scale and was rejected.

The exports were decoded with [pypdn](https://github.com/addisonElliott/pypdn) and Pillow in `/tmp` as a one-time conversion. Those tools are not project dependencies or part of the build. A pixel comparison found zero differences on every fully opaque source portrait pixel after trimming the transparent canvas. Gatsby's existing image plugin creates responsive PNG/WebP delivery sizes at quality 90. Keep `objectFit="contain"` and the intrinsic aspect ratio when changing image delivery.

Review both languages at narrow, tall, wide and short viewports after changing these assets. The photo and copy occupy separate columns from the shared desktop breakpoint; mobile/tablet use only the same tile texture. See [CSS guidance](../docs/tailwind-guidance.md#responsive-hero-and-header-research) and the browser checks in `tests/browser/hero.spec.ts`.
