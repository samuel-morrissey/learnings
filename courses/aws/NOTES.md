# Notes

## Sobre o aluno
- Nome: Samuel de Lima (Caravela Sistemas).
- Dev sênior, 10+ anos. Forte em programação; fraco em infra/redes/cloud.
- Aprende infra hoje por tentativa e erro — quer trocar isso por base estruturada.
- Caminho para liderança técnica.

## Preferências de ensino
- **Idioma: português (PT-BR).**
- Lições curtas e densas (pouco tempo livre, prazo de 2–4 semanas).
- Gosta de entender o *porquê*, não só o *como* (perfil de quem vai defender decisões).
- Como é dev, analogias com programação/sistemas funcionam bem.
- **Mnemônicos de lista (siglas tipo C-P-S-P) NÃO funcionam para ele.** Listas de 4–5 itens
  soltos não fixam. Preferir **derivação por raciocínio / primeiros princípios** — transformar
  a lista numa sequência lógica de decisão (ex.: funil de "guard clauses"). (Confirmado 18/06.)

## Estratégia do curso
- Exame: 65 questões, 90 min, nota de corte 700/1000, ~US$100, validade 3 anos.
- Cobrir os 4 domínios na proporção dos pesos:
  - D1 Cloud Concepts — 24%
  - D2 Security & Compliance — 30%
  - D3 Cloud Technology & Services — 34%
  - D4 Billing, Pricing & Support — 12%
- Ordem sugerida: D1 (base mental) → D3 (serviços, maior peso) → D2 (segurança) → D4 (custo).
- Cada lição = 1 conceito + quiz com feedback imediato. Reforçar vocabulário via GLOSSARY.

## Pendências / ideias de próximas lições
- Dívidas de produção da Lição 04 (6 vantagens + 5 modelos) QUITADAS em 15/06 (ver LR-0006). OK.
- Lição 05 (Auto Scaling + ELB): ESTUDADA + APRENDIDA em 18/06 (quiz 5/5 + teach-back, ver LR-0009).
  Correção aplicada: ASG/ELB devem abranger VÁRIAS AZs (ele dissera "dentro de uma zona").
- Lição 06 (BÔNUS) = "Camadas de rede": ESTUDADA + APRENDIDA em 18/06 (quiz 4/5 + teach-back + a régua
  "porta vs. rota" dele, ver LR-0008). Glossário já tem a seção de camadas com a autoria dele.
- Lição 07 = **Amazon S3** (object storage): CRIADA + ENTREGUE em 19/06. Escopo: modelo bucket·objeto·key,
  block vs object (EBS vs S3), durabilidade vs disponibilidade (11 noves). Classes de armazenamento
  DELIBERADAMENTE adiadas para a Lição 08 (é o tópico de S3 que mais cai). Abriu a sessão 19/06 com
  revisão: 3/3 corretas (modelos de implantação atrasado, NLB L4, funil de região) — todos promovidos a
  estágio 2. PENDENTE: praticar a 07 (mini cheat sheet S3 → vira seção Storage do glossário, ainda não existe).
- D3 próximos: **Lição 08 = classes de armazenamento do S3**; depois Lambda/contêineres
  (ECS/Fargate), depois bancos (RDS/DynamoDB) e rede (VPC).
- D2: Modelo de Responsabilidade Compartilhada (muito cobrado) — Q4 das Lições 04/05 já planta a semente.
- D2: IAM (usuários, grupos, roles, políticas, MFA).
- D3: serviços core de compute/storage/database/network (EC2, S3, RDS, VPC...).
- D4: modelos de pricing, Free Tier, Cost Explorer, Budgets, planos de suporte.
