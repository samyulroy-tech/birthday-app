import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-display",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "For you ❤️",
    template: "%s | For you ❤️",
  },
  description: "A little surprise, made with love.",
  applicationName: "For you ❤️",
  generator: "Next.js",
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#090711",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-hidden bg-[#090711] antialiased">
        {/* Ambient background */}
        <div
          className="aurora-bg"
          aria-hidden="true"
        />

        {/* Cinematic edge vignette */}
        <div
          className="vignette-frame"
          aria-hidden="true"
        />

        {/* Decorative corner ornaments */}
        <div
          className="corner-ornament corner-tl"
          aria-hidden="true"
        />
        <div
          className="corner-ornament corner-tr"
          aria-hidden="true"
        />
        <div
          className="corner-ornament corner-bl"
          aria-hidden="true"
        />
        <div
          className="corner-ornament corner-br"
          aria-hidden="true"
        />

        {/* Main experience */}
        {children}
      </body>
    </html>
  );
}