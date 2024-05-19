// TODO
// Buscar dados - OK
// Validar datas - OK
// Filtrar entre datas - OK
// Filtragem rápida
// Ordenar
// Exibir mensagem caso não for encontrado nenhum registro - OK
// Esconder tabela antes do usuário pesquisar
// Totalizador

const inputsDateElement = document.querySelectorAll('.c-input-date');
const searchBtn = document.querySelector('.c-button--search');
const dataNotFound = document.querySelector('.main__data-not-found');
const tbodyElement = document.querySelector('tbody');

const URL_BASE = 'http://localhost:3000/movimentacoes';

function createAndAppendTd(parent, text) {
  const td = document.createElement('td');
  td.innerText = text;
  parent.appendChild(td);
}

function populateTable(movements) {

  tbodyElement.innerText = '';

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

function filterData(data) {
  const initialDate = inputsDateElement[0].value;
  const finalDate = inputsDateElement[1].value;

  const filteredData = data.filter((data) => `${data.mes_ano}-${data.dia}` >= initialDate && `${data.mes_ano}-${data.dia}` <= finalDate);

  if (filteredData.length == 0) {
    dataNotFound.innerText = 'Não foi encontrado resultados para essa pesquisa';
    return;
  }

  populateTable(filteredData);
}

async function getAll() {

  try {

    const response = await fetch(URL_BASE);

    if (!response.ok) throw new Error('Não foi possível carregar os dados!');

    const movements = await response.json();

    filterData(movements);

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