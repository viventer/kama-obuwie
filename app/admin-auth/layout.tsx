import { ReactNode } from "react";

export default function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="h-screen flex items-center justify-center mx-auto w-[90%] max-w-[1440px]">
      {children}
    </main>
  );
}
