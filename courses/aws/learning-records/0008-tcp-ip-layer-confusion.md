# "TCP/IP" não é uma camada só — IP é L3, TCP é L4

## Misconceição corrigida (clássica, alto valor)
No quiz da Lição 06 (bônus de camadas de rede) Samuel fez **4/5**; o único erro foi a
questão de roteamento IP entre redes. Ele explicou o raciocínio: *"pensei que IP fosse
camada 4, por causa de TCP/IP"*.

Corrigido: o nome **TCP/IP cola dois protocolos de camadas diferentes**.
- **IP = camada 3 (Rede)** → endereçamento e **rota entre redes** (chega à máquina/rede certa).
- **TCP = camada 4 (Transporte)** → **porta/processo** + confiável vs rápido (chega ao programa certo).

Eles andam juntos no nome porque trabalham juntos — é **encapsulamento**: um segmento TCP (L4)
viaja *dentro* de um pacote IP (L3). O nome reflete o envelope-dentro-do-envelope, não uma
camada compartilhada.

**Régua de desempate adotada (sem mnemônico):** "endereço IP = *onde* (qual máquina/rede, L3);
porta = *qual processo* naquela máquina (L4)". Gatilhos de prova: rota/rede/roteador/VPC → L3;
porta/TCP×UDP → L4.

## Estado da Lição 06 — APRENDIDA
ENTREGUE com 4/5 e **praticada por produção** em 18/06: teach-back forte de L4 vs L7. Produziu
sozinho a **régua porta vs. rota** (separar por porta → NLB/L4; separar por rota/URL num domínio
único → ALB/L7), que é o critério profissional de decisão — incorporada ao glossário com a autoria
dele. Item L4/L7 promovido a estágio 2. Resta firmar a palavra: NLB *encaminha por porta*, não
*"entende o processo"* (ele não interpreta o conteúdo).

**Evidência:** quiz 4/5 + explicação espontânea do erro (revelou a origem exata da confusão).

**Implicações:** confusão pontual e isolada, já dissolvida pela régra IP=onde / porta=qual processo.
Item adicionado à fila para checagem a frio em ~21/06. Próximo conteúdo novo = Lição 07 (Amazon S3).
