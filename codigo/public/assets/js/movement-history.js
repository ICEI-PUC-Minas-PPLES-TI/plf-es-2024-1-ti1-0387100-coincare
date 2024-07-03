const quickFiltersBtn = document.querySelectorAll('.c-button--quick-filter');
const inputsDateElement = document.querySelectorAll('.c-input-date');
const searchBtn = document.querySelector('.c-button--search');
const loadingMessage = document.querySelector('.main__loading');
const dataNotFound = document.querySelector('.main__data-not-found');
const theadElement = document.querySelector('thead');
const tbodyElement = document.querySelector('tbody');
const orderBy = document.querySelector('#order-by');
const containerTotalizer = document.querySelector('.main__total-container');
const spanRevenueTotalizer = document.querySelector('.main__total-value--revenue');
const spanExpenseFixedTotalizer = document.querySelector('.main__total-value--expense-fixed');
const spanVariableExpenseTotalizer = document.querySelector('.main__total-value--variable-expense');

const URL_BASE = '/items';

theadElement.style.display = 'none';
loadingMessage.style.display = 'none';
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
  let expenseFixedTotalizer = 0;
  let variableExpenseFixedTotalizer = 0;

  movements.forEach(item => {
    if (item.tipo === 'ganhos') {
      revenueTotalizer += item.valor;
    } else if (item.tipo === 'despesas_fixas'){
      expenseFixedTotalizer += item.valor;
    } else {
      variableExpenseFixedTotalizer += item.valor;
    }
  });

  spanRevenueTotalizer.innerText = revenueTotalizer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  spanExpenseFixedTotalizer.innerText = expenseFixedTotalizer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  spanVariableExpenseTotalizer.innerText = variableExpenseFixedTotalizer.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function populateTable(movements) {
  tbodyElement.innerText = '';

  if (!movements || movements.length === 0) {
    loadingMessage.style.display = 'none';
    theadElement.style.display = 'none';
    dataNotFound.style.display = 'block';
    containerTotalizer.style.visibility = 'hidden';
    dataNotFound.innerText = 'Não foi encontrado resultados para essa pesquisa';
    return;
  }

  theadElement.style.display = 'table-header-group';
  dataNotFound.style.display = 'none';

  movements.forEach(item => {
    const tr = document.createElement('tr');

    createAndAppendTd(tr, item.id);
    createAndAppendTd(tr, item.tipo === 'ganhos' ? 'Receita' : item.tipo === 'despesas_fixas' ? 'Despesa fixa' : 'Despesa variável');
    createAndAppendTd(tr, item.nome);
    createAndAppendTd(tr, item.categoria);
    createAndAppendTd(tr, item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
    createAndAppendTd(tr, dateFns.format(new Date(`${item.mesAno}-${item.dia}`), 'dd/MM/yyyy'));

    tbodyElement.appendChild(tr);
  });

  loadingMessage.style.display = 'none';
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
    const itemDate = `${item.mesAno}-${item.dia}`;
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
        const dateA = new Date(`${a.mesAno}-${a.dia}`);
        const dateB = new Date(`${b.mesAno}-${b.dia}`);
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
      data.sort((a, b) => a.nome.localeCompare(b.nome));
      break;
    default:
  }

  populateTable(data);
}

function getUserId() {
  const user = sessionStorage.getItem('usuarioCorrente');
  const userObject = JSON.parse(user);
  return userObject.id;
}

async function getAll() {
  loadingMessage.style.display = 'block';

  try {
    const userId = getUserId();
    const response = await fetch(`${URL_BASE}?userId=${userId}`);

    if (!response.ok) throw new Error('Não foi possível carregar os dados!');

    const movements = await response.json();

    return movements;
  } catch (error) {
    console.log(error);
  }
}

searchBtn.addEventListener('click', async () => {
  orderBy.options[0].selected = true;

  if (inputsDateElement[0].value > inputsDateElement[1].value) {
    alert('A data inicial deve ser inferior que a data final!');
    return;
  }

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
