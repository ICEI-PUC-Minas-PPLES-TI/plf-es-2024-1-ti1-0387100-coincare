const apiUrl = 'http://localhost:3000/items';
const popupMessage = document.getElementById('popup-message');

async function fetchData() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Erro ao carregar dados');
    }
    return await response.json();
  } catch (error) {
    alert('Erro ao carregar dados.');
    return [];
  }
}

function calcularValores(items) {
  const ganhos = items.filter(item => item.tipo === 'ganhos').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasFixas = items.filter(item => item.tipo === 'despesas_fixas').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasVariaveis = items.filter(item => item.tipo === 'despesas_variaveis');
  return { ganhos, despesasFixas, despesasVariaveis };
}

function verificarDespesasFixas(ganhos, despesasFixas) {
  return 0.6 * ganhos;
}

function distribuirDespesasVariaveis(despesasVariaveis) {
  const categorias = {
    'Lazer e Entretenimento': { min: 5, max: 10, valor: 0 },
    'Vestuário': { min: 3, max: 5, valor: 0 },
    'Despesas Pessoais': { min: 5, max: 10, valor: 0 },
    'Poupança e Investimentos': { min: 10, max: 20, valor: 0 }
  };

  despesasVariaveis.forEach(despesa => {
    if (categorias[despesa.categoria]) {
      categorias[despesa.categoria].valor += despesa.valor;
    }
  });

  return categorias;
}

function criarGrafico(ctx, label, melhorCaso, atual, alerta) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [label],
      datasets: [
        {
          label: 'Melhor Caso',
          data: [melhorCaso],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: '#7FC396',
          borderWidth: 1
        },
        {
          label: 'Atual',
          data: [atual],
          backgroundColor: alerta ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
          borderColor: alerta ? '#E2504C' : 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function criarPicklist(elementId, label, melhorCaso, atual) {
  const picklist = document.getElementById(elementId);
  picklist.innerHTML = `<strong>${label}</strong><br>Melhor Caso: R$ ${melhorCaso.toFixed(2)}<br>Atual: R$ ${atual.toFixed(2)}`;
}

async function createCharts() {
  const items = await fetchData();
  const { ganhos, despesasFixas, despesasVariaveis } = calcularValores(items);
  const restante = ganhos - despesasFixas;

  const melhorCasoDespesasFixas = verificarDespesasFixas(ganhos, despesasFixas);
  const categorias = distribuirDespesasVariaveis(despesasVariaveis);

  criarGrafico(document.getElementById('chartDespesasFixas').getContext('2d'), 'Despesas Fixas', melhorCasoDespesasFixas, despesasFixas, despesasFixas > melhorCasoDespesasFixas);
  criarPicklist('picklistDespesasFixas', 'Despesas Fixas', melhorCasoDespesasFixas, despesasFixas);

  const chartsVariaveis = document.getElementById('chartsVariaveis');
  Object.keys(categorias).forEach(label => {
    const categoria = categorias[label];
    const melhorCaso = (categoria.min / 100) * restante;
    const alerta = categoria.valor > (categoria.max / 100) * restante;

    const chartWrapper = document.createElement('div');
    chartWrapper.classList.add('chart-container');
    chartWrapper.innerHTML = `
      <div class="chart-wrapper">
        <canvas id="chart${label.replace(/\s/g, '')}"></canvas>
        <div class="picklist" id="picklist${label.replace(/\s/g, '')}"></div>
      </div>
    `;
    chartsVariaveis.appendChild(chartWrapper);

    criarGrafico(chartWrapper.querySelector(`#chart${label.replace(/\s/g, '')}`).getContext('2d'), label, melhorCaso, categoria.valor, alerta);
    criarPicklist(`picklist${label.replace(/\s/g, '')}`, label, melhorCaso, categoria.valor);
  });
}

createCharts();
