"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Plus, Trash2, Save, BookOpenText, Sparkles, CheckCircle2 } from "lucide-react";

// --- TIPOS E ESTADO ---
type Milestone = { id: string; fase: string; acontecimento: string; sentimento: string; };
type Eixo1Data = {
  linhaVida: Milestone[];
  cartaGratidao: string;
  mapaIdentidade: { raizes: string; corpo: string; voz: string; sonhos: string; fe: string; reflexaoFinal: string; };
};
type AppData = {
  participante: { nome: string };
  eixo1: Eixo1Data;
  eixo2?: Record<string, any>; eixo3?: Record<string, any>; eixo4?: Record<string, any>;
  eixo5?: Record<string, any>; eixo6?: Record<string, any>; eixo7?: Record<string, any>; eixo8?: Record<string, any>;
};

const STORAGE_KEY = "afrolumi_plataforma_v1";
const defaultData: AppData = {
  participante: { nome: "" },
  eixo1: {
    linhaVida: [
      { id: crypto.randomUUID(), fase: "Infância", acontecimento: "", sentimento: "" },
      { id: crypto.randomUUID(), fase: "Juventude", acontecimento: "", sentimento: "" },
      { id: crypto.randomUUID(), fase: "Vida adulta", acontecimento: "", sentimento: "" },
    ],
    cartaGratidao: "",
    mapaIdentidade: { raizes: "", corpo: "", voz: "", sonhos: "", fe: "", reflexaoFinal: "" },
  },
};

// --- HOOK LOCALSTORAGE ---
function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : initial; } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(state)); }, [key, state]);
  return [state, setState] as const;
}

