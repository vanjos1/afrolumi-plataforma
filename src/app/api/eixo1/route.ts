import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Rota: POST /api/eixo1
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nome, email, telefone, eixo1 } = body;

    if (!nome || !eixo1) {
      return NextResponse.json(
        { error: "Nome e dados do Eixo 1 são obrigatórios." },
        { status: 400 }
      );
    }

    // 1) Procurar participante pelo nome
    const { data: existing, error: selectError } = await supabase
      .from("participants")
      .select("id")
      .eq("name", nome)
      .maybeSingle();

    if (selectError) {
      // Retorna a mensagem de erro específica do Supabase para ajudar no diagnóstico (ex: RLS, schema)
      const message = selectError.message || "Erro desconhecido ao buscar participante.";
      console.error("ERRO SUPABASE (SELECT):", selectError);
      return NextResponse.json(
        { error: `Erro ao buscar participante: ${message}` },
        { status: 500 }
      );
    }

    let participantId = existing?.id;

    // 2) Criar participante caso não exista
    if (!participantId) {
      const { data: inserted, error: insertError } = await supabase
        .from("participants")
        .insert({
          name: nome,
          email,
          telefone,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        // Retorna a mensagem de erro específica do Supabase
        const message = insertError?.message || "Erro desconhecido ao inserir participante.";
        console.error("ERRO SUPABASE (INSERT PARTICIPANT):", insertError);
        return NextResponse.json(
          { error: `Não foi possível salvar a participante: ${message}` },
          { status: 500 }
        );
      }

      participantId = inserted.id;
    }

    // 3) Salvar resposta do Eixo 1
    const { error: responseError } = await supabase
      .from("eixo1_responses")
      .insert({
        participant_id: participantId,
        linha_vida: eixo1.linhaVida,
        carta_gratidao: eixo1.cartaGratidao,
        mapa_identidade: eixo1.mapaIdentidade,
      });

    if (responseError) {
      // Retorna a mensagem de erro específica do Supabase
      const message = responseError.message || "Erro desconhecido ao salvar resposta do Eixo 1.";
      console.error("ERRO SUPABASE (INSERT EIXO1):", responseError);
      return NextResponse.json(
        { error: `Não foi possível salvar a resposta do Eixo 1: ${message}` },
        { status: 500 }
      );
    }

    // Sucesso
    return NextResponse.json({ success: true, message: "Dados enviados com sucesso para a mentora." });

  } catch (err) {
    // Erro geral (ex: erro no request.json() ou falha de conexão inicial)
    console.error("ERRO INESPERADO NA API:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao salvar dados. Verifique o console para mais detalhes." },
      { status: 500 }
    );
  }
}