const apiUrl = 'http://localhost:3000/items';
const popupMessage = document.getElementById('popup-message');
const tipoSelecao = document.getElementById('tipoSelecao');
const resumoContainer = document.getElementById('resumoContainer');

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

function verificarDespesasFixas(ganhos) {
  return Math.max(0, 0.6 * ganhos);
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

function criarGrafico(ctx, labels, dataSets, isLarge = false) {
  try {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: dataSets
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        },
        maintainAspectRatio: !isLarge
      }
    });
  } catch (error) {
    alert('Erro ao criar gráfico.');
  }
}

function exibirResumo(tipo, ganhos, despesasFixas, categorias) {
  let melhorCaso, piorCaso, casoAtual;

  if (tipo === 'ganhos') {
    melhorCaso = ganhos;
    piorCaso = 0;
    casoAtual = ganhos;
  } else if (tipo === 'despesas_fixas') {
    melhorCaso = verificarDespesasFixas(ganhos);
    piorCaso = despesasFixas > melhorCaso ? despesasFixas : 0;
    casoAtual = despesasFixas;
  } else {
    const categoria = categorias[tipo];
    if (categoria) {
      const restante = ganhos - despesasFixas;
      melhorCaso = (categoria.min / 100) * restante;
      piorCaso = (categoria.max / 100) * restante;
      casoAtual = categoria.valor;
    }
  }

  resumoContainer.innerHTML = `
    <div>
      <h2>Resumo para ${tipo}</h2>
      <div id="detalhes">
      <p>Melhor Caso: R$ ${melhorCaso.toFixed(2)}</p>
      <p>Pior Caso: R$ ${piorCaso.toFixed(2)}</p>
      <p>Caso Atual: R$ ${casoAtual.toFixed(2)}</p>
      </div>
    </div>
  `;
}

async function createCharts() {
  const items = await fetchData();
  const { ganhos, despesasFixas, despesasVariaveis } = calcularValores(items);
  const restante = ganhos - despesasFixas;

  const melhorCasoDespesasFixas = verificarDespesasFixas(ganhos);
  const categorias = distribuirDespesasVariaveis(despesasVariaveis);

  const labels = ['Despesas Fixas'];
  const melhorCasoData = [melhorCasoDespesasFixas];
  const atualData = [despesasFixas];
  const backgroundColors = [
    despesasFixas > melhorCasoDespesasFixas ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)'
  ];
  const borderColors = [
    despesasFixas > melhorCasoDespesasFixas ? '#E2504C' : 'rgba(54, 162, 235, 1)'
  ];

  Object.keys(categorias).forEach(label => {
    const categoria = categorias[label];
    const melhorCaso = (categoria.min / 100) * restante;
    const alerta = categoria.valor > (categoria.max / 100) * restante;

    labels.push(label);
    melhorCasoData.push(melhorCaso);
    atualData.push(categoria.valor);
    backgroundColors.push(alerta ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)');
    borderColors.push(alerta ? '#E2504C' : 'rgba(54, 162, 235, 1)');
  });

  const chartElement = document.getElementById('chartUnificado');
  const ctx = chartElement.getContext('2d');
  criarGrafico(
    ctx,
    labels,
    [
      {
        label: 'Melhor Caso',
        data: melhorCasoData,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: '#7FC396',
        borderWidth: 1
      },
      {
        label: 'Atual',
        data: atualData,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1
      }
    ],
    true
  );

  tipoSelecao.addEventListener('change', () => {
    exibirResumo(tipoSelecao.value, ganhos, despesasFixas, categorias);
  });

  exibirResumo(tipoSelecao.value, ganhos, despesasFixas, categorias);
}

createCharts();
