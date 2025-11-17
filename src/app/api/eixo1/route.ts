import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// Rota: POST /api/eixo1
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { nome, email, eixo1 } = body;

    if (!nome || !eixo1) {
      return NextResponse.json(
        { error: "Nome da participante e dados do Eixo 1 são obrigatórios." },
        { status: 400 }
      );
    }

    // 1) Procurar participante pelo nome
    const { data: existing, error: findError } = await supabase
      .from("participants")
      .select("id")
      .eq("name", nome)
      .maybeSingle();

    if (findError) {
      console.error("Erro ao buscar participante:", findError);
    }

    let participantId = existing?.id;

    // 2) Se não existir, criar
    if (!participantId) {
      const { data: inserted, error: insertError } = await supabase
        .from("participants")
        .insert({ name: nome, email })
        .select("id")
        .single();

      if (insertError || !inserted) {
        console.error("Erro ao criar participante:", insertError);
        return NextResponse.json(
          { error: "Não foi possível salvar a participante." },
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
      console.error("Erro ao inserir resposta do Eixo 1:", responseError);
      return NextResponse.json(
        { error: "Não foi possível salvar a resposta do Eixo 1." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro inesperado na rota /api/eixo1:", err);
    return NextResponse.json(
      { error: "Erro inesperado ao salvar dados." },
      { status: 500 }
    );
  }
}
