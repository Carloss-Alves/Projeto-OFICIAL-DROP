import { useSiteSettings } from '@/hooks/useSiteSettings';
import { usePageMeta } from '@/hooks/useSeo';

export function AboutPage() {
  const { settings } = useSiteSettings();
  usePageMeta(`Sobre | ${settings.store_name}`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <span className="eyebrow">Sobre</span>
      <h1 className="text-display text-4xl sm:text-5xl mt-2">{settings.store_name}</h1>
      <div className="mt-8 flex flex-col gap-5 text-ink-300 leading-relaxed">
        <p>
          Nascemos da rua, não de um catálogo. A {settings.store_name} existe para quem se veste com
          intenção — peças selecionadas a dedo, sem seguir a moda do momento, sem repetir o óbvio.
        </p>
        <p>
          Trabalhamos como uma loja multimarcas: reunimos Nike, Lacoste e outras marcas que respeitam o
          mesmo padrão de qualidade que a gente exige pra si. Não somos uma loja oficial dessas marcas —
          somos curadores de streetwear com critério.
        </p>
        <p>
          O nome DROP vem da ideia por trás da curadoria: cada peça que entra no catálogo passou por uma
          seleção criteriosa. Não trabalhamos com lançamento por horário marcado — o produto entra na loja
          assim que chega, e fica disponível enquanto durar o estoque.
        </p>
        <p className="text-sm text-ink-500 pt-4 border-t border-ink-800">
          Este texto é editável pelo painel administrativo (Configurações da loja) — atualize com a
          história real da sua marca a qualquer momento.
        </p>
      </div>
    </div>
  );
}
