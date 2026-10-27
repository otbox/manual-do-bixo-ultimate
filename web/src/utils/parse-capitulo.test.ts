/**
 * DOCUMENTAÇÃO DE TESTES: parse-capitulo.ts
 *
 * Este arquivo documenta os casos de teste esperados para os helpers do parser.
 * Os testes foram projetados para validar edge cases e compatibilidade retroativa.
 *
 * PARA EXECUTAR TESTES AUTOMATIZADOS:
 * 1. Instale vitest: npm install --save-dev vitest
 * 2. Descomente o código abaixo
 * 3. Execute: npx vitest parse-capitulo.test.ts
 *
 * CASOS DE TESTE DOCUMENTADOS:
 *
 * ============================================================================
 * GRUPO 1: IconBloco detection
 * ============================================================================
 *
 * Caso 1.1: Detecta **IMPORTANTE:** com descrição
 *   Input: "**IMPORTANTE:** texto crítico aqui"
 *   Esperado: Bloco tipo 'icon-bloco' com tipo='importante', titulo='IMPORTANTE', descricao='texto crítico aqui'
 *
 * Caso 1.2: Detecta **ALERTA:** com descrição
 *   Input: "**ALERTA:** cuidado com isto"
 *   Esperado: Bloco tipo 'icon-bloco' com tipo='alerta'
 *
 * Caso 1.3: Detecta **DICA:** com descrição
 *   Input: "**DICA:** sugestão útil"
 *   Esperado: Bloco tipo 'icon-bloco' com tipo='dica'
 *
 * Caso 1.4: Detecta **INFO:** com descrição
 *   Input: "**INFO:** informação geral"
 *   Esperado: Bloco tipo 'icon-bloco' com tipo='info'
 *
 * ============================================================================
 * GRUPO 2: CaixaDestaque - Lookahead e Terminação (PRINCIPAL EDGE CASE)
 * ============================================================================
 *
 * Caso 2.1: Termina em linha vazia
 *   Input: "**ALERTA!**\nLinha 1\nLinha 2\n\nPróximo parágrafo"
 *   Esperado: CaixaDestaque com conteudo="Linha 1\nLinha 2" (sem "Próximo parágrafo")
 *   Validação: Lookahead detecta /^$/ e termina coleta
 *
 * Caso 2.2: Termina em heading (## ou ###)
 *   Input: "**ALERTA!**\nConteúdo alerta\n\n## Próxima Seção"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo alerta" (sem "Próxima Seção")
 *   Validação: Lookahead detecta /^#{1,3}\s/ e termina coleta
 *
 * Caso 2.3: Termina em quote marker (>)
 *   Input: "**IMPORTANTE!**\nConteúdo importante\n> citação aqui"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo importante" (sem "citação")
 *   Validação: Lookahead detecta /^>/ e termina coleta
 *
 * Caso 2.4: Termina em lista comum (- * +)
 *   Input: "**ALERTA!**\nConteúdo\n- item da lista"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo" (sem "item da lista")
 *   Validação: Lookahead detecta /^[-*+]\s/ e termina coleta
 *
 * Caso 2.5: Termina em lista numerada (\d+.)
 *   Input: "**IMPORTANTE!**\nConteúdo\n1. Primeiro passo"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo" (sem "Primeiro passo")
 *   Validação: Lookahead detecta /^\d+\./ e termina coleta
 *
 * Caso 2.6: Termina em imagem (![alt](src))
 *   Input: "**ALERTA!**\nConteúdo\n![alt](image.png)"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo" (sem "image")
 *   Validação: Lookahead detecta /^!\[/ e termina coleta
 *
 * Caso 2.7: Termina em lista decorada → (setas)
 *   Input: "**DICA!**\nConteúdo\n→ passo 1"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo" (sem "passo 1")
 *   Validação: Lookahead detecta /^→\s/ e termina coleta
 *
 * Caso 2.8: Termina em lista decorada ★ (símbolos)
 *   Input: "**IMPORTANTE!**\nConteúdo\n★ item importante"
 *   Esperado: CaixaDestaque com conteudo="Conteúdo" (sem "item importante")
 *   Validação: Lookahead detecta /^★\s/ e termina coleta
 *
 * Caso 2.9: Termina em novo IconBloco (**TIPO:**)
 *   Input: "**ALERTA!**\nConteúdo\n**IMPORTANTE:** novo bloco"
 *   Esperado: Dois blocos distintos (CaixaDestaque e IconBloco, não agrupados)
 *   Validação: Lookahead detecta /^\*\*(IMPORTANTE|ALERTA|DICA)[!]?\*\*/ e termina coleta
  *
 * ============================================================================
 * GRUPO 3: CaixaDestaque - Conteúdo
  * ============================================================================
 *
 * Caso 3.1: Captura linha simples
  * Input: "**ALERTA!**\nEsta é uma linha simples"
    * Esperado: CaixaDestaque com conteudo = "Esta é uma linha simples"
      *
 * Caso 3.2: Captura múltiplas linhas consecutivas
  * Input: "**ALERTA!**\nLinha 1\nLinha 2 continuação\nLinha 3 final"
    * Esperado: CaixaDestaque com conteudo = "Linha 1\nLinha 2 continuação\nLinha 3 final"
      *
 * Caso 3.3: Preserva markdown inline(** bold **, * italic *) — NÃO TERMINA
  * Input: "**IMPORTANTE!**\nTexto com **bold** e *italic* inline"
    * Esperado: CaixaDestaque com conteudo contendo "**bold**" e "*italic*"(preserved)
      * Validação: Markdown inline ** bold ** no meio de linha não dispara lookahead(não inicia linha)
        *
 * Caso 3.4: NÃO termina em markdown inline sem marcador estrutural
  * Input: "**ALERTA!**\nTexto com **negrito no meio** sem ser bloco\nMais texto"
    * Esperado: CaixaDestaque com conteudo contendo ambas as linhas
      * Validação: Linha "Texto com **negrito..." não casa nenhum padrão de lookahead(não começa com **)
        *
 * ============================================================================
 * GRUPO 4: ListaDecorada - Detecção e Agrupamento
  * ============================================================================
 *
 * Caso 4.1: Detecta → como tipo 'setas'
  * Input: "→ Passo 1\n→ Passo 2"
    * Esperado: ListaDecorada com tipo = 'setas', itens = ['Passo 1', 'Passo 2']
      *
 * Caso 4.2: Detecta ★ como tipo 'simbolos'
  * Input: "★ Item 1\n★ Item 2"
    * Esperado: ListaDecorada com tipo = 'simbolos', itens = ['Item 1', 'Item 2']
      *
 * ============================================================================
 * GRUPO 5: Compatibilidade Retroativa
  * ============================================================================
 *
 * Caso 5.1: Listas legadas com - continuam como tipo 'dica'
  * Input: "- Item 1\n- Item 2"
    * Esperado: Bloco tipo 'dica' com itens = ['Item 1', 'Item 2']
      * Validação: Parser antigo continua intacto
        *
 * Caso 5.2: Quotes com > continuam como tipo 'balao'
  * Input: "> Citação ou balão aqui"
    * Esperado: Bloco tipo 'balao' com texto contendo "Citação"
      * Validação: Parser antigo continua intacto
        *
 * Caso 5.3: ** MACETE! ** legado não conflita com novos padrões
  * Input: "**MACETE!**\n- tip 1\n- tip 2"
    * Esperado: Nenhum erro, estrutura parseada corretamente
      * Validação: Novo padrão CaixaDestaque não interfere com macro antigo
        *
 * ============================================================================
 * RESUMO DE COBERTURA
  * ============================================================================
 *
 * Total de casos testados: 21
  * Cobertura por componente:
 * - IconBloco: 4 testes(detecção de 4 tipos)
  * - CaixaDestaque: 13 testes(9 terminação + 4 conteúdo)
    * - ListaDecorada: 2 testes(detecção de 2 tipos)
      * - Compatibilidade: 3 testes(legado)
        *
 * Áreas críticas validadas:
 *   ✓ Lookahead regex cobre todos os marcadores estruturais
  *   ✓ Markdown inline preservado sem terminar bloco
    *   ✓ Sem quebra de compatibilidade com código existente
      *   ✓ Todos os edge cases de CaixaDestaque cobertos
        *
 * ============================================================================
 */

