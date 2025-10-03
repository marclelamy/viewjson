import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "View JSON - Beautiful JSON Visualizer",
    description: "A beautiful, client-side JSON visualizer that transforms your JSON data into an interactive node graph. No size limits, 100% free, runs entirely in your browser.",
    keywords: ["json", "visualizer", "json viewer", "json formatter", "json graph", "json tree", "react flow"],
    authors: [{ name: "Marc Lelamy" }],
    creator: "Marc Lelamy",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://viewjson.dev",
        title: "View JSON - Beautiful JSON Visualizer",
        description: "A beautiful, client-side JSON visualizer that transforms your JSON data into an interactive node graph. No size limits, 100% free.",
        siteName: "View JSON",
        images: [
            {
                url: "https://oh28wvg0kw.ufs.sh/f/Uq9yFdNAkVnxJZEqkWOoQ2PD48E517OZeNmAIdfgXpj6cnJh",
                width: 1200,
                height: 630,
                alt: "View JSON - Interactive JSON Visualizer",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "View JSON - Beautiful JSON Visualizer",
        description: "A beautiful, client-side JSON visualizer that transforms your JSON data into an interactive node graph. No size limits, 100% free.",
        images: ["https://oh28wvg0kw.ufs.sh/f/Uq9yFdNAkVnxJZEqkWOoQ2PD48E517OZeNmAIdfgXpj6cnJh"],
    },
    metadataBase: new URL("https://viewjson.dev"),
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
