"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Save, Sparkles, Trash2 } from "lucide-react";

// ========================= TIPOS =========================

interface LinhaVidaEtapa {
  fase: string;
  acontecimento: string;
  sentimento: string;
}

interface MapaIdentidade {
  valores: string;
  talentos: string;
  conquistas: string;
  dores: string;
  sonhos: string;
}

interface Eixo1 {
  linhaVida: LinhaVidaEtapa[];
  mapaIdentidade: MapaIdentidade;
  cartaGratidao: string;
}

interface Participante {
  nome: string;
  email: string;
  telefone: string;
}

interface AppData {
  participante: Participante;
  eixo1: Eixo1;
}

// ========================= CONSTANTES =========================

const STORAGE_KEY = "afrolumi_app_data";

const defaultData: AppData = {
  participante: { nome: "", email: "", telefone: "" },
  eixo1: {
    linhaVida: [
      { fase: "Infância", acontecimento: "", sentimento: "" },
      { fase: "Juventude", acontecimento: "", sentimento: "" },
      { fase: "Vida adulta", acontecimento: "", sentimento: "" },
    ],
    mapaIdentidade: {
      valores: "",
      talentos: "",
      conquistas: "",
      dores: "",
      sonhos: "",
    },
    cartaGratidao: "",
  },
};

// ========================= HOOK useLocalState =========================
// Versão ajustada para evitar erro de hidratação (SSR x cliente)

function useLocalState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Carregar do localStorage depois que o componente monta no cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        setState(JSON.parse(raw) as T);
      }
    } catch {
      // se der erro ao ler, segue com o initial
    } finally {
      setHasHydrated(true);
    }
  }, [key]);

  // Salvar no localStorage sempre que o estado mudar (depois da hidratação)
  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // se der erro de quota, ignoramos
    }
  }, [key, state, hasHydrated]);

  return [state, setState] as const;
}

// ========================= PÁGINA PRINCIPAL =========================

