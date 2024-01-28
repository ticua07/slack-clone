import "./globals.css";
import { Inter } from 'next/font/google'

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Slack Clone",
    description: "Slack clone made with Next.js and Supabase",
};

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className={inter.className}>
            <body className="">
                {children}
            </body>
        </html>
    );
}
