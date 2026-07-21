import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "ui-style-kit-css/visual.css";
import "ui-style-kit-css/interactive-surface-theme.css";
import "interactive-surface-css/state-core.css";
import "layout-style-css";

import { ECOSYSTEM_PACKAGES } from "./data/ecosystem";
import { SITE, withBasePath } from "./lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.owner.name }],
  creator: SITE.owner.name,
  publisher: SITE.owner.name,
  category: "technology",
  classification: "Developer tools",
  referrer: "origin-when-cross-origin",
  keywords: [
    "CSS design system",
    "CSS layout library",
    "accessible interface components",
    "layout-style-css",
    "ui-style-kit-css",
    "interactive-surface-css",
    "frontend development",
  ],
  alternates: { canonical: SITE.url },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE.url,
    title: SITE.title,
    description: SITE.description,
    siteName: SITE.name,
    locale: SITE.locale,
    images: [
      {
        url: SITE.socialImage,
        width: 1200,
        height: 630,
        alt: "Interface Systems Lab orbital three-layer interface system",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: [SITE.socialImage],
  },
  icons: {
    icon: [
      { url: withBasePath("/favicon.ico"), sizes: "any" },
      {
        url: withBasePath("/favicon-32x32.png"),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: withBasePath("/favicon-16x16.png"),
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: withBasePath("/favicon.ico"),
    apple: [
      {
        url: withBasePath("/apple-touch-icon.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: withBasePath("/manifest.webmanifest"),
  appleWebApp: {
    capable: true,
    title: SITE.name,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  other: {
    "msapplication-config": withBasePath("/browserconfig.xml"),
    "msapplication-TileColor": "#07111f",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#07111f" },
  ],
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}#organization`,
      name: SITE.owner.name,
      logo: SITE.brandLogo,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "WebPage",
      "@id": `${SITE.url}#webpage`,
      name: SITE.title,
      url: SITE.url,
      description: SITE.description,
      isPartOf: { "@id": `${SITE.url}#website` },
      publisher: { "@id": `${SITE.url}#organization` },
      inLanguage: "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}#application`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      codeRepository: SITE.repository,
      publisher: { "@id": `${SITE.url}#organization` },
      logo: SITE.brandLogo,
    },
    {
      "@type": "ItemList",
      "@id": `${SITE.url}#packages`,
      name: "Interface Systems Lab CSS packages",
      numberOfItems: ECOSYSTEM_PACKAGES.length,
      itemListElement: ECOSYSTEM_PACKAGES.map((pkg, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: pkg.name,
          description: pkg.summary,
          version: pkg.version,
          codeRepository: pkg.links.repository,
          url: pkg.links.npm,
          programmingLanguage: "CSS",
        },
      })),
    },
  ],
};

const serializedStructuredData = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c",
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializedStructuredData }}
        />
        {children}
      </body>
    </html>
  );
}
