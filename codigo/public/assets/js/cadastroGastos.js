const apiUrl = '/items';
const mesAnoInput = document.getElementById('mes-ano');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const itemsList = document.getElementById('items-list');
const saldoTotalElement = document.getElementById('saldo-total');
const ganhosTotalElement = document.getElementById('ganhos-total');
const gastosTotalElement = document.getElementById('gastos-total');
const ganhosPath = document.getElementById('ganhos-path');
const gastosPath = document.getElementById('gastos-path');
const popupMessage = document.getElementById('popup-message');

let ganhosTotal = 0;
let gastosTotal = 0;

document.querySelectorAll('.adicionar').forEach(button => {
    button.addEventListener('click', handleAdicionarClick);
});

document.querySelectorAll('.ver-mais').forEach(button => {
    button.addEventListener('click', handleVerMaisClick);
});

mesAnoInput.addEventListener('change', updateGrafico);
closeModal.addEventListener('click', (e) => {
    e.preventDefault();
    modal.style.display = 'none';
});
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

function getUserId() {
    const user = sessionStorage.getItem('usuarioCorrente');
    const userObject = JSON.parse(user);
    return userObject.id;
  }

function handleAdicionarClick(event) {
    event.preventDefault();

    if (!mesAnoInput.value) {
        showPopup('Por favor, selecione o mês e ano.', 'error');
        return;
    }

    const inputGroup = this.closest('.input-group');
    const nome = inputGroup.querySelector('.nome').value;
    const valor = parseFloat(inputGroup.querySelector('.valor').value);
    const categoria = inputGroup.querySelector('.categoria').value;
    const dia = parseInt(inputGroup.querySelector('.dia').value);
    const userId = getUserId();

    if (!nome || isNaN(valor) || !categoria || isNaN(dia) || dia < 1 || dia > 31) {
        showPopup('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }

    const tipo = this.dataset.tipo;
    const data = { id: generateId(), nome, valor, categoria, dia, mesAno: mesAnoInput.value, tipo, userId: userId };

    saveItem(data);
    clearInputFields(inputGroup);
}

function clearInputFields(inputGroup) {
    inputGroup.querySelectorAll('input').forEach(input => input.value = '');
}

async function saveItem(data) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            updateGrafico();
            showPopup('Item adicionado com sucesso!', 'success');
        } else {
            showPopup('Erro ao adicionar item.', 'error');
        }
    } catch (error) {
        showPopup('Erro ao adicionar item.', 'error');
        console.error('Error:', error);
    }
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

