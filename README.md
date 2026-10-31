# Vega Rich Text — LaTeX

LaTeX math renderer for Vega's rich-text service. It uses KaTeX with
`trust: false`, emits semantic MathML instead of font-dependent HTML and
sanitizes the result before insertion.

```ts
import latexRichText from "@haneoka/vega-plugin-richtext-latex";

service.render(target, {
  format: "latex",
  source: String.raw`\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}`,
  displayMode: true,
});
```

Install `@haneoka/vega-plugin-richtext` before this plugin. Invalid input remains
visible as source text and is marked as a render error by the service.

## License

[MPL-2.0](LICENSE).
