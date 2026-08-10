import type { Metadata } from "next";
import "./globals.css";

// Fonts are loaded via a <link> tag (fetched by the browser at runtime)
// rather than next/font, so the production build never depends on
// reaching fonts.googleapis.com — useful on flaky demo-day wifi. CSS
// fallback stacks in globals.css keep things legible if the request fails.
export const metadata: Metadata = {
  title: "Recall — Talk to your meeting history",
  description: "Ask your meeting memory anything, out loud.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-base-bg text-ink-primary antialiased">
        {children}
      </body>
    </html>
  );
}
