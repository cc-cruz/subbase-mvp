import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SubBase | The Operating System for Subcontractors",
  description: "The first all-in-one operating system built exclusively for subcontractors. Crew scheduling, materials tracking, payment visibility, bid management, compliance, and more — at a price you can actually afford.",
};

const _dmSans = DM_Sans({ subsets: ["latin"] });
const _spaceMono = Space_Mono({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
