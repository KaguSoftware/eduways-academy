import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";

/** Branded markdown renderer for posts/guides. Internal links stay locale-aware. */
export function Markdown({ children }: { children: string }) {
    return (
        <div className="space-y-5 text-base leading-8 text-foreground/90 [&_strong]:font-bold [&_strong]:text-foreground">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h2: ({ children }) => (
                        <h2 className="mt-10 text-2xl font-extrabold tracking-tight text-brand-950">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="mt-8 text-xl font-bold">{children}</h3>
                    ),
                    p: ({ children }) => <p>{children}</p>,
                    ul: ({ children }) => (
                        <ul className="list-disc space-y-1.5 ps-6 marker:text-brand-500">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal space-y-1.5 ps-6 marker:font-bold marker:text-brand-600">
                            {children}
                        </ol>
                    ),
                    a: ({ href, children }) =>
                        href?.startsWith("/") ? (
                            <Link
                                href={href as never}
                                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                            >
                                {children}
                            </Link>
                        ) : (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener"
                                className="font-semibold text-brand-700 underline-offset-4 hover:underline"
                            >
                                {children}
                            </a>
                        ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto rounded-2xl border border-border">
                            <table className="w-full text-sm">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                            {children}
                        </thead>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-start font-semibold">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="border-t border-border px-4 py-3">
                            {children}
                        </td>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="rounded-2xl border-s-4 border-brand-400 bg-brand-50 px-5 py-3 text-brand-900">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="border-border" />,
                }}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
}