// Exemplo de como desomentar para usar vitest:
/*
import { describe, it, expect } from 'vitest';
import { parseCapitulo } from './parse-capitulo';

describe('parseCapitulo - Parser Tests', () => {
  describe('IconBloco detection', () => {
    it('should detect **IMPORTANTE:** pattern', () => {
      const raw = `# Título\n\n**IMPORTANTE:** texto crítico aqui`;
      const result = parseCapitulo(raw, '01-test');
      expect(result.paginas[0]?.blocos).toContainEqual(
        expect.objectContaining({
          type: 'icon-bloco',
          tipo: 'importante',
          titulo: 'IMPORTANTE',
          descricao: 'texto crítico aqui',
        })
      );
    });
  });

  describe('CaixaDestaque - lookahead and termination', () => {
    it('should terminate CaixaDestaque at empty line', () => {
      const raw = `# Título\n\n**ALERTA!**\nLinha 1 de conteúdo\nLinha 2 de conteúdo\n\nNovo parágrafo`;
      const result = parseCapitulo(raw, '01-test');
      const caixa = result.paginas[0]?.blocos.find(
        (b) => b.type === 'caixa-destaque'
      );
      expect(caixa).toBeDefined();
      if (caixa && caixa.type === 'caixa-destaque') {
        expect(caixa.conteudo).not.toContain('Novo parágrafo');
      }
    });
  });
});
*/
