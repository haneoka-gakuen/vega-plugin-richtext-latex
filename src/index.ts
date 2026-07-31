import createDOMPurify from "dompurify";
import katex from "katex";
import {
  defineVegaPlugin,
  type VegaPlugin,
} from "@haneoka/vega/plugin";
import {
  VEGA_RICH_TEXT_SERVICE,
  type VegaRichTextRenderRequest,
  type VegaRichTextRenderer,
} from "@haneoka/vega-plugin-richtext";

export interface LatexRichTextOptions {
  readonly strict?: "ignore" | "warn" | "error";
  readonly macros?: Readonly<Record<string, string>>;
}

const sanitizedMathMl = (
  document: Document,
  source: string,
  displayMode: boolean,
  options: LatexRichTextOptions,
): DocumentFragment => {
  const markup = katex.renderToString(source, {
    displayMode,
    output: "mathml",
    throwOnError: true,
    trust: false,
    strict: options.strict ?? "warn",
    ...(options.macros ? { macros: { ...options.macros } } : {}),
  });
  const window = document.defaultView;
  if (!window) throw new Error("LaTeX rich text requires a DOM window");
  const purifier = createDOMPurify(window);
  return purifier.sanitize(markup, {
    RETURN_DOM_FRAGMENT: true,
    USE_PROFILES: { html: true, mathMl: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["style"],
  }) as unknown as DocumentFragment;
};

export const createLatexRichTextRenderer = (
  options: LatexRichTextOptions = {},
): VegaRichTextRenderer =>
  Object.freeze({
    id: "haneoka-latex",
    formats: ["latex", "tex"],
    render(request: VegaRichTextRenderRequest) {
      if (request.signal.aborted) {
        throw request.signal.reason ??
          new DOMException("LaTeX render aborted", "AbortError");
      }
      return sanitizedMathMl(
        request.document,
        request.source,
        request.displayMode ?? false,
        options,
      );
    },
  });

export const createLatexRichTextPlugin = (
  options: LatexRichTextOptions = {},
): VegaPlugin =>
  defineVegaPlugin({
    manifest: {
      id: "haneoka.vega-richtext-latex",
      name: "Vega Rich Text — LaTeX",
      version: "0.1.0",
      apiVersion: 1,
      description: "Safe KaTeX-to-MathML rich-text renderer",
      dependencies: {
        "haneoka.vega-richtext": "^0.1.0",
      },
      capabilities: ["rich-text"],
    },
    setup(context) {
      const service = context.service(VEGA_RICH_TEXT_SERVICE);
      if (!service) {
        throw new Error(
          "LaTeX rich text requires haneoka.vega-richtext to be installed first",
        );
      }
      const registration = service.register(
        createLatexRichTextRenderer(options),
      );
      return { dispose: () => registration.dispose() };
    },
  });

export const latexRichTextPlugin = createLatexRichTextPlugin();

export default latexRichTextPlugin;