async function updateGrafico() {
    const mesAnoSelecionado = mesAnoInput.value;
    const userId = getUserId();
    if (!mesAnoSelecionado) return;

    try {
        const response = await fetch(`${apiUrl}?userId=${userId}&mesAno=${mesAnoSelecionado}`);
        const items = await response.json();

        ganhosTotal = items.filter(item => item.tipo === 'ganhos').reduce((acc, item) => acc + item.valor, 0);
        gastosTotal = items.filter(item => item.tipo.startsWith('despesas')).reduce((acc, item) => acc + item.valor, 0);
        const saldoTotal = ganhosTotal - gastosTotal;

        saldoTotalElement.textContent = `SALDO TOTAL: R$${saldoTotal.toFixed(2)}`;

        const ganhosTotalSpan = document.createElement('span');
        ganhosTotalSpan.textContent = `GANHOS: R$${ganhosTotal.toFixed(2)}`;
        ganhosTotalElement.innerHTML = '<span class="legenda-cor" style="background-color: #7FC396;"></span>';
        ganhosTotalElement.appendChild(ganhosTotalSpan);

        const gastosTotalSpan = document.createElement('span');
        gastosTotalSpan.textContent = `GASTOS: R$${gastosTotal.toFixed(2)}`;
        gastosTotalElement.innerHTML = '<span class="legenda-cor" style="background-color: #E2504C;"></span>';
        gastosTotalElement.appendChild(gastosTotalSpan);

        renderGrafico(ganhosTotal, gastosTotal);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderGrafico(ganhos, gastos) {
    const total = ganhos + gastos;
    const ganhosPercent = (ganhos / total) * 360;
    const gastosPercent = (gastos / total) * 360;

    const ganhosLargeArc = ganhosPercent > 180 ? 1 : 0;
    const ganhosEndX = 100 + 100 * Math.cos((ganhosPercent - 90) * Math.PI / 180);
    const ganhosEndY = 100 + 100 * Math.sin((ganhosPercent - 90) * Math.PI / 180);

    ganhosPath.setAttribute('d', `M100 100 L100 0 A100 100 0 ${ganhosLargeArc} 1 ${ganhosEndX} ${ganhosEndY} Z`);
    ganhosPath.setAttribute('fill', '#7FC396');

    if (gastos > 0) {
        const gastosLargeArc = gastosPercent > 180 ? 1 : 0;
        const gastosEndX = 100 + 100 * Math.cos((ganhosPercent + gastosPercent - 90) * Math.PI / 180);
        const gastosEndY = 100 + 100 * Math.sin((ganhosPercent + gastosPercent - 90) * Math.PI / 180);

        gastosPath.setAttribute('d', `M100 100 L${ganhosEndX} ${ganhosEndY} A100 100 0 ${gastosLargeArc} 1 ${gastosEndX} ${gastosEndY} Z`);
        gastosPath.setAttribute('fill', '#E2504C');
    } else {
        gastosPath.setAttribute('d', '');
    }
}

async function handleVerMaisClick() {
    const tipo = this.dataset.tipo;
    const userId = getUserId();
    const mesAnoSelecionado = mesAnoInput.value;

    if (!mesAnoSelecionado) {
        showPopup('Por favor, selecione o mês e ano.', 'error');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}?userId=${userId}&mesAno=${mesAnoSelecionado}&tipo=${tipo}`);
        const items = await response.json();

        itemsList.innerHTML = '';
        if (items.length === 0) {
            showPopup('Não há itens para exibir.', 'info');
            return;
        }

        items.forEach(item => {
            if (item.tipo === tipo) {
                const itemElement = document.createElement('div');
                itemElement.classList.add('item');
                itemElement.dataset.item = JSON.stringify(item);

                const nomeGroup = document.createElement('div');
                nomeGroup.classList.add('input-group');
                const nomeLabel = document.createElement('label');
                nomeLabel.textContent = 'Nome';
                const nomeInput = document.createElement('input');
                nomeInput.type = 'text';
                nomeInput.classList.add('input-field');
                nomeInput.value = item.nome;
                nomeInput.disabled = true; 
                nomeGroup.appendChild(nomeLabel);
                nomeGroup.appendChild(nomeInput);
                itemElement.appendChild(nomeGroup);

                const valorGroup = document.createElement('div');
                valorGroup.classList.add('input-group');
                const valorLabel = document.createElement('label');
                valorLabel.textContent = 'Valor';
                const valorInput = document.createElement('input');
                valorInput.type = 'text';
                valorInput.classList.add('input-field');
                valorInput.value = item.valor;
                valorInput.disabled = true;  
                valorGroup.appendChild(valorLabel);
                valorGroup.appendChild(valorInput);
                itemElement.appendChild(valorGroup);

                const categoriaGroup = document.createElement('div');
                categoriaGroup.classList.add('input-group');
                const categoriaLabel = document.createElement('label');
                categoriaLabel.textContent = 'Categoria';
                const categoriaInput = document.createElement('input');
                categoriaInput.type = 'text';
                categoriaInput.classList.add('input-field');
                categoriaInput.value = item.categoria;
                categoriaInput.disabled = true;  
                categoriaGroup.appendChild(categoriaLabel);
                categoriaGroup.appendChild(categoriaInput);
                itemElement.appendChild(categoriaGroup);

                const diaGroup = document.createElement('div');
                diaGroup.classList.add('input-group');
                const diaLabel = document.createElement('label');
                diaLabel.textContent = 'Dia';
                const diaInput = document.createElement('input');
                diaInput.type = 'text';
                diaInput.classList.add('input-field');
                diaInput.value = item.dia;
                diaInput.disabled = true;
                diaGroup.appendChild(diaLabel);
                diaGroup.appendChild(diaInput);
                itemElement.appendChild(diaGroup);

                const editButton = document.createElement('button');
                editButton.textContent = 'Editar';
                editButton.classList.add('edit-button');
                editButton.dataset.id = item.id;
                editButton.addEventListener('click', () => enableEditMode(itemElement, item.id));
                itemElement.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
                deleteButton.classList.add('delete-button');
                deleteButton.dataset.id = item.id;
                deleteButton.addEventListener('click', () => deleteItem(item.id));
                itemElement.appendChild(deleteButton);

                itemsList.appendChild(itemElement);
            }
        });
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
    }
}

function enableEditMode(itemElement, itemId) {
    const inputs = itemElement.querySelectorAll('.input-field');
    inputs.forEach(input => input.disabled = false);

    const editButton = itemElement.querySelector('.edit-button');
    editButton.textContent = 'Salvar';
    editButton.removeEventListener('click', () => enableEditMode(itemElement, itemId));
    editButton.addEventListener('click', () => saveItemEdit(itemElement, itemId));
}

async function saveItemEdit(itemElement, itemId) {
    const inputs = itemElement.querySelectorAll('.input-field');
    const originalItem = JSON.parse(itemElement.dataset.item);
    const userId = getUserId();

    const updatedItem = {
        id: itemId,
        nome: inputs[0].value,
        valor: parseFloat(inputs[1].value),
        categoria: inputs[2].value,
        dia: parseInt(inputs[3].value, 10),
        mesAno: originalItem.mesAno,
        tipo: originalItem.tipo,
        userId: userId
    };

    try {
        const response = await fetch(`${apiUrl}/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedItem)
        });
        if (response.ok) {
            showPopup('Item atualizado com sucesso!', 'success');
            updateGrafico();
            inputs.forEach(input => input.disabled = true);

            const editButton = itemElement.querySelector('.edit-button');
            editButton.textContent = 'Editar';
            editButton.removeEventListener('click', () => saveItemEdit(itemElement, itemId));
            editButton.addEventListener('click', () => enableEditMode(itemElement, itemId));
        } else {
            showPopup('Erro ao atualizar item.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Erro ao atualizar item.', 'error');
    }
}

async function deleteItem(itemId) {
    try {
        const response = await fetch(`${apiUrl}/${itemId}`, { method: 'DELETE' });
        if (response.ok) {
            showPopup('Item excluído com sucesso!', 'success');
            const itemToDelete = document.querySelector(`button[data-id="${itemId}"]`).closest('.item');
            itemToDelete.remove();
            updateGrafico();
        } else {
            showPopup('Erro ao excluir item.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showPopup('Erro ao excluir item.', 'error');
    }
}

function showPopup(message, type) {
    popupMessage.className = `popup ${type}`;
    popupMessage.innerText = message;
    popupMessage.style.display = 'block';
    setTimeout(() => {
        popupMessage.style.display = 'none';
    }, 3000);
}
