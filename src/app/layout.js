import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "BracketHub",
  description:
    "E-sports Tournament Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="navbar">
          <Link
            href="/"
            className="logo"
          >
            BracketHub
          </Link>

          <nav>
            <Link href="/">
              Dashboard
            </Link>

            <Link href="/tournaments">
              Tournaments
            </Link>

            <Link href="/teams">
              Teams
            </Link>

            <Link href="/matches">
              Matches
            </Link>

            <Link href="/bracket">
              Bracket
            </Link>
          </nav>
        </header>

        {children}

        <footer>
          BracketHub — E-sports Tournament
          Management System
        </footer>
      </body>
    </html>
  );
}