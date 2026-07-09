# Classes de armazenamento do S3 — APRENDIDO (D3)

Samuel estudou a Lição 08 (classes de armazenamento do S3) em 22/06 e a praticou por
produção em 08/07 (pseudo cheat sheet escrito, sem consulta).

## Evidência
- **Cheat sheet de memória** cobriu, com as palavras dele: a **régua mestra**
  caro-e-frequente-sem-taxa ⇄ barato-e-raro-com-taxa/lento; as **3 temperaturas**
  (quente = caro guardar/sem taxa/instantâneo; morno = taxa + barato; frio =
  baratíssimo guardar / caro-lento recuperar); e a pegadinha das **duas cobranças**
  no dado frio (taxa de recuperação + duração mínima).
- Puxado o "o que NÃO muda": acertou que a **durabilidade (11 noves)** é constante
  em todas as classes.
- **Standard-IA vs One Zone-IA**: produziu a diferença sozinho (One Zone isola numa
  AZ só, ~20% mais barata, tira a redundância → só para dado recriável).
- **Pergunta autoral de alto valor:** "no One Zone a durabilidade também é 11 noves?"
  — exatamente a distinção sutil (durabilidade de projeto = 11 noves, mas dentro de
  1 AZ; perde-se se a AZ some). Ligou espontaneamente com durabilidade×disponibilidade
  e com multi-AZ do ELB/ASG.

## Correções aplicadas
- **Duração mínima NÃO é 30 dias para tudo.** Ele generalizou 30 dias. Ajustado:
  Standard-IA/One Zone-IA = 30; Glacier = 90; Deep Archive = 180. Régua: *quanto mais
  frio, mais longo o mínimo*.
- Não citou **Intelligent-Tiering**; adicionado como o "piloto automático" (AWS move
  entre camadas quando o padrão de acesso é desconhecido).

## Sinais de revisão coletados na MESMA sessão (08/07, retorno após 16 dias)
- **S3 fundamentos** (trio bucket·objeto·key; durabilidade×disponibilidade, 11 noves):
  recall impecável → promovidos a estágio 2.
- **EC2 modelos de compra:** raciocínio (casar carga↔modelo) **cirúrgico**, mas os
  **NOMES não fixam** — descreve certo, não nomeia. Recuperou On-Demand/Savings
  Plans/RI/Spot por descrição, **zerou Dedicated Hosts**. Item separado na fila: nomes
  ≠ conceito. Ver [[0005-d3-ec2-purchase-models]].
- **As 6 vantagens (buraco recorrente):** falhou de novo na 1ª tentativa e **contaminou**
  (puxou "pagar só o que uso", que é do par Financeiro, para a Flexibilidade). Mas
  **recuperou** com gancho causal próprio forte: "paro de adivinhar PORQUE escalo/libero
  em segundos" (amarra os dois gêmeos). Verificar A FRIO em 11/07. Ver [[0006-six-advantages-mnemonic-and-ri-correction]].

## Implicações
- Verbete **Classes de armazenamento do S3** criado no [[GLOSSARY]] a partir do cheat
  sheet dele (régua mestra preservada com a redação dele).
- Padrão do aluno reforçado: entende trade-offs por primeiros princípios e faz
  perguntas que revelam as bordas; **vocabulário/nomes é a fraqueza** — priorizar
  produção de rótulos, não só de lógica.
- D3 encerra storage. **Próximo conteúdo novo = Lição 09: Lambda / serverless.**
- MCP das Aulas (`write_aula`) estava **indisponível** nesta sessão (servidor `aulas`
  não subiu) — sem impacto na revisão/prática, mas será necessário resolver antes de
  gravar a Lição 09.
