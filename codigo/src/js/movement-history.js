// TODO
// Buscar dados - OK
// Validar datas - OK
// Filtrar entre datas - OK
// Filtragem rápida - OK
// Ordenar - OK
// Exibir mensagem caso não for encontrado nenhum registro - OK
// Esconder tabela antes do usuário pesquisar - OK
// Totalizador - OK
// Exibir os dados formatados (valor e data) - OK
// Resetar ordenação quando utilizar alguma filtragem rápida - OK

const quickFiltersBtn = document.querySelectorAll('.c-button--quick-filter');
const inputsDateElement = document.querySelectorAll('.c-input-date');
const searchBtn = document.querySelector('.c-button--search');
const dataNotFound = document.querySelector('.main__data-not-found');
const theadElement = document.querySelector('thead');
const tbodyElement = document.querySelector('tbody');
const orderBy = document.querySelector('#order-by');
const containerTotalizer = document.querySelector('.main__total-container');
const spanRevenueTotalizer = document.querySelector('.main__total-value--revenue');
const spanExpenseTotalizer = document.querySelector('.main__total-value--expense');

const URL_BASE = 'http://localhost:3000/movimentacoes';

theadElement.style.visibility = 'hidden';
dataNotFound.style.display = 'none';
containerTotalizer.style.visibility = 'hidden';

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
    orderBy.options[0].selected = true;
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

function populateTotalizer(movements) {
  containerTotalizer.style.visibility = 'visible';

  let revenueTotalizer  = 0;
  let expenseTotalizer = 0;

  movements.forEach(item => {
    if (item.tipo === 'G') {
      revenueTotalizer += item.valor;
    } else {
      expenseTotalizer += item.valor;
    }
  });

  spanRevenueTotalizer.innerText = revenueTotalizer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  spanExpenseTotalizer.innerText = expenseTotalizer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function populateTable(movements) {
  tbodyElement.innerText = '';

  if (!movements || movements.length === 0) {
    theadElement.style.visibility = 'hidden';
    dataNotFound.style.display = 'block';
    containerTotalizer.style.visibility = 'hidden';
    dataNotFound.innerText = 'Não foi encontrado resultados para essa pesquisa';
    return;
  }

  theadElement.style.visibility = 'visible';
  dataNotFound.style.display = 'none';

  movements.forEach(item => {
    const tr = document.createElement('tr');

    createAndAppendTd(tr, item.id);
    createAndAppendTd(tr, item.tipo === 'G' ? 'Receita' : 'Despesa');
    createAndAppendTd(tr, item.descricao);
    createAndAppendTd(tr, item.categoria);
    createAndAppendTd(tr, item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    createAndAppendTd(tr, dateFns.format(new Date(`${item.mes_ano}-${item.dia}`), 'dd/MM/yyyy'));

    tbodyElement.appendChild(tr);
  });

  populateTotalizer(movements);
}

function dateIsValid(date) {
  const dateValue = date.value;
  const parsedDate = dateFns.parseISO(dateValue);
  return dateFns.isValid(parsedDate);
}

function filterData(data) {
  const initialDate = inputsDateElement[0].value;
  const finalDate = inputsDateElement[1].value;

  const filteredData = data.filter(item => {
    const itemDate = `${item.mes_ano}-${item.dia}`;
    return itemDate >= initialDate && itemDate <= finalDate;
  });

  if (filteredData.length === 0) {
    return [];
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
  orderBy.options[0].selected = true;
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

  if (filteredData) {
    orderByF(orderBy.value, filteredData);
  }
});
