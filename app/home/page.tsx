"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ClipboardList,
  FileBarChart,
  Gauge,
  LayoutDashboard,
  LogOut,
  Settings2,
  Waves,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const destinations = [
  { title: "Dashboard", description: "Resumo da operação", href: "/dashboard", icon: LayoutDashboard, tone: "blue" },
  { title: "Instrumentos", description: "Cadastro e programação", href: "/instruments", icon: Settings2, tone: "green" },
  { title: "Leituras", description: "Registrar e consultar", href: "/readings", icon: Activity, tone: "red" },
  { title: "Gráficos", description: "Tendências e medições", href: "/charts", icon: FileBarChart, tone: "blue" },
  { title: "Relatórios", description: "Exportar dados", href: "/reports", icon: ClipboardList, tone: "red" },
  { title: "Indicadores", description: "Limites e alertas", href: "/indicators", icon: Gauge, tone: "green" },
];

export default function HomePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("hydroguard-session");
    if (!session) {
      router.replace("/login");
      return;
    }
    setUserEmail(session);
    setReady(true);
  }, [router]);

  function signOut() {
    localStorage.removeItem("hydroguard-session");
    router.replace("/login");
  }

  if (!ready) {
    return <main className="home-loading" aria-label="Carregando página inicial"><Waves size={28} /></main>;
  }

  return (
    <main className="home-page">
      <div className="home-backdrop" />
      <header className="home-header">
        <Link href="/home" className="home-brand">
          <span className="home-brand-mark"><Waves size={21} /></span>
          <span>monibarragem</span>
        </Link>
        <div className="home-user">
          <span className="home-user-name">{userEmail}</span>
          <span className="home-avatar">{userEmail.slice(0, 1).toUpperCase()}</span>
          <ThemeToggle compact />
          <button type="button" className="home-logout" onClick={signOut} aria-label="Sair da conta" title="Sair da conta">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <section className="home-content">
        <div className="home-intro">
          <div className="home-eyebrow"><span className="pulse-dot home-green-dot" /> COMPLEXO HIDRELÉTRICO · UHE XINGÓ</div>
          <h1>Centro de monitoramento</h1>
          <p>Escolha uma área para acompanhar a segurança e a operação da barragem.</p>
        </div>

        <nav className="home-destinations" aria-label="Áreas de monitoramento">
          {destinations.map(({ title, description, href, icon: Icon, tone }, index) => (
            <Link
              className={`home-tile home-tile-${tone}`}
              href={href}
              key={href}
              style={{ "--tile-index": index } as React.CSSProperties}
            >
              <span className="home-tile-icon"><Icon size={25} strokeWidth={1.7} /></span>
              <span className="home-tile-copy">
                <strong>{title}</strong>
                <small>{description}</small>
              </span>
              <ArrowRight className="home-tile-arrow" size={17} />
            </Link>
          ))}
        </nav>

        <footer className="home-footer">
          <span><span className="home-green-indicator" /> Sistema operacional</span>
          <span>Monitoramento integrado · 24 horas</span>
        </footer>
      </section>

      <div className="home-photo-credit">
        <ArrowDownRight size={13} /> Usina Hidrelétrica de Xingó · Rio São Francisco
      </div>
    </main>
  );
}
