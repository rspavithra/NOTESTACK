# Padrões, Smells e Refatoração (Caminho B)

Este documento explica os problemas encontrados no nosso código usando o validador SonarQube Cloud e como nós resolvemos cada um deles de forma simples e direta.

---

## 1. Code Smells Identificados 

Estes são os três pontos que deixavam o nosso código desorganizado ou cansativo de ler, mas que já foram corrigidos:

### 1.1. Código Muito Empurrado para a Direita (Nested If)
* **Trecho do código:** `script.js` (Perto da linha 362, dentro da função `restoreNote`)

```javascript
if (document.getElementById("trashView").style.display === "block") {
    renderTrash();
} else {
    if (currentFilter !== "all") {
        filterNotesByCategory(currentFilter);
    } else {
        renderNotes(searchInput.value);
    }
}
```

* **Problema identificado:** O SonarQube avisou que havia um if sozinho escondido dentro de um bloco else. Isso deixa o código "aninhado" (com muitas chaves uma dentro da outra e o texto empurrado para a direita). Quanto mais o código fica assim, mais difícil e demorado é para o desenvolvedor ler e entender para onde o sistema está indo.

* **Solução proposta/aplicada:** Nós juntamos o else com o if de baixo, transformando tudo em um else if (currentFilter !== "all") direto. Isso eliminou chaves que não serviam para nada, deixou o código em linha reta e muito mais bonito de ler.

```javascript
if (document.getElementById("trashView").style.display === "block") {
    renderTrash();
} else if (currentFilter !== "all") {
    filterNotesByCategory(currentFilter);
} else {
    renderNotes(searchInput.value);
}
```

### 1.2. Falta do Operador Ponto Interrogação (Optional Chaining)
* **Trecho do código:** `script.js` (Linha 55, dentro da função `filterNotesByCategory`)

```javascript
const filtered = notes.filter(note =>
    (note.labels && note.labels.includes(category)) ||
    (note.folder === category)
);
```
* **Problema identificado:** O SonarQube apontou que o código usava uma checagem dupla antiga com o operador && (note.labels && note.labels...) só para testar se a nota tinha alguma etiqueta antes de pesquisar dentro dela. Isso deixava a linha gigante, poluída e cansativa sem necessidade.

* **Solução proposta/aplicada:** Nós trocamos toda essa checagem manual pelo operador moderno de ponto de interrogação e ponto do JavaScript (?.). A linha foi reduzida para note.labels?.includes(category). O sistema faz exatamente a mesma coisa, mas o código ficou muito mais curto, limpo e seguro contra erros de dados vazios.

```javascript
const filtered = notes.filter(note =>
    note.labels?.includes(category) || (note.folder === category)
);
```


### 1.3. Palavra "return" Sobrando no Código (Redundant Jump)
* **Trecho do código:** `script.js` (Linha 596, dentro do atalho da tecla "Escape")

```javascript
// ESC → Limpar pesquisa
if (e.key === "Escape") {
    searchInput.value = "";
    renderNotes();
    return;
}
```

* **Problema identificado:** O SonarQube avisou que a palavra return; ali no final do bloco do "Escape" estava sobrando. Como esse if já era a última coisa que acontecia ali dentro, o comando não mudava nada na prática. Era um pedaço de "código morto".

* **Solução proposta/aplicada:** A solução foi apenas apagar a palavra return; da linha 596. Agora, quando o usuário aperta a tecla Escape, o sistema limpa o campo, atualiza as notas e fecha a função sozinho e naturalmente, sem precisar de uma linha inútil ocupando espaço.

```javascript

// ESC → Limpar pesquisa
if (e.key === "Escape") {
    searchInput.value = "";
    renderNotes();
}
```
## 2. Padrões de Projeto Sugeridos 

Para tirar as funções de banco de dados e os comandos de HTML que estão misturados no meio do arquivo `script.js`, sugerimos a aplicação de dois padrões de projeto simples na próxima etapa:

### 2.1. Padrão Criacional: Singleton
* **Onde será sugerido/aplicado:** Na parte do código que mexe com o `localStorage` (salvar e buscar notas).
* **A sugestão do que deve ser feito:** 1. Criar uma classe única chamada `NoteStorage` com uma checagem no construtor para garantir apenas uma cópia na memória.
  2. Mover o comando `localStorage.setItem` para dentro de um método dessa classe.
  3. Alterar as funções do sistema para que elas salvem os dados chamando esse gerenciador centralizado.
* **Justificativa simples:** Atualmente, as funções de salvar e ler dados estão espalhadas pelo arquivo. O **Singleton** serve para criar uma classe única responsável por cuidar do banco de dados local. Isso segue o princípio **SRP (Responsabilidade Única)** do SOLID, garantindo que o código de salvar notas fique em um lugar só e não duplicado.

---

### 2.2. Padrão Estrutural: Facade (Fachada)
* **Onde será sugerido/aplicado:** Na parte do código que mexe com o HTML da tela (como `document.getElementById` e `innerHTML`).
* **A sugestão do que deve ser feito:** 1. Criar uma classe utilitária chamada `UIManager` para concentrar as alterações de layout.
  2. Criar uma função dentro dela para atualizar os elementos da tela, escondendo o uso direto do `.innerHTML`.
  3. Substituir as linhas de manipulação direta de tela por uma chamada para essa nova classe da Fachada.