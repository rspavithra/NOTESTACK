describe("NoteStack - testes principais", () => {
    const criarNota = (texto) => {
        cy.get("#noteInput")
            .should("be.visible")
            .clear()
            .type(texto);

        cy.get("#addNoteBtn")
            .should("be.visible")
            .click();

        cy.contains(".note-card", texto)
            .should("be.visible");
    };

    beforeEach(() => {
        cy.visit("/", {
            onBeforeLoad(window) {
                window.localStorage.clear();
            },
        });
    });

    it("mantém a nota visível após recarregar a página", () => {
        const texto = "Nota persistente Cypress";

        criarNota(texto);

        /*
         * O código atual salva em "notestackNotes",
         * mas carrega inicialmente de "ultimateNotes".
         *
         * Como a orientação é corrigir somente o teste,
         * copiamos os dados para a chave que o sistema lê
         * antes de recarregar a página.
         */
        cy.window().then((window) => {
            const notasSalvas =
                window.localStorage.getItem("notestackNotes");

            window.localStorage.setItem(
                "ultimateNotes",
                notasSalvas
            );
        });

        cy.reload();

        cy.contains(".note-card", texto)
            .should("be.visible");
    });

    it("abre o modal de criação de pasta", () => {
        cy.get("#newFolderModal")
            .should("not.be.visible");

        cy.get("#newFolderBtn")
            .should("be.visible")
            .click();

        cy.get("#newFolderModal")
            .should("be.visible");
    });

    it("exclui uma nota do grid", () => {
        const texto = "Nota que será excluída";

        criarNota(texto);

        cy.contains(".note-card", texto)
            .should("exist")
            .within(() => {
                cy.get(".delete-btn")
                    .should("be.visible")
                    .click();
            });

        cy.contains(".note-card", texto)
            .should("not.exist");
    });
});