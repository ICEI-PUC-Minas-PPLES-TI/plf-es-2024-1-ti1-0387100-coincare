const apiUrl = 'http://localhost:3000/items';
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
    event.preventDefault();
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

function handleAdicionarClick(event) {
    event.preventDefault();
    const myTimeout = setTimeout(() => {}, 7000);

    if (!mesAnoInput.value) {
        showPopup('Por favor, selecione o mês e ano.', 'error');
        return;
    }

    const inputGroup = this.closest('.input-group');
    const nome = inputGroup.querySelector('.nome').value;
    const valor = parseFloat(inputGroup.querySelector('.valor').value);
    const categoria = inputGroup.querySelector('.categoria').value;
    const dia = parseInt(inputGroup.querySelector('.dia').value);

    if (!nome || isNaN(valor) || !categoria || isNaN(dia) || dia < 1 || dia > 31) {
        showPopup('Por favor, preencha todos os campos corretamente.', 'error');
        return;
    }

    const tipo = this.dataset.tipo;
    const data = { nome, valor, categoria, dia, mesAno: mesAnoInput.value, tipo };

    saveItem(data);
}

async function saveItem(data) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const item = await response.json();
        updateGrafico();
        showPopup('Item adicionado com sucesso!', 'success');
    } catch (error) {
        showPopup('Erro ao adicionar item.', 'error');
        console.error('Error:', error);
    }
}

async function updateGrafico() {
    const mesAnoSelecionado = mesAnoInput.value;
    if (!mesAnoSelecionado) return;

    try {
        const response = await fetch(`${apiUrl}?mesAno=${mesAnoSelecionado}`);
        const items = await response.json();

        ganhosTotal = items.filter(item => item.tipo === 'ganhos').reduce((acc, item) => acc + item.valor, 0);
        gastosTotal = items.filter(item => item.tipo.startsWith('despesas')).reduce((acc, item) => acc + item.valor, 0);
        const saldoTotal = ganhosTotal - gastosTotal;

        saldoTotalElement.textContent = `SALDO TOTAL: R$${saldoTotal.toFixed(2)}`;
        ganhosTotalElement.textContent = `GANHOS: R$${ganhosTotal.toFixed(2)}`;
        gastosTotalElement.textContent = `GASTOS: R$${gastosTotal.toFixed(2)}`;

        console.log('NNNNNNNNNNNNNNNNNN')
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
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')

    ganhosPath.setAttribute('d', `M100 100 L100 0 A100 100 0 ${ganhosLargeArc} 1 ${ganhosEndX} ${ganhosEndY} Z`);

    if (gastos > 0) {
        const gastosLargeArc = gastosPercent > 180 ? 1 : 0;
        const gastosEndX = 100 + 100 * Math.cos((ganhosPercent + gastosPercent - 90) * Math.PI / 180);
        const gastosEndY = 100 + 100 * Math.sin((ganhosPercent + gastosPercent - 90) * Math.PI / 180);

        gastosPath.setAttribute('d', `M100 100 L${ganhosEndX} ${ganhosEndY} A100 100 0 ${gastosLargeArc} 1 ${gastosEndX} ${gastosEndY} Z`);
    } else {
        gastosPath.setAttribute('d', '');
    }
}

async function handleVerMaisClick() {
    const tipo = this.dataset.tipo;
    const mesAnoSelecionado = mesAnoInput.value;

    if (!mesAnoSelecionado) {
        showPopup('Por favor, selecione o mês e ano.', 'error');
        return;
    }

    try {
        const response = await fetch(`${apiUrl}?mesAno=${mesAnoSelecionado}&tipo=${tipo}`);
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

                const itemText = document.createElement('span');
                itemText.textContent = `${item.nome} - R$${item.valor.toFixed(2)} - ${item.categoria} - Dia: ${item.dia}`;
                itemElement.appendChild(itemText);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Excluir';
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

async function deleteItem(itemId) {
    try {
        const response = await fetch(`${apiUrl}/${itemId}`, { method: 'DELETE' });
        if (response.ok) {
            updateGrafico();
            showPopup('Item excluído com sucesso!', 'success');
            const itemToDelete = document.querySelector(`button[data-id="${itemId}"]`).closest('.item');
            itemToDelete.remove();
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