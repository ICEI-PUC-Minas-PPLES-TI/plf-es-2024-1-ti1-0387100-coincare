// TODO
// Buscar dados - OK
// Validar datas - OK
// Filtrar entre datas - OK
// Filtragem rápida - OK
// Ordenar
// Exibir mensagem caso não for encontrado nenhum registro - OK
// Esconder tabela antes do usuário pesquisar
// Totalizador
// Exibir os dados formatados (valor e data)

const quickFiltersBtn = document.querySelectorAll('.c-button--quick-filter');
const inputsDateElement = document.querySelectorAll('.c-input-date');
const searchBtn = document.querySelector('.c-button--search');
const dataNotFound = document.querySelector('.main__data-not-found');
const tbodyElement = document.querySelector('tbody');
const orderBy = document.querySelector('#order-by');

const URL_BASE = 'http://localhost:3000/movimentacoes';

function getCurrentDateInUTC() {
  const currentDate = new Date();
  return new Date(Date.UTC(
    currentDate.getUTCFullYear(),
    currentDate.getUTCMonth(),
    currentDate.getUTCDate(),
    currentDate.getUTCHours(),
    currentDate.getUTCMinutes(),
    currentDate.getUTCSeconds()
  ));
}

async function setDateInputsAndFetch(startDate, endDate) {
  inputsDateElement[0].value = dateFns.format(startDate, 'yyyy-MM-dd');
  inputsDateElement[1].value = dateFns.format(endDate, 'yyyy-MM-dd');
  const data = await getAll();
  const filteredData = filterData(data);
  populateTable(filteredData);
}

function addQuickFilterEvent(button, startDateFn, endDateFn) {
  button.addEventListener('click', () => {
    const utcCurrentDate = getCurrentDateInUTC();
    const startDate = startDateFn(utcCurrentDate);
    const endDate = endDateFn(utcCurrentDate);
    setDateInputsAndFetch(startDate, endDate);
  });
}

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

  return filteredData;
}

function orderByF(typeOrder, data) {
  switch (typeOrder) {
    case 'transaction-date':
      data.sort((a, b) => {
        const dateA = new Date(`${a.mes_ano}-${a.dia}`);
        const dateB = new Date(`${b.mes_ano}-${b.dia}`);
        return dateB - dateA;
      });
      break;

    case 'highest-value':
      data.sort((a, b) => b.valor - a.valor);
      break;

    case 'lower-value':
      data.sort((a, b) => a.valor - b.valor);
      break;

    case 'description':
      data.sort((a, b) => a.descricao.localeCompare(b.descricao));
      break;
    default:
  }

  populateTable(data);
}

async function getAll() {
  try {
    const response = await fetch(URL_BASE);

    if (!response.ok) throw new Error('Não foi possível carregar os dados!');

    const movements = await response.json();

    return movements;
  } catch (error) {
    console.log(error);
  }
}

searchBtn.addEventListener('click', async () => {
  const allDatesAreValid = Array.from(inputsDateElement).every(date => dateIsValid(date));
  if (allDatesAreValid) {
    const data = await getAll();
    const filteredData = filterData(data);
    populateTable(filteredData);
  } else {
    alert('Data(s) inválidas!');
  }
});

addQuickFilterEvent(quickFiltersBtn[0], date => date, date => date);
addQuickFilterEvent(quickFiltersBtn[1], dateFns.startOfWeek, dateFns.endOfWeek);
addQuickFilterEvent(quickFiltersBtn[2], dateFns.startOfMonth, dateFns.endOfMonth);
addQuickFilterEvent(quickFiltersBtn[3], dateFns.startOfYear, dateFns.endOfYear);

orderBy.addEventListener('change', async () => {
  const data = await getAll();
  const filteredData = filterData(data);

  if (data) {
    orderByF(orderBy.value, filteredData);
  }
})