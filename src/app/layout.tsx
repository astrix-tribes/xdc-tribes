import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3AuthProvider } from "./components/Web3AuthProvider";
import { PostsProvider } from "../context/PostsContext";
import { EventsProvider } from "../context/EventsContext";
import { ProfileProvider } from "../context/ProfileContext";
import { FuseBoxProvider } from "@/context/FuseBoxContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "XDC Tribe",
  description: "Decentralized communities on XDC Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FuseBoxProvider>
          <Web3AuthProvider>
            <PostsProvider>
              <EventsProvider>
                <ProfileProvider>
                  {children}
                </ProfileProvider>
              </EventsProvider>
            </PostsProvider>
          </Web3AuthProvider>
        </FuseBoxProvider>
      </body>
    </html>
  );
}
