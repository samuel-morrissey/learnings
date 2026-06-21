# Review Queue

| Item | Source | Last reviewed | Next due | Stage |
|------|--------|---------------|----------|-------|
| CapEx vs OpEx (troca que a nuvem faz) | [LR-0002](./learning-records/0002-d1-cloud-value-proposition.md) | 2026-06-12 | 2026-06-22 | 2 |
| As 6 vantagens da nuvem (mnemônico "3 pares": Financeiro/Flexibilidade/Foco) | [LR-0006](./learning-records/0006-six-advantages-mnemonic-and-ri-correction.md) | 2026-06-15 | 2026-06-22 | 2 |
| RI vs Savings Plans: desconto IGUAL (~72%); RI só pela reserva de capacidade | [LR-0006](./learning-records/0006-six-advantages-mnemonic-and-ri-correction.md) | 2026-06-18 | 2026-06-28 | 2 |
| IaaS/PaaS/SaaS pela pergunta "de que o cliente ainda cuida?" | [LR-0003](./learning-records/0003-d1-service-deployment-models.md) | 2026-06-12 | 2026-06-22 | 2 |
| Modelos de implantação (cloud / híbrido / on-prem) | [LR-0003](./learning-records/0003-d1-service-deployment-models.md) | 2026-06-19 | 2026-06-29 | 2 |
| Hierarquia Região → AZ → data center + Edge Location | [LR-0004](./learning-records/0004-d1-complete-global-infra.md) | 2026-06-18 | 2026-06-28 | 2 |
| 4 fatores de escolha de região (funil: legal→serviço existe→latência→preço; NÃO usar mnemônico) | [LR-0004](./learning-records/0004-d1-complete-global-infra.md) | 2026-06-19 | 2026-06-30 | 2 |
| 5 modelos de compra do EC2 (casar carga ↔ modelo) | [LR-0005](./learning-records/0005-d3-ec2-purchase-models.md) | 2026-06-15 | 2026-06-25 | 2 |
| Auto Scaling (nº de instâncias, horizontal) vs ELB (distribui tráfego) | [GLOSSARY](./reference/GLOSSARY.md) | 2026-06-18 | 2026-06-28 | 2 |
| ASG/ELB devem abranger VÁRIAS AZs (multi-AZ = alta disponibilidade; não "dentro de uma zona") | [LR-0009](./learning-records/0009-d3-asg-elb-learned-multi-az-correction.md) | 2026-06-18 | 2026-06-21 | 1 |
| Camada 4 (NLB, IP+porta) vs Camada 7 (ALB, lê HTTP); régua porta vs. rota | [GLOSSARY](./reference/GLOSSARY.md) | 2026-06-18 | 2026-06-28 | 2 |
| IP = camada 3 (rota/rede), TCP = camada 4 (porta/processo); "TCP/IP" = encapsulamento, não mesma camada | [LR-0008](./learning-records/0008-tcp-ip-layer-confusion.md) | 2026-06-19 | 2026-06-29 | 2 |
| S3 = object storage; trio bucket (nome único mundial, 1 região) · objeto (dados+metadados, 5 TB, cópias em AZs) · key; acesso HTTP | [LR-0010](./learning-records/0010-d3-s3-object-storage-learned.md) | 2026-06-19 | 2026-06-24 | 1 |
| Durabilidade ("não perco", 11 noves) vs disponibilidade ("acesso agora", ~4 noves); 11 noves = durabilidade | [LR-0010](./learning-records/0010-d3-s3-object-storage-learned.md) | 2026-06-19 | 2026-06-25 | 1 |
