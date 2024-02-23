import "./globals.css";
import { Inter } from 'next/font/google'
import { Open_Sans } from "next/font/google";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Slack Clone",
    description: "Slack clone made with Next.js and Supabase",
};

const inter = Inter({ subsets: ['latin'] })
const openSans = Open_Sans({
    subsets: ["latin"],
    variable: "--open-sans"
})

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.className} ${openSans.className}`}>
            <body className="">
                {children}
            </body>
        </html>
    );
}
