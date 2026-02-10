import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agora - Comment System powered by GitHub Discussions",
  description:
    "A commenting system that uses GitHub Discussions as the backend. Drop-in React component for any website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
