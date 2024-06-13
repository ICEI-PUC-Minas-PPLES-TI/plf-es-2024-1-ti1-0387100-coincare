document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'http://localhost:3000/categorias';
    const categoriasTableBody = document.querySelector('#categorias-table tbody');
    const nomeCategoriaInput = document.querySelector('#nome-categoria');
    const percentualMaxInput = document.querySelector('#percentual-max');
    const adicionarButton = document.querySelector('#adicionar');

    function fetchCategorias() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                renderCategorias(data);
            });
    }

    function renderCategorias(categorias) {
        categoriasTableBody.innerHTML = '';
        categorias.forEach((categoria, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${categoria.nome}</td>
                <td>${categoria.percentual}%</td>
                <td><button class="excluir" data-id="${categoria.id}">Excluir</button></td>
            `;
            categoriasTableBody.appendChild(row);
        });

        document.querySelectorAll('.excluir').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                deleteCategoria(id);
            });
        });
    }

    function addCategoria(nome, percentual) {
        const categoria = { nome, percentual };
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoria)
        })
        .then(response => response.json())
        .then(() => {
            fetchCategorias();
        });
    }

    function deleteCategoria(id) {
        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        })
        .then(() => {
            fetchCategorias();
        });
    }

    adicionarButton.addEventListener('click', () => {
        const nome = nomeCategoriaInput.value;
        const percentual = parseFloat(percentualMaxInput.value);

        if (nome && !isNaN(percentual)) {
            addCategoria(nome, percentual);
            nomeCategoriaInput.value = '';
            percentualMaxInput.value = '';
        } else {
            alert('Por favor, preencha todos os campos corretamente.');
        }
    });

    fetchCategorias();
});
