# Review Queue

| Item | Source | Last reviewed | Next due | Stage |
|------|--------|---------------|----------|-------|
| CapEx vs OpEx (troca que a nuvem faz) | [LR-0002](./learning-records/0002-d1-cloud-value-proposition.md) | 2026-06-22 | 2026-07-17 | 3 |
| As 6 vantagens da nuvem ("3 pares": Financeiro/Flexibilidade/Foco) — gêmeos da Flexibilidade = **parar de adivinhar capacidade** + **velocidade/agilidade**; 08/07 falhou na 1ª tentativa (contaminou com "pagar só o que uso" = Financeiro) mas RECUPEROU com gancho causal próprio forte ("paro de adivinhar PORQUE escalo/libero em segundos"); verificar A FRIO em 11/07 | [LR-0006](./learning-records/0006-six-advantages-mnemonic-and-ri-correction.md) | 2026-07-08 | 2026-07-11 | 2 |
| RI vs Savings Plans: desconto IGUAL (~72%); RI só pela reserva de capacidade | [LR-0006](./learning-records/0006-six-advantages-mnemonic-and-ri-correction.md) | 2026-06-18 | 2026-06-28 | 2 |
| IaaS/PaaS/SaaS pela pergunta "de que o cliente ainda cuida?" (lente bate no Modelo de Responsabilidade Compartilhada) | [LR-0003](./learning-records/0003-d1-service-deployment-models.md) | 2026-06-22 | 2026-07-17 | 3 |
| Modelos de implantação (cloud / híbrido / on-prem) | [LR-0003](./learning-records/0003-d1-service-deployment-models.md) | 2026-06-19 | 2026-06-29 | 2 |
| Hierarquia Região → AZ → data center + Edge Location | [LR-0004](./learning-records/0004-d1-complete-global-infra.md) | 2026-06-18 | 2026-06-28 | 2 |
| 4 fatores de escolha de região (funil: legal→serviço existe→latência→preço; NÃO usar mnemônico) | [LR-0004](./learning-records/0004-d1-complete-global-infra.md) | 2026-06-19 | 2026-06-30 | 2 |
| 5 modelos de compra do EC2 (casar carga ↔ modelo) — conceito OK 08/07; NOMES ainda não fixam (Spot / Reserved Instances / Savings Plans / On-Demand / Dedicated Hosts) | [LR-0005](./learning-records/0005-d3-ec2-purchase-models.md) | 2026-07-08 | 2026-07-23 | 3 |
| Auto Scaling (nº de instâncias, horizontal) vs ELB (distribui tráfego) | [GLOSSARY](./reference/GLOSSARY.md) | 2026-06-18 | 2026-06-28 | 2 |
| ASG/ELB devem abranger VÁRIAS AZs (multi-AZ = alta disponibilidade; não "dentro de uma zona"); recuperado a frio 22/06 | [LR-0009](./learning-records/0009-d3-asg-elb-learned-multi-az-correction.md) | 2026-06-22 | 2026-07-02 | 2 |
| Camada 4 (NLB, IP+porta) vs Camada 7 (ALB, lê HTTP); régua porta vs. rota | [GLOSSARY](./reference/GLOSSARY.md) | 2026-06-18 | 2026-06-28 | 2 |
| IP = camada 3 (rota/rede), TCP = camada 4 (porta/processo); "TCP/IP" = encapsulamento, não mesma camada | [LR-0008](./learning-records/0008-tcp-ip-layer-confusion.md) | 2026-06-19 | 2026-06-29 | 2 |
| S3 = object storage; trio bucket (nome único mundial, 1 região) · objeto (dados+metadados, 5 TB, cópias em AZs) · key; acesso HTTP | [LR-0010](./learning-records/0010-d3-s3-object-storage-learned.md) | 2026-07-08 | 2026-07-18 | 2 |
| Durabilidade ("não perco", 11 noves) vs disponibilidade ("acesso agora", ~4 noves); 11 noves = durabilidade | [LR-0010](./learning-records/0010-d3-s3-object-storage-learned.md) | 2026-07-08 | 2026-07-18 | 2 |
| Classes do S3: régua caro-frequente-sem-taxa ⇄ barato-raro-com-taxa/lento; 3 temperaturas; Standard-IA vs One Zone-IA (1 AZ, só dado recriável); Intelligent-Tiering = padrão desconhecido | [LR-0011](./learning-records/0011-d3-s3-storage-classes-learned.md) | 2026-07-08 | 2026-07-13 | 1 |
| Pegadinha das classes do S3: dado frio cobra taxa de recuperação **+** duração mínima (paga mesmo deletando antes), e o mínimo cresce ao esfriar (IA 30d · Glacier 90d · Deep Archive 180d) | [LR-0011](./learning-records/0011-d3-s3-storage-classes-learned.md) | 2026-07-08 | 2026-07-13 | 1 |
| Lambda/serverless: serverless = gerência (não inexistência) do servidor; contínuo→EC2 / esporádico-evento→Lambda; cobra por **nº requisições + GB-segundos (memória×tempo, NÃO tráfego de dados)**; limite 15 min por invocação | [LR-0012](./learning-records/0012-d3-lambda-serverless-learned.md) | 2026-07-09 | 2026-07-14 | 1 |
