import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
  title: {
    default: "Jayprakash Malik",
    template: "%s · Jayprakash Malik",
  },
  description:
    "Portfolio, independent research and projects in business informatics and data analytics.",
};

const introScript = `(function(){try{var last=Number(localStorage.getItem("intro-last-seen"));var play=!last||Date.now()-last>900000;document.documentElement.dataset.intro=play?"play":"done";}catch(e){}})();`;

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
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
            <BackToTop />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}