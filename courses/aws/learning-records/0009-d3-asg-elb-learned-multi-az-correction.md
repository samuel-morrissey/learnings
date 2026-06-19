# Lição 05 aprendida (Auto Scaling + ELB) + correção multi-AZ

## Produção que fechou a lição
Em 18/06 Samuel fez o teach-back de Auto Scaling + ELB (a Lição 05 tinha quiz 5/5 mas faltava
produção ativa). Demonstrou com segurança:
- **Auto Scaling** = ajusta o **número de instâncias** conforme a demanda; **escala horizontal**
  (vs. vertical = aumentar a potência de uma só, manual).
- **ELB** = decide *para qual* instância vai cada pacote; **health checks** periódicos → só roteia
  para instâncias saudáveis/disponíveis.
- **Juntos** = ASG decide *quantas*; ELB decide *para qual*.

Lição 05 promovida a **APRENDIDA**; item de revisão correspondente a estágio 2.

## Misconceição corrigida (alto valor — alta disponibilidade)
Samuel descreveu o grupo como estando **"dentro de uma zona"** para sobreviver à queda de uma
zona — uma contradição. Corrigido: para alta disponibilidade o **Auto Scaling Group deve abranger
VÁRIAS AZs**. Entrega-se ao grupo as sub-redes de várias zonas e ele equilibra as instâncias entre
elas; se uma AZ cai, o ELB para de rotear para lá (health check) e as instâncias das outras AZs
seguem atendendo, enquanto o ASG repõe a capacidade nas zonas de pé.

Conecta com LR-0004 (multi-AZ = alta disponibilidade), que ele já dominava — tratado como deslize
de palavra ("dentro de" vs "espalhado por"), mas reforçado e posto na fila para checagem a frio.

## Pendência menor
Faltou amarrar explicitamente a dupla à vantagem **#3 "parar de adivinhar capacidade"** (capacidade
segue a demanda real). Mecanismo correto; só a ligação com a vantagem ficou implícita.

**Evidência:** quiz 5/5 + teach-back escrito completo, com a correção multi-AZ aplicada na hora.

**Implicações:** Domínio 3 segue forte. Próximo conteúdo novo = Lição 07 (Amazon S3).
