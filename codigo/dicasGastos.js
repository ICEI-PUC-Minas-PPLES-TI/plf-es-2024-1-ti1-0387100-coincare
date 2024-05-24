// URL do JSON Server
const apiUrl = 'http://localhost:3000/items';

// Função para obter dados do JSON Server
async function fetchData() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data;
}

// Função para calcular as despesas e criar os gráficos
async function createCharts() {
  const items = await fetchData();
  
  const ganhos = items.filter(item => item.tipo === 'ganhos').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasFixas = items.filter(item => item.tipo === 'despesas_fixas').reduce((acc, curr) => acc + curr.valor, 0);
  const despesasVariaveis = items.filter(item => item.tipo === 'despesas_variaveis');

  const restante = ganhos - despesasFixas;

  // Verificar se as despesas fixas ultrapassam 60% dos ganhos
  if (despesasFixas > (0.6 * ganhos)) {
    alert('Atenção: Despesas fixas ultrapassam 60% dos ganhos!');
  }

  const categorias = {
    'Lazer e Entretenimento': { min: 5, max: 10, valor: 0 },
    'Vestuário': { min: 3, max: 5, valor: 0 },
    'Despesas Pessoais': { min: 5, max: 10, valor: 0 },
    'Poupança e Investimentos': { min: 10, max: 20, valor: 0 }
  };

  // Distribuindo despesas variáveis nas categorias
  despesasVariaveis.forEach(despesa => {
    if (categorias[despesa.categoria]) {
      categorias[despesa.categoria].valor += despesa.valor;
    }
  });

  const labels = Object.keys(categorias);
  const melhorCasoData = labels.map(label => (categorias[label].min / 100) * restante);
  const atualData = labels.map(label => categorias[label].valor);
  const alertas = labels.map((label, index) => atualData[index] > (categorias[label].max / 100) * restante);

  // Calcular melhor caso para despesas fixas (até 60% dos ganhos)
  const melhorCasoDespesasFixas = 0.6 * ganhos;
  const alertaDespesasFixas = despesasFixas > melhorCasoDespesasFixas;

  // Criar gráfico para Despesas Fixas
  const ctxDespesasFixas = document.getElementById('chartDespesasFixas').getContext('2d');
  new Chart(ctxDespesasFixas, {
    type: 'bar',
    data: {
      labels: ['Despesas Fixas'],
      datasets: [
        {
          label: 'Melhor Caso',
          data: [melhorCasoDespesasFixas],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Atual',
          data: [despesasFixas],
          backgroundColor: alertaDespesasFixas ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
          borderColor: alertaDespesasFixas ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
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

  // Criar picklist para Despesas Fixas
  const picklistDespesasFixas = document.getElementById('picklistDespesasFixas');
  picklistDespesasFixas.innerHTML = `<strong>Despesas Fixas</strong><br>Melhor Caso: R$ ${melhorCasoDespesasFixas.toFixed(2)}<br>Atual: R$ ${despesasFixas.toFixed(2)}`;

  // Criar gráficos e picklists para cada categoria de despesa variável
  const chartsVariaveis = document.getElementById('chartsVariaveis');
  labels.forEach((label, index) => {
    const chartWrapper = document.createElement('div');
    chartWrapper.classList.add('chart-container');
    chartWrapper.innerHTML = `
      <div class="chart-wrapper">
        <canvas id="chart${label.replace(/\s/g, '')}"></canvas>
        <div class="picklist" id="picklist${label.replace(/\s/g, '')}"></div>
      </div>
    `;
    chartsVariaveis.appendChild(chartWrapper);

    // Criar gráfico
    const ctx = chartWrapper.querySelector(`#chart${label.replace(/\s/g, '')}`).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [label],
        datasets: [
          {
            label: 'Melhor Caso',
            data: [melhorCasoData[index]],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Atual',
            data: [atualData[index]],
            backgroundColor: alertas[index] ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
            borderColor: alertas[index] ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
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

    // Criar picklist
    const picklist = chartWrapper.querySelector(`#picklist${label.replace(/\s/g, '')}`);
    picklist.innerHTML = `<strong>${label}</strong><br>Melhor Caso: R$ ${melhorCasoData[index].toFixed(2)}<br>Atual: R$ ${atualData[index].toFixed(2)}`;
  });
}

// Criar gráficos ao carregar a página
createCharts();
