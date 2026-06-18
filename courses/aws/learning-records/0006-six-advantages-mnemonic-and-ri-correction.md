# 6 vantagens travadas via mnemônico próprio + correção RI vs Savings Plans

## Recuperação do item falhado (6 vantagens)
Na revisão de 12/06 Samuel falhou a lista nominal das 6 vantagens. Em 15/06 ele as
reconstruiu todas, agrupadas espontaneamente em **3 pares temáticos** — uma estrutura
mnemônica própria, que adotamos:
- **Financeiro:** (1) despesa fixa→variável · (2) economia de escala
- **Flexibilidade:** (3) parar de adivinhar capacidade · (4) velocidade/agilidade
- **Foco & alcance:** (5) parar de manter data centers · (6) global em minutos

Gatilho de memória: "3 pares — Financeiro, Flexibilidade, Foco". Item promovido a
estágio 2. Ainda não testado totalmente "a frio" na redação nominal exata da AWS, mas
a derivação conceitual está sólida.

## Misconceição corrigida (alto valor)
Samuel acreditava que **Reserved Instances dá desconto melhor que Savings Plans**.
Corrigido: **ambos chegam a ~72% — desconto equivalente**. A vantagem exclusiva da RI
não é desconto, é a **reserva de capacidade** (garante instância disponível numa AZ);
o custo dessa garantia é a rigidez (preso a um tipo). Regra de decisão correta:
"economizam igual; RI só quando preciso garantir capacidade, senão Savings Plan pela
flexibilidade." Já refletido no GLOSSARY.

**Evidência:** teach-back escrito das 6 vantagens (completo) e dos 5 modelos de compra
(correto exceto o ponto do desconto da RI, corrigido na hora).

**Implicações:** dívida de produção da Lição 04 quitada. Falta só o resultado do quiz
da Lição 05. Manter ritmo; próximo conteúdo novo = Lição 06 (Amazon S3).
