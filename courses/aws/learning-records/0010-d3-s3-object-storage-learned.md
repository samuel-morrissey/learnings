# Amazon S3 e armazenamento de objetos — APRENDIDO (D3)

Samuel estudou a Lição 07 (Amazon S3) e a praticou por produção em 19/06.

## Evidência
- Quiz: não registrado por questão, mas o teach-back escrito foi **completo e correto** sem consulta.
- Teach-back cobriu, com as palavras dele: EBS (bloco, preso a uma instância) → EFS (file,
  compartilhado) vs S3 (objeto, isolado/independente); bucket com **nome único mundial** registrado
  **em uma região**; objeto = dados + metadados até **5 TB** com **cópias em várias AZs** → **11 noves**;
  identificação por **bucket + key**, acesso via **HTTP**.
- Fechou sozinho a distinção que mais cai na prova: **durabilidade ("não perco", 11 noves) vs
  disponibilidade ("consigo acessar agora", ~4 noves)**, com a leitura certa da assimetria (acesso pode
  falhar mais vezes que a perda do dado).

## Correção aplicada (afinação, não erro)
Ele disse que o EBS "nasce e morre com a instância". Ajustado: é o **padrão** do disco-raiz
(`delete-on-termination`); um volume EBS **pode** persistir e ser reanexado. O ponto que importa
permanece: EBS é **preso a uma instância por vez**, não é storage compartilhado/durável.

## Implicações
- Mantém o padrão de alta retenção e gosto pelo "porquê" — a analogia "S3 = hash map gerenciado
  (key→objeto via HTTP)" pegou bem no cérebro de dev.
- Seção **Storage** criada no [[GLOSSARY]] a partir do cheat sheet dele (autoria preservada).
- Item S3 adicionado à fila de revisão (checagem a frio ~30/06).
- **Próximo conteúdo novo = Lição 08: classes de armazenamento do S3** (custo × frequência de acesso) —
  deliberadamente separado por ser o sub-tópico de S3 mais cobrado. Ver [[0005-d3-ec2-purchase-models]]
  para o mesmo padrão "casar carga ↔ modelo".
