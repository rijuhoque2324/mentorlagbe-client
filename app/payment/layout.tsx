import { Brand } from "@/components/layout/brand";

export default function PaymentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-svh flex-col bg-slate-50/70">
      <header className="border-b border-border bg-background">
        <div className="container-custom flex h-16 items-center">
          <Brand />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-background py-6">
        <div className="container-custom text-center text-xs leading-5 text-muted-foreground">
          Payment status is confirmed by the server. A redirect never grants a
          plan on its own.
        </div>
      </footer>
    </div>
  );
}
