"use client";

import { PointerEvent, useRef, useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";

export function InstrumentViewer() {
  const [rotation, setRotation] = useState(0);
  const dragOrigin = useRef<{ x: number; rotation: number } | null>(null);

  function startDrag(event: PointerEvent<HTMLDivElement>) {
    dragOrigin.current = { x: event.clientX, rotation };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current) return;
    const delta = event.clientX - dragOrigin.current.x;
    setRotation(dragOrigin.current.rotation + delta * 1.2);
  }

  function stopDrag() {
    dragOrigin.current = null;
  }

  return (
    <section className="panel instrument-viewer-panel" aria-label="Visualização 3D do piezômetro">
      <div className="panel-header">
        <div><h2>Visualização 3D do instrumento</h2><p>Arraste o equipamento ou use os controles para girar 360°.</p></div>
        <span className="status-pill neutral">PZ-034</span>
      </div>
      <div
        className="instrument-stage"
        role="img"
        aria-label={`Modelo 3D interativo de um piezômetro, rotação ${Math.round(((rotation % 360) + 360) % 360)} graus`}
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") setRotation((value) => value - 15);
          if (event.key === "ArrowRight") setRotation((value) => value + 15);
        }}
        tabIndex={0}
      >
        <div className="instrument-model" style={{ transform: `rotateX(-8deg) rotateY(${rotation}deg)` }}>
          <div className="instrument-cable" />
          <div className="instrument-top-cap" />
          <div className="instrument-head">
            <span className="instrument-head-label">HG · 034</span>
            <span className="instrument-head-light" />
          </div>
          <div className="instrument-collar" />
          <div className="instrument-barrel"><span className="instrument-barrel-shine" /><span className="instrument-barrel-mark">PIEZÔMETRO</span></div>
          <div className="instrument-lower-ring" />
          <div className="instrument-probe" />
          <div className="instrument-foot" />
        </div>
        <div className="instrument-shadow" />
        <span className="instrument-rotation-readout">{Math.round(((rotation % 360) + 360) % 360)}°</span>
      </div>
      <div className="instrument-controls">
        <button type="button" className="secondary-button" aria-label="Girar para a esquerda" onClick={() => setRotation((value) => value - 45)}><RotateCcw size={14} /> 45°</button>
        <input
          aria-label="Ângulo de rotação do instrumento"
          type="range"
          min="0"
          max="360"
          value={Math.round(((rotation % 360) + 360) % 360)}
          onChange={(event) => setRotation(Number(event.target.value))}
        />
        <button type="button" className="secondary-button" aria-label="Girar para a direita" onClick={() => setRotation((value) => value + 45)}>45° <RotateCw size={14} /></button>
        <button type="button" className="icon-button" aria-label="Redefinir rotação" onClick={() => setRotation(0)}><RotateCcw size={14} /></button>
      </div>
    </section>
  );
}
