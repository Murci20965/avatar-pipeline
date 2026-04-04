import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Avatar Pipeline",
  description: "AI-Driven Interaction Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 
        The Dark Canvas:
        Applies the dark background, hide scrollbars, and lock the screen size directly to the body.
      */}
      <body className="bg-zinc-950 text-zinc-50 overflow-hidden h-screen w-screen m-0 antialiased">
        {children}
      </body>
    </html>
  );
}