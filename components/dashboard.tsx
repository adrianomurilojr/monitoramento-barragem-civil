"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Check,
  Download, Gauge, Plus, Settings2, Waves, Zap,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";

const readingTrend = [
  { day: "01 Jun", current: 32, baseline: 28 },
  { day: "05 Jun", current: 42, baseline: 35 },
  { day: "09 Jun", current: 37, baseline: 31 },
  { day: "13 Jun", current: 54, baseline: 40 },
  { day: "17 Jun", current: 48, baseline: 39 },
  { day: "21 Jun", current: 63, baseline: 48 },
  { day: "25 Jun", current: 53, baseline: 45 },
  { day: "29 Jun", current: 72, baseline: 53 },
];

const instruments = [
  { id: "PZ-034", name: "Piezômetro de corda vibrante", location: "Ombreira direita · Cota 312 m", value: "2,48", unit: "m.c.a.", date: "Hoje, 09:42", status: "Normal" },
  { id: "IN-012", name: "Inclinômetro", location: "Galeria de drenagem · Eixo 04", value: "0,18", unit: "mm", date: "Hoje, 09:28", status: "Normal" },
  { id: "MA-008", name: "Marco topográfico", location: "Crista da barragem · Eixo 12", value: "1,24", unit: "mm", date: "Hoje, 08:56", status: "Atenção" },
  { id: "DR-021", name: "Medidor de vazão", location: "Dreno horizontal · Bloco 07", value: "4,82", unit: "L/s", date: "Hoje, 08:30", status: "Normal" },
];

function downloadTrendCsv(rows: typeof readingTrend) {
  const csv = [
    ["Data", "Leituras atuais", "Média histórica"],
    ...rows.map((row) => [row.day, String(row.current), String(row.baseline)]),
  ].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "tendencia-de-leituras.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function PageTitle({ period, onPeriodChange }: { period: number; onPeriodChange: () => void }) {
  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow" style={{ color: "#81979c" }}>{today}</div>
          <h1>Visão geral</h1>
          <p>Acompanhe os principais indicadores da sua barragem.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={onPeriodChange}><CalendarDays size={14} /> Últimos {period} dias</button>
          <Link className="primary-button" href="/readings#nova-leitura" style={{ textDecoration: "none" }}><Plus size={15} /> Nova leitura</Link>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, detail, icon: Icon, trend, warning }: {
  label: string; value: string; detail: string; icon: typeof Waves; trend?: string; warning?: boolean;
}) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span>{label}</span><span className="stat-icon"><Icon size={16} /></span></div>
      <div className="stat-value">{value}</div>
      <div className={`stat-foot ${warning ? "trend-warn" : trend ? "trend-up" : ""}`}>
        {warning ? <ArrowDownRight size={12} /> : trend ? <ArrowUpRight size={12} /> : <Check size={12} />}
        {detail}
      </div>
    </article>
  );
}

export function InstrumentTable({ compact = false }: { compact?: boolean }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>
          <th>INSTRUMENTO</th><th>LOCALIZAÇÃO</th><th>ÚLTIMA LEITURA</th><th>DATA / HORA</th><th>STATUS</th>
        </tr></thead>
        <tbody>
          {(compact ? instruments.slice(0, 4) : instruments).map((item) => (
            <tr key={item.id}>
              <td className="instrument-id">{item.id}<br /><span style={{ color: "#94a3a7", fontSize: 9, fontWeight: 400 }}>{item.name}</span></td>
              <td>{item.location}</td>
              <td><strong style={{ color: "#304a53" }}>{item.value}</strong> {item.unit}</td>
              <td>{item.date}</td>
              <td><span className={`status-pill ${item.status === "Atenção" ? "warning" : ""}`}>{item.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const [notice, setNotice] = useState("");
  const [period, setPeriod] = useState(30);
  const visibleTrend = period === 7 ? readingTrend.slice(-3) : period === 30 ? readingTrend.slice(-6) : readingTrend;
  return (
    <AppShell>
      <PageTitle period={period} onPeriodChange={() => setPeriod((current) => current === 7 ? 30 : current === 30 ? 90 : 7)} />
      <section className="stats-grid">
        <StatCard label="Instrumentos ativos" value="128" detail="+4 adicionados este mês" icon={Settings2} trend="up" />
        <StatCard label="Leituras realizadas" value="1.284" detail="94% da programação mensal" icon={Activity} trend="up" />
        <StatCard label="Saúde estrutural" value="82%" detail="Dentro dos parâmetros esperados" icon={Gauge} />
        <StatCard label="Alertas em aberto" value="03" detail="1 requer atenção prioritária" icon={Zap} warning />
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div><h2>Tendência de leituras</h2><p>Comportamento dos instrumentos · Junho 2025</p></div>
            <button className="secondary-button" onClick={() => {
              downloadTrendCsv(visibleTrend);
              setNotice(`CSV do gráfico exportado · últimos ${period} dias.`);
            }}>Exportar CSV <Download size={13} /></button>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleTrend} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9bbce5" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#9bbce5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#29374a" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 9 }} dy={9} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 9 }} />
                <Tooltip contentStyle={{ border: "1px solid #344760", borderRadius: 9, fontSize: 10, backgroundColor: "#172438", color: "#edf2f8", boxShadow: "0 6px 20px #00000040" }} />
                <Area type="monotone" dataKey="current" name="Leituras atuais" stroke="#9bbce5" strokeWidth={2.4} fill="url(#currentFill)" activeDot={{ r: 4, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="baseline" name="Média histórica" stroke="#ff8294" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend"><span><i /> Leituras atuais</span><span><i /> Média histórica</span></div>
        </article>

        <article className="panel">
          <div className="panel-header"><div><h2>Índice de estabilidade</h2><p>Condição geral da estrutura</p></div><Waves size={17} color="#9bbce5" /></div>
          <div className="health-score">
            <div className="health-ring"><div className="health-ring-inner"><strong>82%</strong><span>Índice geral</span></div></div>
            <div className="health-caption"><span className="status-pill">Condição estável</span></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eff3f2", paddingTop: 13, color: "#82959a", fontSize: 9 }}>
            <span>Atualizado hoje às 09:42</span><span style={{ color: "#16804a", fontWeight: 700 }}>+2,4% este mês</span>
          </div>
        </article>
      </section>

      <article className="panel table-panel">
        <div className="panel-header">
          <div><h2>Leituras recentes</h2><p>Últimas medições dos instrumentos monitorados</p></div>
          <a href="/readings" className="text-button" style={{ textDecoration: "none" }}>Ver todas →</a>
        </div>
        <InstrumentTable compact />
      </article>
      {notice && <div className="toast" role="status" onClick={() => setNotice("")}>{notice} · Fechar</div>}
    </AppShell>
  );
}
