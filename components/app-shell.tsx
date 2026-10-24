"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, Bell, ClipboardList, FileBarChart, Gauge, House,
  LayoutDashboard, LogOut, Menu, Settings2, Waves, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { label: "Home", href: "/home", icon: House },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Instrumentos", href: "/instruments", icon: Settings2 },
  { label: "Leituras", href: "/readings", icon: Activity },
  { label: "Gráficos", href: "/charts", icon: FileBarChart },
  { label: "Relatórios", href: "/reports", icon: ClipboardList },
  { label: "Indicadores", href: "/indicators", icon: Gauge },
];

const titles: Record<string, string> = {
  "/home": "Página inicial",
  "/dashboard": "Dashboard",
  "/instruments": "Instrumentos de barragem",
  "/readings": "Leituras de instrumentos",
  "/charts": "Gráficos",
  "/reports": "Relatórios",
  "/indicators": "Indicadores de leitura",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("operador@monibarragem.com");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("hydroguard-session");
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserEmail(session);
  }, [router]);

  function signOut() {
    localStorage.removeItem("hydroguard-session");
    router.replace("/login");
  }

  return (
    <div className="app-frame">
      <main className="main-content">
        <header className="topbar">
          <Link href="/home" className="brand-lockup topbar-brand" aria-label="MoniBarragem, página inicial">
            <span className="brand-mark"><Waves size={20} /></span>
            monibarragem
          </Link>
          <nav id="primary-navigation" className={`nav-list ${menuOpen ? "mobile-open" : ""}`} aria-label="Navegação principal">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon size={15} strokeWidth={1.8} /> {label}
            </Link>
          ))}
          </nav>
          <div className="topbar-right">
            <button className="icon-button mobile-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="primary-navigation" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
            <span className="topbar-date">Complexo Hidrelétrico · UHE Serra Azul</span>
            <ThemeToggle compact />
            <div className="notification-anchor">
              <button className="icon-button notification-button" aria-label="Notificações" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={16} /><span className="notification-count">3</span>
              </button>
              {notificationsOpen && (
                <section className="notification-popover" aria-label="Notificações recentes">
                  <div className="notification-popover-heading"><strong>Notificações</strong><span className="status-pill warning">3 novas</span></div>
                  <Link href="/indicators" onClick={() => setNotificationsOpen(false)}><span className="notification-dot red" /><span><strong>MA-008 requer atenção</strong><small>Deslocamento próximo ao limite</small></span></Link>
                  <Link href="/readings" onClick={() => setNotificationsOpen(false)}><span className="notification-dot green" /><span><strong>Leitura registrada</strong><small>PZ-034 · Hoje às 09:42</small></span></Link>
                  <Link href="/instruments" onClick={() => setNotificationsOpen(false)}><span className="notification-dot blue" /><span><strong>Programação atualizada</strong><small>12 leituras previstas para hoje</small></span></Link>
                </section>
              )}
            </div>
            <div className="avatar topbar-avatar" title={userEmail}>{userEmail.slice(0, 1).toUpperCase()}</div>
            <button className="icon-button sign-out-button" aria-label="Sair" onClick={signOut}><LogOut size={15} /></button>
          </div>
        </header>
        <div className="breadcrumb">Monitoramento <span style={{ padding: "0 7px", color: "#a4afbd" }}>/</span> <strong>{titles[pathname] ?? "Monitoramento"}</strong></div>
        <div key={pathname} className="route-transition" aria-live="polite">
          {children}
        </div>
      </main>
    </div>
  );
}
