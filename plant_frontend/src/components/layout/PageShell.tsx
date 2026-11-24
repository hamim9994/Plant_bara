import type { ReactNode } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}

export default PageShell;
