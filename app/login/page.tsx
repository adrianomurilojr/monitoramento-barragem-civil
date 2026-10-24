"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Waves } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      setError("Preencha seu e-mail e sua senha para continuar.");
      return;
    }

    localStorage.setItem("hydroguard-session", email);
    router.push("/home");
  }

  return (
    <main className="login-screen">
      <section className="login-visual">
        <div className="login-brand">
          <span className="brand-lockup">
            <span className="brand-mark"><Waves size={21} /></span>
            monibarragem
          </span>
        </div>
        <div className="login-story">
          <div className="eyebrow"><span className="pulse-dot" /> Plataforma de monitoramento</div>
          <h1>Segurança que flui. Dados que protegem.</h1>
          <p>
            Acompanhe a saúde da sua barragem em tempo real e tome decisões
            mais seguras com inteligência operacional.
          </p>
          <div className="login-metrics">
            <div className="login-metric"><strong>24/7</strong><span>Monitoramento contínuo</span></div>
            <div className="login-metric"><strong>100%</strong><span>Visão integrada</span></div>
            <div className="login-metric"><strong>+Dados</strong><span>Decisões inteligentes</span></div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-card-topline">
            <span className="brand-lockup">
              <span className="brand-mark"><Waves size={20} /></span>
              monibarragem
            </span>
            <ThemeToggle />
          </div>
          <h2>Boas-vindas</h2>
          <p>Acesse sua conta para acompanhar a operação da barragem.</p>
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">E-mail corporativo</label>
            <div className="field-wrap">
              <Mail className="field-icon" size={17} />
              <input id="email" name="email" type="email" autoComplete="username" placeholder="nome@empresa.com" />
            </div>
            <label className="field-label" htmlFor="password">Senha</label>
            <div className="field-wrap">
              <LockKeyhole className="field-icon" size={17} />
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" />
              <button
                type="button"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: 14, border: 0, padding: 0, background: "transparent", color: "#8aa0a7", cursor: "pointer" }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {error && <div className="login-error" role="alert">{error}</div>}
            <div className="login-options">
              <label><input type="checkbox" /> Manter conectado</label>
              <button type="button" className="text-button" onClick={() => setError("Entre em contato com o administrador para redefinir sua senha.")}>
                Esqueceu a senha?
              </button>
            </div>
            <button type="submit" className="primary-button login-submit">
              Entrar na plataforma <ArrowRight size={16} />
            </button>
          </form>
          <div className="login-note">
            Acesso demonstrativo: qualquer e-mail e senha preenchidos permitem entrar.<br />
            Para uso real, conecte este formulário a um serviço de autenticação seguro.
          </div>
        </div>
      </section>
    </main>
  );
}
