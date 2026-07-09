# AWS Lambda / compute serverless — APRENDIDO (D3)

Samuel estudou a Lição 09 (AWS Lambda / serverless) e a praticou por produção em 09/07.

## Evidência
- **Quiz 5/5** no app (serverless=gerência; gatilho S3→Lambda; billing pay-per-use;
  limite de 15 min; EC2 para carga contínua/controle de SO).
- **Teach-back escrito forte**, com as palavras dele e nuances que a Aula nem
  enfatizou: EC2 "cobra por tempo em funcionamento mesmo em idle", **sem cold-start
  após instanciar**, **custo previsível**, e a escala horizontal como config do
  cliente. Serverless corretamente lido como "gerência do servidor, não a não
  existência dele".

## Correção aplicada (única, de alto valor)
Ele disse que o Lambda cobra "por tempo da chamada **+ tráfego de dados**". Corrigido:
o 2º eixo é **GB-segundos = memória alocada × tempo de execução** (compute), **não**
volume de dados trafegados. Modelo completo: **nº de requisições + GB-segundos**.
Pedido a ele um gancho próprio para "GB-segundos = memória × tempo" (associações
dele grudam; ver [[samuel-learns-by-compression]] / NOTES).

## Implicações
- Verbete **AWS Lambda — compute serverless** criado no [[GLOSSARY]] com a régua
  EC2×Lambda dele preservada + a correção do billing embutida.
- A Aula foi ancorada no CONTRASTE com EC2 ([[0005-d3-ec2-purchase-models]] mesmo
  padrão "casar carga ↔ serviço"); funcionou bem — o contraste é a alavanca de ZDP
  dele para compute.
- Padrão reforçado: entende trade-offs por primeiros princípios; a fraqueza segue
  sendo **vocabulário/nomes e números precisos** (aqui, o que exatamente compõe a
  conta) — priorizar produção de rótulos/fórmulas, não só de lógica.
- D3 compute encerrado (EC2 → ASG/ELB → Lambda). **Próximo = Lição 10: contêineres
  (ECS/Fargate)**, fechando o espectro de compute (VM ↔ contêiner ↔ função).
