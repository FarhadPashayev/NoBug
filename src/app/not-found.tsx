import Link from "next/link";
import "./globals.css";

// Root-level 404 (outside the [lang] layout), so it renders its own html/body.
export default function NotFound() {
  return (
    <html lang="az">
      <body className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
        <div>
          <div className="mono-label text-muted">404</div>
          <h1 className="type-h2 mt-4">Səhifə tapılmadı</h1>
          <Link href="/az" className="btn-primary mt-8">
            Ana səhifə
          </Link>
        </div>
      </body>
    </html>
  );
}
