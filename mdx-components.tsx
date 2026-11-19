import type { MDXComponents } from "mdx/types";
import Callout from "@/components/Callout";
import Flow from "@/components/Flow";
import StockCoverage from "@/components/StockCoverage";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { Callout, Flow, StockCoverage, ...components };
}