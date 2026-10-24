"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownToLine, CalendarDays, Check, CircleAlert, ClipboardCheck,
  FileBarChart, FileText, Gauge, ImagePlus, Plus, Search, Settings2, SlidersHorizontal,
  RotateCw, Waves,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { InstrumentViewer } from "@/components/instrument-viewer";

const initialInstruments = [
  { id: "PZ-034", type: "Piezômetro de corda vibrante", location: "Ombreira direita · Cota 312 m", date: "25/06/2025", status: "Normal" },
  { id: "IN-012", type: "Inclinômetro", location: "Galeria de drenagem · Eixo 04", date: "25/06/2025", status: "Normal" },
  { id: "MA-008", type: "Marco topográfico", location: "Crista da barragem · Eixo 12", date: "25/06/2025", status: "Atenção" },
  { id: "DR-021", type: "Medidor de vazão", location: "Dreno horizontal · Bloco 07", date: "24/06/2025", status: "Normal" },
];

const readings = [
  { id: "PZ-034", type: "Piezômetro", value: "2,48", unit: "m.c.a.", date: "25/06/2025", time: "09:42", author: "Marina Costa", status: "Normal" },
  { id: "IN-012", type: "Inclinômetro", value: "0,18", unit: "mm", date: "25/06/2025", time: "09:28", author: "Marina Costa", status: "Normal" },
  { id: "MA-008", type: "Marco topográfico", value: "1,24", unit: "mm", date: "25/06/2025", time: "08:56", author: "Paulo Mendes", status: "Atenção" },
  { id: "DR-021", type: "Medidor de vazão", value: "4,82", unit: "L/s", date: "25/06/2025", time: "08:30", author: "Paulo Mendes", status: "Normal" },
  { id: "PZ-034", type: "Piezômetro", value: "2,44", unit: "m.c.a.", date: "24/06/2025", time: "16:12", author: "Marina Costa", status: "Normal" },
];

type ReadingRecord = (typeof readings)[number] & {
  photos?: { name: string; url: string }[];
};

const chartData = [
  { date: "01 Jun", piezo: 2.22, vazao: 3.8, inclinometro: 0.11 },
  { date: "05 Jun", piezo: 2.29, vazao: 4.1, inclinometro: 0.13 },
  { date: "09 Jun", piezo: 2.31, vazao: 4.0, inclinometro: 0.12 },
  { date: "13 Jun", piezo: 2.36, vazao: 4.4, inclinometro: 0.15 },
  { date: "17 Jun", piezo: 2.32, vazao: 4.2, inclinometro: 0.14 },
  { date: "21 Jun", piezo: 2.41, vazao: 4.6, inclinometro: 0.17 },
  { date: "25 Jun", piezo: 2.48, vazao: 4.82, inclinometro: 0.18 },
];

const chartSeries: Record<string, { key: "piezo" | "vazao" | "inclinometro"; unit: string; label: string; color: string }> = {
  "Piezômetro · PZ-034": { key: "piezo", unit: "m.c.a.", label: "Nível piezométrico", color: "#9bbce5" },
  "Medidor de vazão · DR-021": { key: "vazao", unit: "L/s", label: "Vazão de drenagem", color: "#ff8294" },
  "Inclinômetro · IN-012": { key: "inclinometro", unit: "mm", label: "Deslocamento horizontal", color: "#58d295" },
};

function Heading({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div><h1>{title}</h1><p>{description}</p></div>
      {action && <div className="heading-actions">{action}</div>}
    </div>
  );
}

function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  if (!text) return null;
  return <button className="toast" role="status" onClick={onClose} style={{ border: 0, cursor: "pointer" }}>{text} · Fechar</button>;
}

function PagePanelHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return <div className="panel-header"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div></div>;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function InstrumentsPage() {
  const [items, setItems] = useState(initialInstruments);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState("");

  function addInstrument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("code") ?? "").trim().toUpperCase();
    const type = String(form.get("type") ?? "").trim();
    const location = String(form.get("location") ?? "").trim();
    const date = String(form.get("date") ?? "");
    if (!id || !type || !location || !date) {
      setNotice("Preencha todos os campos para cadastrar o instrumento.");
      return;
    }
    if (items.some((item) => item.id === id)) {
      setNotice("Já existe um instrumento cadastrado com esse código.");
      return;
    }
    setItems([{ id, type, location, date: new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR"), status: "Normal" }, ...items]);
    event.currentTarget.reset();
    setNotice(`Instrumento ${id} cadastrado com sucesso.`);
  }

  const filtered = items.filter((item) => `${item.id} ${item.type} ${item.location}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <AppShell>
      <Heading title="Instrumentos de barragem" description="Cadastre equipamentos e acompanhe sua programação de leituras." />
      <div className="page-content-grid">
        <section className="panel">
          <PagePanelHeading title="Instrumentos cadastrados" subtitle={`${items.length} instrumentos no sistema · Busque por código, tipo ou localização`} />
          <div className="filters-row">
            <div className="search-control"><Search size={15} /><input aria-label="Buscar instrumentos" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar instrumento..." /></div>
            <button className="secondary-button" onClick={() => setSearch("")}><SlidersHorizontal size={14} /> Limpar filtros</button>
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead><tr><th>CÓDIGO / TIPO</th><th>LOCALIZAÇÃO</th><th>PRÓXIMA LEITURA</th><th>STATUS</th></tr></thead>
              <tbody>{filtered.map((item) => <tr key={item.id}>
                <td className="instrument-id">{item.id}<br /><span style={{ color: "#94a3a7", fontSize: 9, fontWeight: 400 }}>{item.type}</span></td>
                <td>{item.location}</td><td>{item.date}</td><td><span className={`status-pill ${item.status === "Atenção" ? "warning" : ""}`}>{item.status}</span></td>
              </tr>)}</tbody>
              {filtered.length === 0 && <tbody><tr><td colSpan={4} style={{ textAlign: "center", padding: 24 }}>Nenhum instrumento encontrado.</td></tr></tbody>}
            </table>
          </div>
        </section>

        <section className="panel">
          <PagePanelHeading title="Cadastrar instrumento" subtitle="Adicione um equipamento ao monitoramento" />
          <form onSubmit={addInstrument}>
            <div className="form-field"><label htmlFor="instrument-code">Código de identificação</label><input className="form-control" id="instrument-code" name="code" placeholder="Ex.: PZ-035" /></div>
            <div className="form-field"><label htmlFor="instrument-type">Tipo de instrumento</label>
              <select className="form-control" id="instrument-type" name="type" defaultValue=""><option value="" disabled>Selecione o tipo</option><option>Piezômetro</option><option>Piezômetro de corda vibrante</option><option>Inclinômetro</option><option>Marco topográfico</option><option>Medidor de vazão</option><option>Extensômetro</option></select>
            </div>
            <div className="form-field"><label htmlFor="instrument-location">Localização</label><input className="form-control" id="instrument-location" name="location" placeholder="Ex.: Galeria · Eixo 04" /></div>
            <div className="form-field"><label htmlFor="instrument-date">Data da próxima leitura</label><input className="form-control" id="instrument-date" name="date" type="date" /></div>
            <div className="form-field"><label htmlFor="instrument-frequency">Frequência de leitura</label><select className="form-control" id="instrument-frequency" name="frequency" defaultValue="Diária"><option>Diária</option><option>Semanal</option><option>Quinzenal</option><option>Mensal</option></select></div>
            <div className="form-actions"><button className="primary-button" type="submit"><Plus size={14} /> Cadastrar instrumento</button></div>
          </form>
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <PagePanelHeading title="Programação de leituras" subtitle="Datas programadas para os próximos dias" />
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          {[["Hoje · 25 jun", "12 leituras programadas"], ["Amanhã · 26 jun", "8 leituras programadas"], ["Sexta · 27 jun", "16 leituras programadas"]].map(([date, count]) =>
            <button
              className={`report-card schedule-card ${selectedSchedule === date ? "selected" : ""}`}
              type="button"
              key={date}
              aria-pressed={selectedSchedule === date}
              onClick={() => {
                setSelectedSchedule(date);
                setNotice(`${count} selecionadas para ${date.toLowerCase()}.`);
              }}
            >
              <span className="report-icon"><CalendarDays size={17} /></span><span className="schedule-copy"><strong>{date}</strong><span>{count}</span></span>
            </button>)}
        </div>
      </section>
      <Toast text={notice} onClose={() => setNotice("")} />
    </AppShell>
  );
}

export function ReadingsPage() {
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [readingItems, setReadingItems] = useState<ReadingRecord[]>(readings);
  const [photos, setPhotos] = useState<{ name: string; url: string }[]>([]);
  const objectUrls = useRef(new Set<string>());
  const filtered = useMemo(() => readingItems.filter((item) => `${item.id} ${item.type} ${item.author}`.toLowerCase().includes(search.toLowerCase())), [readingItems, search]);

  useEffect(() => () => {
    objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrls.current.clear();
  }, []);

  function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const oversized = imageFiles.find((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setNotice(`A imagem "${oversized.name}" excede o limite de 5 MB.`);
      event.currentTarget.value = "";
      return;
    }
    if (imageFiles.length !== files.length) {
      setNotice("Selecione somente arquivos de imagem.");
    }
    const available = Math.max(0, 5 - photos.length);
    const selected = imageFiles.slice(0, available).map((file) => {
      const url = URL.createObjectURL(file);
      objectUrls.current.add(url);
      return { name: file.name, url };
    });
    if (imageFiles.length > available) setNotice("É possível anexar até 5 fotos por leitura.");
    setPhotos((current) => [...current, ...selected]);
    event.currentTarget.value = "";
  }

  function saveReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = String(form.get("instrument") ?? "");
    const value = String(form.get("value") ?? "").trim();
    const date = String(form.get("readingDate") ?? "");
    if (!id || !value || !date) {
      setNotice("Selecione o instrumento e preencha o valor e a data da leitura.");
      return;
    }
    const selected = readings.find((item) => item.id === id) ?? readings[0];
    setReadingItems((current) => [{
      id,
      type: selected.type,
      value,
      unit: selected.unit,
      date: new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR"),
      time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      author: "Operador atual",
      status: "Normal",
      photos,
    }, ...current]);
    setPhotos([]);
    event.currentTarget.reset();
    setNotice(`Leitura ${id} salva com ${photos.length} foto(s).`);
  }

  return (
    <AppShell>
      <Heading title="Leituras de instrumentos" description="Histórico das medições realizadas e registro de novas leituras."
        action={<a className="primary-button" href="#nova-leitura" style={{ textDecoration: "none" }}><Plus size={15} /> Registrar leitura</a>} />
      <section className="kpi-grid">
        <div className="kpi-card"><span>Leituras hoje</span><strong>36</strong></div>
        <div className="kpi-card"><span>Programadas hoje</span><strong>42</strong></div>
        <div className="kpi-card"><span>Conformidade</span><strong style={{ color: "#16804a" }}>85,7%</strong></div>
      </section>
      <InstrumentViewer />
      <section className="panel" id="nova-leitura" style={{ margin: "16px 0" }}>
        <PagePanelHeading title="Registrar nova leitura" subtitle="Informe a medição e anexe fotos para documentar o instrumento no local" />
        <form onSubmit={saveReading}>
          <div className="form-grid">
            <div className="form-field"><label htmlFor="reading-instrument">Instrumento</label>
              <select className="form-control" name="instrument" id="reading-instrument" defaultValue=""><option value="" disabled>Selecione o instrumento</option>{readings.map((item) => <option key={item.id} value={item.id}>{item.id} · {item.type}</option>)}</select>
            </div>
            <div className="form-field"><label htmlFor="reading-value">Valor medido</label><input className="form-control" name="value" id="reading-value" inputMode="decimal" placeholder="Ex.: 2,48" /></div>
            <div className="form-field"><label htmlFor="reading-date">Data da leitura</label><input className="form-control" name="readingDate" id="reading-date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></div>
            <div className="form-field"><label htmlFor="reading-notes">Observações</label><input className="form-control" name="notes" id="reading-notes" placeholder="Observações sobre a coleta (opcional)" /></div>
          </div>
          <div className="form-field" style={{ marginTop: 8 }}>
            <label htmlFor="reading-photos">Fotos do instrumento (até 5 imagens, 5 MB cada)</label>
            <label className="photo-dropzone" htmlFor="reading-photos">
              <span className="photo-upload-icon"><ImagePlus size={20} /></span>
              <span><strong>Adicionar fotos do instrumento</strong><small>JPG, PNG ou outro formato de imagem. Clique para selecionar.</small></span>
              <input id="reading-photos" type="file" accept="image/*" multiple onChange={addPhotos} />
            </label>
          </div>
          {photos.length > 0 && <div className="photo-preview-list" aria-label="Fotos selecionadas">
            {photos.map((photo, index) => <div className="photo-preview" key={`${photo.name}-${index}`}>
              <img src={photo.url} alt={`Prévia da foto ${photo.name}`} />
              <span title={photo.name}>{photo.name}</span>
              <button type="button" className="photo-remove" aria-label={`Remover foto ${photo.name}`} onClick={() => {
                URL.revokeObjectURL(photo.url);
                objectUrls.current.delete(photo.url);
                setPhotos((current) => current.filter((_, itemIndex) => itemIndex !== index));
              }}>×</button>
            </div>)}
          </div>}
          <div className="form-actions"><button className="primary-button" type="submit"><Check size={14} /> Salvar leitura</button></div>
        </form>
      </section>
      <section className="panel table-panel">
        <div className="panel-header"><div><h2>Histórico de leituras</h2><p>As medições mais recentes registradas no sistema</p></div><button className="secondary-button" onClick={() => setNotice("Filtro de período selecionado: últimos 30 dias.")}><CalendarDays size={14} /> Últimos 30 dias</button></div>
        <div className="filters-row" style={{ padding: "0 18px" }}>
          <div className="search-control"><Search size={15} /><input aria-label="Buscar leituras" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por instrumento ou responsável..." /></div>
          <button
            className="secondary-button"
            onClick={() => {
              downloadCsv("leituras-monibarragem.csv", [
                ["Instrumento", "Tipo", "Valor", "Unidade", "Data", "Hora", "Responsável", "Fotos", "Status"],
                ...filtered.map((item) => [
                  item.id,
                  item.type,
                  item.value,
                  item.unit,
                  item.date,
                  item.time,
                  item.author,
                  (item.photos ?? []).map((photo) => photo.name).join(", "),
                  item.status,
                ]),
              ]);
              setNotice(`${filtered.length} leituras exportadas para CSV.`);
            }}
          ><ArrowDownToLine size={14} /> Exportar CSV</button>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>INSTRUMENTO</th><th>VALOR MEDIDO</th><th>DATA / HORA</th><th>RESPONSÁVEL</th><th>FOTOS</th><th>STATUS</th></tr></thead>
            <tbody>{filtered.map((item, index) => <tr key={`${item.id}-${item.date}-${index}`}>
              <td className="instrument-id">{item.id}<br /><span style={{ color: "#94a3a7", fontSize: 9, fontWeight: 400 }}>{item.type}</span></td>
              <td><strong style={{ color: "#304a53" }}>{item.value}</strong> {item.unit}</td><td>{item.date} · {item.time}</td><td>{item.author}</td>
              <td>{item.photos?.length ? <div className="table-photo-stack" aria-label={`${item.photos.length} fotos anexadas`}>
                {item.photos.slice(0, 3).map((photo) => <img key={photo.url} src={photo.url} alt={`Foto do instrumento ${item.id}: ${photo.name}`} />)}
                {item.photos.length > 3 && <span>+{item.photos.length - 3}</span>}
              </div> : <span style={{ color: "#a0afb2" }}>—</span>}</td>
              <td><span className={`status-pill ${item.status === "Atenção" ? "warning" : ""}`}>{item.status}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>
      <Toast text={notice} onClose={() => setNotice("")} />
    </AppShell>
  );
}

export function ChartsPage() {
  const [selected, setSelected] = useState("Piezômetro · PZ-034");
  const [period, setPeriod] = useState(30);
  const series = chartSeries[selected] ?? chartSeries["Piezômetro · PZ-034"];
  const visibleData = period === 7 ? chartData.slice(-2) : period === 30 ? chartData.slice(-5) : chartData;
  const values = visibleData.map((entry) => entry[series.key]);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variation = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  return (
    <AppShell>
      <Heading title="Gráficos de monitoramento" description="Visualize tendências e compare medições ao longo do tempo."
        action={<span className="select-control"><CalendarDays size={14} /> Junho de 2025 · dados demonstrativos</span>} />
      <div className="filters-row">
        <label className="filter-label">Instrumento
          <select className="select-control" value={selected} onChange={(event) => setSelected(event.target.value)}><option>Piezômetro · PZ-034</option><option>Medidor de vazão · DR-021</option><option>Inclinômetro · IN-012</option></select>
        </label>
        <label className="filter-label">Período
          <select className="select-control" value={period} onChange={(event) => setPeriod(Number(event.target.value))}>
            <option value={7}>Últimos 7 dias</option><option value={30}>Últimos 30 dias</option><option value={90}>Últimos 90 dias</option>
          </select>
        </label>
      </div>
      <section className="panel" style={{ marginBottom: 16 }}>
        <PagePanelHeading title={`Variação de leitura · ${selected}`} subtitle={`${series.label} · últimos ${period} dias (série demonstrativa)`} />
        <div className="chart-wrap" style={{ height: 310 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={visibleData} margin={{ top: 15, right: 15, left: -15, bottom: 4 }}>
              <defs><linearGradient id="readingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={series.color} stopOpacity={0.19} /><stop offset="100%" stopColor={series.color} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="#29374a" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 10 }} dy={9} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 10 }} />
              <Tooltip contentStyle={{ border: "1px solid #344760", borderRadius: 9, fontSize: 10, backgroundColor: "#172438", color: "#edf2f8" }} />
              <Area type="monotone" dataKey={series.key} name={`${series.label} (${series.unit})`} stroke={series.color} strokeWidth={2.5} fill="url(#readingFill)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <div className="kpi-grid">
        <div className="kpi-card"><span>Última leitura</span><strong>{values[values.length - 1].toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <small style={{ fontSize: 11, color: "#87999e" }}>{series.unit}</small></strong></div>
        <div className="kpi-card"><span>Média do período</span><strong>{average.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} <small style={{ fontSize: 11, color: "#87999e" }}>{series.unit}</small></strong></div>
        <div className="kpi-card"><span>Variação no período</span><strong style={{ color: variation >= 0 ? "#58d295" : "#ff8294" }}>{variation >= 0 ? "+" : ""}{variation.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</strong></div>
      </div>
    </AppShell>
  );
}

export function ReportsPage() {
  const [notice, setNotice] = useState("");
  const [reports, setReports] = useState<{ id: string; title: string; meta: string; type: string }[]>([
    { id: "monthly-readings", title: "Relatório mensal de leituras", meta: "Junho 2025 · 128 instrumentos · Atualizado hoje", type: "CSV" },
    { id: "safety-inspection", title: "Inspeção de segurança regular", meta: "Relatório técnico · 12 de junho de 2025", type: "CSV" },
    { id: "alert-history", title: "Histórico de alertas", meta: "Últimos 90 dias · 8 ocorrências registradas", type: "CSV" },
  ]);
  function generateReport() {
    const now = new Date();
    const title = `Resumo de monitoramento · ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(now)}`;
    const report = { id: `generated-${now.getTime()}`, title, meta: `Gerado agora · ${readings.length} medições de exemplo`, type: "CSV" };
    setReports((current) => [report, ...current]);
    downloadCsv("resumo-monitoramento.csv", [
      ["Instrumento", "Tipo", "Valor", "Unidade", "Data", "Responsável", "Status"],
      ...readings.map((reading) => [reading.id, reading.type, reading.value, reading.unit, reading.date, reading.author, reading.status]),
    ]);
    setNotice("Relatório CSV gerado e baixado. Os dados são demonstrativos.");
  }

  return (
    <AppShell>
      <Heading title="Relatórios" description="Acesse relatórios técnicos e exporte dados do monitoramento."
        action={<button className="primary-button" onClick={generateReport}><Plus size={15} /> Gerar relatório CSV</button>} />
      <section className="kpi-grid">
        <div className="kpi-card"><span>Relatórios disponíveis</span><strong>{reports.length}</strong></div>
        <div className="kpi-card"><span>Última atualização</span><strong style={{ fontSize: 17 }}>Hoje, 09:42</strong></div>
        <div className="kpi-card"><span>Agendamento</span><strong style={{ fontSize: 17, color: "#16804a" }}>Ativo</strong></div>
      </section>
      <section className="panel">
        <PagePanelHeading title="Relatórios recentes" subtitle="Documentos disponíveis para consulta e exportação" />
        <div style={{ display: "grid", gap: 10 }}>
          {reports.map(({ id, title, meta, type }) => <div className="report-card" key={id}>
            <div className="report-icon"><FileText size={18} /></div>
            <div style={{ flex: 1 }}><strong>{title}</strong><span>{meta}</span></div>
            <span className="status-pill neutral" style={{ marginRight: 6 }}>{type}</span>
            <button className="icon-button" aria-label={`Baixar ${title}`} onClick={() => {
              downloadCsv("relatorio-monibarragem.csv", [
                ["Relatório", title],
                ["Descrição", meta],
                ["Data de exportação", new Date().toLocaleString("pt-BR")],
                [],
                ["Instrumento", "Tipo", "Valor", "Unidade", "Data", "Responsável", "Status"],
                ...readings.map((reading) => [reading.id, reading.type, reading.value, reading.unit, reading.date, reading.author, reading.status]),
              ]);
              setNotice(`CSV do relatório "${title}" baixado.`);
            }}><ArrowDownToLine size={15} /></button>
          </div>)}
        </div>
      </section>
      <section className="panel" style={{ marginTop: 16 }}>
        <PagePanelHeading title="Programação de relatórios" />
        <div className="report-card"><div className="report-icon"><CalendarDays size={18} /></div><div style={{ flex: 1 }}><strong>Resumo mensal de monitoramento</strong><span>Gerado automaticamente no primeiro dia de cada mês</span></div><span className="status-pill">Ativo</span></div>
      </section>
      <Toast text={notice} onClose={() => setNotice("")} />
    </AppShell>
  );
}

export function IndicatorsPage() {
  const [notice, setNotice] = useState("");
  const [updatedAt, setUpdatedAt] = useState("há 2 min");
  const [selectedAlert, setSelectedAlert] = useState("");
  const indicators = [
    { name: "Nível piezométrico", current: "2,48 m.c.a.", reference: "Limite de atenção: 3,20 m.c.a.", percentage: 66, tone: "#9bbce5" },
    { name: "Vazão de drenagem", current: "4,82 L/s", reference: "Limite de atenção: 8,00 L/s", percentage: 60, tone: "#9bbce5" },
    { name: "Deslocamento horizontal", current: "1,24 mm", reference: "Limite de atenção: 1,50 mm", percentage: 83, tone: "#ff8294" },
  ];
  const alerts = [
    ["Atenção · MA-008", "Deslocamento próximo ao limite de alerta", "Hoje · 08:56"],
    ["Leitura pendente · PZ-019", "Aguardando coleta programada", "Hoje · 08:00"],
    ["Revisão · DR-014", "Verificar variação de vazão", "Ontem · 16:40"],
  ];
  return (
    <AppShell>
      <Heading title="Indicadores de leitura" description="Acompanhe limites, condições de alerta e a saúde da estrutura." action={
        <button className="secondary-button" onClick={() => {
          const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date());
          setUpdatedAt(`agora · ${time}`);
          setNotice("Indicadores de demonstração atualizados nesta tela.");
        }}><RotateCw size={14} /> Atualizar indicadores</button>
      } />
      <div className="indicator-update"><span className="pulse-dot" style={{ width: 6, height: 6 }} /> Atualização {updatedAt} · dados demonstrativos</div>
      <section className="stats-grid">
        <div className="stat-card"><div className="stat-top"><span>Condição geral</span><span className="stat-icon"><Waves size={16} /></span></div><div className="stat-value">Estável</div><div className="stat-foot trend-up"><Check size={12} /> Sem alterações críticas</div></div>
        <div className="stat-card"><div className="stat-top"><span>Dentro dos limites</span><span className="stat-icon"><Gauge size={16} /></span></div><div className="stat-value">96,8%</div><div className="stat-foot trend-up"><Check size={12} /> 124 de 128 instrumentos</div></div>
        <div className="stat-card"><div className="stat-top"><span>Alertas ativos</span><span className="stat-icon" style={{ background: "#311923", color: "#ff8294" }}><CircleAlert size={16} /></span></div><div className="stat-value">03</div><div className="stat-foot trend-warn"><CircleAlert size={12} /> 1 atenção prioritária</div></div>
        <div className="stat-card"><div className="stat-top"><span>Leituras no prazo</span><span className="stat-icon"><ClipboardCheck size={16} /></span></div><div className="stat-value">85,7%</div><div className="stat-foot">36 de 42 realizadas hoje</div></div>
      </section>
      <div className="page-content-grid">
        <section className="panel">
          <PagePanelHeading title="Indicadores de segurança" subtitle="Leitura atual comparada com os limites operacionais definidos" />
          <div style={{ display: "grid", gap: 22, paddingTop: 8 }}>
            {indicators.map((item) => <div key={item.name}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <strong className="indicator-name" style={{ fontSize: 11 }}>{item.name}</strong><strong className="indicator-reading" style={{ fontSize: 11 }}>{item.current}</strong>
              </div>
              <div style={{ height: 7, borderRadius: 99, overflow: "hidden", background: "#29374a" }}>
                <div style={{ width: `${item.percentage}%`, height: "100%", borderRadius: 99, background: item.tone, transition: "width 700ms ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, color: "#9aa8ba", fontSize: 9 }}><span>{item.reference}</span><span>{item.percentage}% do limite</span></div>
            </div>)}
          </div>
        </section>
        <section className="panel">
          <PagePanelHeading title="Alertas recentes" subtitle="Ocorrências que precisam de acompanhamento" />
          <div className="activity-list">
            {alerts.map(([title, detail, time]) =>
              <button className={`activity-item alert-item ${selectedAlert === title ? "expanded" : ""}`} type="button" key={title} aria-expanded={selectedAlert === title} onClick={() => setSelectedAlert((current) => current === title ? "" : title)}>
                <span className="activity-icon alert-icon"><CircleAlert size={14} /></span>
                <span className="alert-copy"><strong>{title}</strong><span>{detail}</span><span>{time}</span>
                  {selectedAlert === title && <span className="alert-detail">Ocorrência demonstrativa. Verifique a leitura e siga o procedimento técnico da usina.</span>}
                </span>
              </button>)}
          </div>
        </section>
      </div>
      <section className="panel" style={{ marginTop: 16 }}>
        <PagePanelHeading title="Evolução dos indicadores" subtitle="Variação do nível piezométrico · Junho de 2025" />
        <div className="chart-wrap" style={{ height: 235 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#29374a" strokeDasharray="3 5" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 9 }} dy={9} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9aa8ba", fontSize: 9 }} domain={[2, 3.4]} />
              <Tooltip contentStyle={{ border: "1px solid #344760", borderRadius: 9, fontSize: 10, backgroundColor: "#172438", color: "#edf2f8" }} />
              <Line type="monotone" dataKey="piezo" name="Nível piezométrico (m.c.a.)" stroke="#9bbce5" strokeWidth={2.5} dot={{ r: 3, fill: "#9bbce5", strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <Toast text={notice} onClose={() => setNotice("")} />
    </AppShell>
  );
}
