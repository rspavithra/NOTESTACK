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