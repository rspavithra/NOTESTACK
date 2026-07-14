# Testes Automatizados e DevOps

## Cenário 1 — Persistência de notas

**Dado** que o usuário criou uma nota no NoteStack,  
**Quando** a página é recarregada,  
**Então** a nota deve continuar visível no grid.

## Cenário 2 — Abertura do modal de criação de pasta

**Dado** que o usuário está na página principal do NoteStack,  
**Quando** ele clica no botão `New Folder`,  
**Então** o modal de criação de pasta deve ficar visível.

## Cenário 3 — Exclusão de nota

**Dado** que uma nota foi criada no NoteStack,  
**Quando** o usuário clica no botão `Delete`,  
**Então** a nota deve desaparecer do grid.

## Executando os testes

Primeiro, inicie o projeto:

```bash
npm run dev

## Integração contínua com GitHub Actions

Foi configurada uma pipeline de integração contínua utilizando o
GitHub Actions e a ação oficial do Cypress.

O workflow está localizado em:

`.github/workflows/cypress.yml`

A pipeline é executada automaticamente sempre que uma Pull Request é
aberta ou atualizada com destino à branch `main`.

Durante a execução, a pipeline realiza as seguintes etapas:

1. Baixa o código do repositório;
2. Configura o Node.js;
3. Instala as dependências do projeto;
4. Inicia o servidor Vite na porta 5173;
5. Aguarda a aplicação ficar disponível;
6. Executa os testes E2E com Cypress;
7. Informa se os testes foram aprovados ou reprovados.

A pipeline também pode ser iniciada manualmente pela aba `Actions` do
repositório no GitHub.