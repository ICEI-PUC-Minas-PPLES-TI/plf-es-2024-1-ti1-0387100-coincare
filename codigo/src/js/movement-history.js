// TODO
// Buscar dados - OK
// Validar datas - OK
// Filtrar entre datas
// Filtragem rápida
// Ordenar

const inputsDateElement = document.querySelectorAll('.c-input-date');
const searchBtn = document.querySelector('.c-button--search');
const tbodyElement = document.querySelector('tbody');

const URL_BASE = 'http://localhost:3000/movimentacoes';

function createAndAppendTd(parent, text) {
  const td = document.createElement('td');
  td.innerText = text;
  parent.appendChild(td);
}

function populateTable(movements) {

  movements.forEach(item => {

    const tr = document.createElement('tr');

    createAndAppendTd(tr, item.id);
    createAndAppendTd(tr, item.tipo === 'G' ? 'Receita' : 'Despesa');
    createAndAppendTd(tr, item.descricao);
    createAndAppendTd(tr, item.categoria);
    createAndAppendTd(tr, item.valor.toFixed(2));
    createAndAppendTd(tr, `${item.mes_ano}-${item.dia}`)

    tbodyElement.appendChild(tr);
  });
}

function dateIsValid(date) {
  const dateValue = date.value;
  const parsedDate = dateFns.parseISO(dateValue);
  return dateFns.isValid(parsedDate);
}

async function getAll() {

  try {

    const response = await fetch(URL_BASE);

    if (!response.ok) throw new Error('Não foi possível carregar os dados!');

    const movements = await response.json();

    populateTable(movements);

  } catch (error) {

    console.log(error);

  }
}

searchBtn.addEventListener("click", () => {
  const allDatesAreValid = Array.from(inputsDateElement).every(date => dateIsValid(date));
  if (allDatesAreValid) {
    getAll();
  } else {
    alert('Data(s) inválidas!');
  }
});