// --- UI REUTILIZÁVEL ---
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-semibold tracking-tight text-amber-900">{title}</h2>
      {subtitle && <p className="text-sm text-amber-700/80 mt-1">{subtitle}</p>}
    </div>
  );
}
function HelpNote({ children }: { children: React.ReactNode }) {
  return <div className="text-sm p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">{children}</div>;
}
function Toolbar({ data, setData }: { data: AppData; setData: (d: AppData) => void }) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `afrolumi_${data.participante.nome || "participante"}.json`; a.click(); URL.revokeObjectURL(url);
  };
  const handleImport = () => {
    const inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/json";
    inp.onchange = () => { const file = inp.files?.[0]; if (!file) return;
      file.text().then((txt) => { try { setData(JSON.parse(txt)); } catch { alert("Arquivo inválido"); } });
    };
    inp.click();
  };
  const handleReset = () => { if (confirm("Tem certeza que deseja limpar os dados deste dispositivo?")) setData({ ...defaultData }); };
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Button onClick={handleExport} variant="secondary" className="gap-2"><Download className="h-4 w-4"/>Exportar JSON</Button>
      <Button onClick={handleImport} variant="secondary" className="gap-2"><Upload className="h-4 w-4"/>Importar JSON</Button>
      <Button onClick={handleReset} variant="outline" className="gap-2"><Trash2 className="h-4 w-4"/>Limpar</Button>
    </div>
  );
}
function ProgressEixo1({ data }: { data: Eixo1Data }) {
  const totalFields = 3 + data.linhaVida.length * 2 + 5;
  const filled =
    (data.cartaGratidao ? 1 : 0) +
    (data.mapaIdentidade.reflexaoFinal ? 1 : 0) +
    (data.mapaIdentidade.raizes ? 1 : 0) +
    (data.mapaIdentidade.corpo ? 1 : 0) +
    (data.mapaIdentidade.voz ? 1 : 0) +
    (data.mapaIdentidade.sonhos ? 1 : 0) +
    (data.mapaIdentidade.fe ? 1 : 0) +
    data.linhaVida.reduce((acc, m) => acc + (m.acontecimento ? 1 : 0) + (m.sentimento ? 1 : 0), 0);
  const value = Math.min(100, Math.round((filled / totalFields) * 100));
  return (
    <div className="space-y-1 w-full">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-amber-900">Progresso do Eixo 1</span>
        <Badge variant="secondary" className="bg-amber-100 text-amber-900">{value}%</Badge>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
function LinhaDeVida({ data, onChange }: { data: Milestone[]; onChange: (list: Milestone[]) => void }) {
  const add = () => onChange([...data, { id: crypto.randomUUID(), fase: "", acontecimento: "", sentimento: "" }]);
  const remove = (id: string) => onChange(data.filter(m => m.id !== id));
  const edit = (id: string, patch: Partial<Milestone>) => onChange(data.map(m => m.id === id ? { ...m, ...patch } : m));
  return (
    <div className="space-y-3">
      {data.map((m) => (
        <Card key={m.id} className="border-amber-200/60 shadow-sm">
          <CardContent className="p-4 grid md:grid-cols-12 gap-3">
            <div className="md:col-span-3">
              <label className="text-xs text-amber-800">Fase</label>
              <Input value={m.fase} onChange={(e) => edit(m.id, { fase: e.target.value })} placeholder="Infância / Juventude / Vida adulta..." />
            </div>
            <div className="md:col-span-5">
              <label className="text-xs text-amber-800">O que aconteceu</label>
              <Input value={m.acontecimento} onChange={(e) => edit(m.id, { acontecimento: e.target.value })} placeholder="Ex.: Mudei de cidade, entrei na faculdade..." />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs text-amber-800">Como me senti</label>
              <Input value={m.sentimento} onChange={(e) => edit(m.id, { sentimento: e.target.value })} placeholder="Ex.: medo, coragem, esperança..." />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button variant="outline" onClick={() => remove(m.id)} className="w-full" title="Remover"><Trash2 className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={add} className="gap-2 bg-amber-900 hover:bg-amber-800"><Plus className="h-4 w-4"/>Adicionar etapa</Button>
    </div>
  );
}
function MapaIdentidade({ value, onChange }: { value: Eixo1Data["mapaIdentidade"]; onChange: (v: Eixo1Data["mapaIdentidade"]) => void }) {
  const edit = (patch: Partial<Eixo1Data["mapaIdentidade"]>) => onChange({ ...value, ...patch });
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium text-amber-900">Raízes 🌿</label>
        <Textarea rows={5} value={value.raizes} onChange={(e) => edit({ raizes: e.target.value })} placeholder="De onde venho e o que herdei"/>
      </div>
      <div>
        <label className="text-sm font-medium text-amber-900">Corpo e Aparência 🌸</label>
        <Textarea rows={5} value={value.corpo} onChange={(e) => edit({ corpo: e.target.value })} placeholder="Como me vejo e como o mundo me vê"/>
      </div>
      <div>
        <label className="text-sm font-medium text-amber-900">Voz e Expressão 🔊</label>
        <Textarea rows={5} value={value.voz} onChange={(e) => edit({ voz: e.target.value })} placeholder="O que digo, o que calo e o que desejo comunicar"/>
      </div>
      <div>
        <label className="text-sm font-medium text-amber-900">Sonhos e Potências 🌞</label>
        <Textarea rows={5} value={value.sonhos} onChange={(e) => edit({ sonhos: e.target.value })} placeholder="O que quero construir"/>
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-amber-900">Fé ou Energia Vital 💫</label>
        <Textarea rows={4} value={value.fe} onChange={(e) => edit({ fe: e.target.value })} placeholder="O que me sustenta, me conecta, me dá esperança"/>
      </div>
      <div className="md:col-span-2">
        <label className="text-sm font-medium text-amber-900">Reflexão Final</label>
        <Textarea rows={4} value={value.reflexaoFinal} onChange={(e) => edit({ reflexaoFinal: e.target.value })} placeholder="Quem sou eu quando ninguém me observa?"/>
      </div>
    </div>
  );
}

// --- APP ---
export default function AfrolumiPlataforma() {
  const [data, setData] = useLocalState<AppData>(STORAGE_KEY, defaultData);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setSaved(true); const t = setTimeout(() => setSaved(false), 1000); return () => clearTimeout(t); }, [data]);
  const eixo1Progress = useMemo(() => <ProgressEixo1 data={data.eixo1} />, [data.eixo1]);

  return (
    <div className="min-h-screen bg-amber-50/60">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-amber-50/70 border-b border-amber-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-900 grid place-items-center text-amber-50"><Sparkles className="h-5 w-5"/></div>
            <div>
              <h1 className="text-xl font-semibold text-amber-950 tracking-tight">AFROLUMI • Plataforma</h1>
              <p className="text-xs text-amber-800">Caderno vivo de formação • Inclusivo e afrocentrado</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Input className="w-56" placeholder="Nome da participante" value={data.participante.nome} onChange={(e) => setData({ ...data, participante: { nome: e.target.value } })} />
            <Toolbar data={data} setData={setData as any} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-3">
          <Card className="border-amber-200/70">
            <CardContent className="p-4 space-y-3">
              <SectionHeader title="Navegação por Eixos"/>
              <Tabs defaultValue="eixo1" className="w-full">
                <TabsList className="grid grid-cols-1 gap-2 p-0 bg-transparent">
                  {[
                    ["eixo1", "Eixo 1 • Consciência"],
                    ["eixo2", "Eixo 2 • Afeto"],
                    ["eixo3", "Eixo 3 • Educação Libertadora"],
                    ["eixo4", "Eixo 4 • Identidade e Corpo"],
                    ["eixo5", "Eixo 5 • Potência Econômica"],
                    ["eixo6", "Eixo 6 • Comunidade"],
                    ["eixo7", "Eixo 7 • Espiritualidade e Ancestralidade"],
                    ["eixo8", "Eixo 8 • Expressão e Voz"],
                  ].map(([val, label]) => (
                    <TabsTrigger key={val} value={val as string} className="justify-start data-[state=active]:bg-amber-900 data-[state=active]:text-amber-50">
                      {label as string}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="border-amber-200/70">
            <CardContent className="p-4 space-y-3">
              <SectionHeader title="Status"/>
              {eixo1Progress}
              <div className="text-xs text-amber-800 flex items-center gap-2 mt-1">
                <CheckCircle2 className={`h-4 w-4 ${saved ? "opacity-100" : "opacity-0"}`} />
                <span className={`${saved ? "opacity-100" : "opacity-0"}`}>Alterações salvas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200/70">
            <CardContent className="p-4 space-y-2">
              <SectionHeader title="Nota de Inclusão"/>
              <HelpNote>
                Aqui, cada mulher é convidada a se conectar com sua história e sua luz interior. Algumas chamam isso de fé, outras de ancestralidade, outras de força divina. No AFROLUMI, todas as formas de conexão com o sagrado são bem-vindas.
              </HelpNote>
            </CardContent>
          </Card>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9 space-y-6">
          {/* Eixo 1 */}
          <Card className="border-amber-200/70">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <BookOpenText className="h-5 w-5 text-amber-900"/>
                <h2 className="text-xl font-semibold text-amber-950">Eixo 1 • Consciência — O Despertar da Mulher Negra</h2>
              </div>
              <p className="text-sm text-amber-900/90 leading-relaxed">
                O despertar da consciência é o ato de lembrar quem somos e de onde viemos — sem impor dogmas. Nesta etapa, ancestralidade é memória e transmissão de valores; fé é energia vital que sustenta a caminhada. Toda expressão de espiritualidade é acolhida.
              </p>

              {/* Linha de Vida */}
              <SectionHeader title="Ferramenta 1 — Linha de Vida Ancestral" subtitle="(também chamada Linha da Vida Pessoal e Familiar)"/>
              <HelpNote>Marque etapas significativas da sua história. Para cada etapa, descreva o que aconteceu e como se sentiu. Você pode adicionar quantas etapas quiser.</HelpNote>
              <LinhaDeVida
                data={data.eixo1.linhaVida}
                onChange={(list) => setData({ ...data, eixo1: { ...data.eixo1, linhaVida: list } })}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-900">Carta de Gratidão</label>
                <Textarea
                  rows={6}
                  placeholder="Escreva uma carta para si e para as mulheres que abriram caminho na sua história."
                  value={data.eixo1.cartaGratidao}
                  onChange={(e) => setData({ ...data, eixo1: { ...data.eixo1, cartaGratidao: e.target.value } })}
                />
              </div>

              {/* Mapa da Identidade */}
              <SectionHeader title="Ferramenta 2 — Mapa da Identidade" subtitle="(Mapa de Mim)"/>
              <HelpNote>Preencha as áreas abaixo com palavras, frases, símbolos ou colagens digitais (texto). Quem é você quando ninguém observa? O que é essencial em você e não pode ser apagado?</HelpNote>
              <MapaIdentidade
                value={data.eixo1.mapaIdentidade}
                onChange={(v) => setData({ ...data, eixo1: { ...data.eixo1, mapaIdentidade: v } })}
              />

              <div className="flex gap-3 pt-1">
                <Button className="gap-2 bg-amber-900 hover:bg-amber-800" onClick={() => window.print()}>
                  <Download className="h-4 w-4"/> Imprimir / Salvar PDF
                </Button>
                <Button variant="outline" className="gap-2" onClick={() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))}>
                  <Save className="h-4 w-4"/> Salvar agora
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Placeholders dos próximos Eixos */}
          {[2,3,4,5,6,7,8].map((n) => (
            <Card key={n} className="border-amber-200/70">
              <CardContent className="p-6 space-y-2">
                <h3 className="text-lg font-semibold text-amber-950">Eixo {n} • Em construção</h3>
                <p className="text-sm text-amber-900/80">Estrutura pronta para inserir ferramentas e conteúdo do Eixo {n}. Assim que definirmos as atividades, adicionaremos formulários e instruções aqui.</p>
              </CardContent>
            </Card>
          ))}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-amber-200">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-amber-800 flex flex-wrap items-center justify-between gap-2">
          <span>AFROLUMI • Metodologia Inclusiva • © {new Date().getFullYear()} Karla Calazans</span>
          <span>Base inspirada em bell hooks • Design: tons terrosos • Privacidade: dados ficam no seu dispositivo</span>
        </div>
      </footer>
    </div>
  );
}