export default function AfrolumiPlataforma() {
  const [data, setData] = useLocalState<AppData>(STORAGE_KEY, defaultData);
  const [saved, setSaved] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendMessage, setSendMessage] = useState<string | null>(null);

  // Controle visual de "Salvo!"
  useEffect(() => {
    setSaved(true);
    const t = window.setTimeout(() => setSaved(false), 1200);
    return () => window.clearTimeout(t);
  }, [data]);

  // ---------- Enviar para mentora (Supabase via /api/eixo1) ----------
  const handleEnviarParaMentora = async () => {
    if (!data.participante.nome) {
      alert("Preencha o nome antes de enviar.");
      return;
    }

    setSendMessage(null);

    try {
      setSending(true);

      const res = await fetch("/api/eixo1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: data.participante.nome,
          email: data.participante.email,
          telefone: data.participante.telefone,
          eixo1: data.eixo1,
        }),
      });

      const body = await res
        .json()
        .catch(() => ({ ok: false, error: "Erro ao interpretar resposta." }));

      if (!res.ok || body?.error) {
        console.error("Erro ao enviar:", body);
        setSendMessage(
          body?.error || "Não foi possível enviar agora. Tente novamente."
        );
        return;
      }

      setSendMessage("Resposta enviada com sucesso para a mentora.");
    } catch (e) {
      console.error(e);
      setSendMessage("Erro inesperado. Verifique sua conexão e tente novamente.");
    } finally {
      setSending(false);
    }
  };

  // ========================= RENDER =========================

  return (
    <main className="min-h-screen bg-[#f8f4ec] text-zinc-900 p-4 md:p-10">
      {/* Cabeçalho */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-amber-900">
            AFROLUMI • Plataforma
          </h1>
          <p className="text-sm text-zinc-600">
            Caderno vivo de formação • Inclusivo e afrocentrado
          </p>
        </div>

        {/* Dados da participante */}
        <div className="flex flex-col gap-2 w-full md:w-80">
          <Input
            placeholder="Nome"
            value={data.participante.nome}
            onChange={(e) =>
              setData({
                ...data,
                participante: { ...data.participante, nome: e.target.value },
              })
            }
          />
          <Input
            placeholder="E-mail"
            value={data.participante.email}
            onChange={(e) =>
              setData({
                ...data,
                participante: { ...data.participante, email: e.target.value },
              })
            }
          />
          <Input
            placeholder="Telefone (WhatsApp)"
            value={data.participante.telefone}
            onChange={(e) =>
              setData({
                ...data,
                participante: { ...data.participante, telefone: e.target.value },
              })
            }
          />
        </div>
      </header>

      {/* Conteúdo principal */}
      <div className="bg-white shadow rounded-lg p-6 space-y-10">
        {/* Eixo 1 - Introdução */}
        <section>
          <h2 className="text-2xl font-bold text-amber-800">
            Eixo 1 • Consciência — O Despertar da Mulher Negra
          </h2>
          <p className="text-sm text-zinc-600 mt-2">
            O despertar da consciência é lembrar quem somos e de onde viemos —
            sem impor crenças. Cada história carrega força, dignidade e memória.
          </p>
        </section>

        {/* Ferramenta 1: Linha de Vida Ancestral */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-700">
            Ferramenta 1 — Linha de Vida Ancestral
          </h3>

          <p className="text-sm text-zinc-600">
            Registre momentos importantes da sua vida e como eles contribuíram
            para quem você é.
          </p>

          {data.eixo1.linhaVida.map(
            (etapa: LinhaVidaEtapa, idx: number) => (
              <div
                key={idx}
                className="border rounded-md p-4 bg-amber-50 mb-3 space-y-2"
              >
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Fase */}
                  <Input
                    placeholder="Fase"
                    value={etapa.fase}
                    onChange={(e) => {
                      const nova = [...data.eixo1.linhaVida];
                      nova[idx].fase = e.target.value;
                      setData({
                        ...data,
                        eixo1: { ...data.eixo1, linhaVida: nova },
                      });
                    }}
                    className="w-full"
                  />

                  {/* Acontecimento */}
                  <Input
                    placeholder="O que aconteceu"
                    value={etapa.acontecimento}
                    onChange={(e) => {
                      const nova = [...data.eixo1.linhaVida];
                      nova[idx].acontecimento = e.target.value;
                      setData({
                        ...data,
                        eixo1: { ...data.eixo1, linhaVida: nova },
                      });
                    }}
                    className="w-full"
                  />

                  {/* Sentimento */}
                  <Input
                    placeholder="Como me senti"
                    value={etapa.sentimento}
                    onChange={(e) => {
                      const nova = [...data.eixo1.linhaVida];
                      nova[idx].sentimento = e.target.value;
                      setData({
                        ...data,
                        eixo1: { ...data.eixo1, linhaVida: nova },
                      });
                    }}
                    className="w-full"
                  />

                  {/* Remover */}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      const nova = [...data.eixo1.linhaVida];
                      nova.splice(idx, 1);
                      setData({
                        ...data,
                        eixo1: { ...data.eixo1, linhaVida: nova },
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          )}

          {/* Adicionar Etapa */}
          <Button
            className="bg-amber-800 hover:bg-amber-700"
            onClick={() => {
              const nova = [...data.eixo1.linhaVida];
              nova.push({
                fase: "",
                acontecimento: "",
                sentimento: "",
              });
              setData({
                ...data,
                eixo1: { ...data.eixo1, linhaVida: nova },
              });
            }}
          >
            + Adicionar etapa
          </Button>
        </section>

        {/* Ferramenta 2: Mapa da Identidade */}
        <section className="space-y-4">
          <h3 className="text-xl font-semibold text-amber-700">
            Ferramenta 2 — Mapa da Identidade
          </h3>

          <textarea
            placeholder="Meus valores"
            value={data.eixo1.mapaIdentidade.valores}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  mapaIdentidade: {
                    ...data.eixo1.mapaIdentidade,
                    valores: e.target.value,
                  },
                },
              })
            }
            className="border rounded w-full p-3 h-24"
          />

          <textarea
            placeholder="Meus talentos"
            value={data.eixo1.mapaIdentidade.talentos}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  mapaIdentidade: {
                    ...data.eixo1.mapaIdentidade,
                    talentos: e.target.value,
                  },
                },
              })
            }
            className="border rounded w-full p-3 h-24"
          />

          <textarea
            placeholder="Minhas conquistas"
            value={data.eixo1.mapaIdentidade.conquistas}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  mapaIdentidade: {
                    ...data.eixo1.mapaIdentidade,
                    conquistas: e.target.value,
                  },
                },
              })
            }
            className="border rounded w-full p-3 h-24"
          />

          <textarea
            placeholder="Minhas dores"
            value={data.eixo1.mapaIdentidade.dores}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  mapaIdentidade: {
                    ...data.eixo1.mapaIdentidade,
                    dores: e.target.value,
                  },
                },
              })
            }
            className="border rounded w-full p-3 h-24"
          />

          <textarea
            placeholder="Meus sonhos"
            value={data.eixo1.mapaIdentidade.sonhos}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  mapaIdentidade: {
                    ...data.eixo1.mapaIdentidade,
                    sonhos: e.target.value,
                  },
                },
              })
            }
            className="border rounded w-full p-3 h-24"
          />
        </section>

        {/* Carta de Gratidão */}
        <section className="space-y-2">
          <h3 className="text-xl font-semibold text-amber-700">
            Carta de Gratidão
          </h3>
          <textarea
            placeholder="Escreva uma carta para si e para as mulheres que abriram caminho para sua história florescer."
            value={data.eixo1.cartaGratidao}
            onChange={(e) =>
              setData({
                ...data,
                eixo1: {
                  ...data.eixo1,
                  cartaGratidao: e.target.value,
                },
              })
            }
            className="border rounded w-full p-3 h-32"
          />
        </section>

        {/* Botões finais */}
        <div className="flex flex-wrap gap-3 pt-1">
          {/* Imprimir */}
          <Button
            className="gap-2 bg-amber-900 hover:bg-amber-800"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.print();
              }
            }}
          >
            <Download className="h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>

          {/* Salvar Agora */}
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              try {
                window.localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify(data)
                );
              } catch {
                //
              }
              setSaved(true);
            }}
          >
            <Save className="h-4 w-4" />
            Salvar agora
          </Button>

          {/* Enviar para mentora */}
          <Button
            variant="secondary"
            disabled={sending || !data.participante.nome}
            className="gap-2"
            onClick={handleEnviarParaMentora}
          >
            <Sparkles className="h-4 w-4" />
            {sending ? "Enviando..." : "Enviar para mentora"}
          </Button>
        </div>

        {/* Mensagens de status */}
        {saved && (
          <p className="text-xs text-green-600 pt-2">
            Alterações salvas neste dispositivo.
          </p>
        )}

        {sendMessage && (
          <p
            className={`text-xs pt-1 ${
              sendMessage.toLowerCase().includes("sucesso")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {sendMessage}
          </p>
        )}
      </div>
    </main>
  );
}
