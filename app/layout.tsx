import type { Metadata } from "next";
import "./globals.css";
import "./macosstyle.css"

export const metadata: Metadata = {
  title: "Adwaith's Portfolio",
  description: "Portfolio of Adwaith.",
  
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
