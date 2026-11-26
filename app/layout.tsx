import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import ContactTab from "@/components/ContactTab";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jayprakash Malik",
    template: "%s · Jayprakash Malik",
  },
  description:
    "Portfolio, independent research and projects in business informatics and data analytics.",
  openGraph: { type: "website", siteName: "Jayprakash Malik" },
  twitter: { card: "summary_large_image" },
};

const introScript = `(function(){try{var last=Number(localStorage.getItem("intro-last-seen"));var play=!last||Date.now()-last>60000;document.documentElement.dataset.intro=play?"play":"done";}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="bg-white text-black antialiased dark:bg-black dark:text-white">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-black focus:px-4 focus:py-2 focus:text-sm focus:text-white dark:focus:bg-white dark:focus:text-black"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div id="main" tabIndex={-1} className="flex-1 outline-none">{children}</div>
            <Footer />
            <ContactTab />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}