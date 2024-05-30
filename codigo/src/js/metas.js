const descricao = document.querySelector('#descricao');
const saldoInicial = document.querySelector('#saldo-inicial');
const metaC = document.querySelector('#meta');
const alcancarEm = document.querySelector('#alcancar-em');
const observacao = document.querySelector('#observacoes');
const salvarBtn = document.querySelector('.c-button-save');

const urlBase = 'http://localhost:3000';

function criarMeta(meta) {
  fetch(`${urlBase}/metas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meta),
  })
    .then(res => res.json())
    .then(data => {
      console.log('meta inserida com sucesso!');
    })
    .catch(error => {
      console.error('erro ao inserir meta');
    })
}

salvarBtn.addEventListener('click', () => {
  const campoDescricao = descricao.value;
  const campoSaldoInicial = saldoInicial.value;
  const campoMeta = metaC.value;
  const campoAlcancarEm = alcancarEm.value;
  const campoObservacao = observacao.value;

  const meta = {
    descricao: campoDescricao,
    saldoInicial: campoSaldoInicial,
    meta: campoMeta,
    alcancarEm: campoAlcancarEm,
    status: 'Em andamento',
    observacao: campoObservacao,
    movimentacoes: []
  };

  criarMeta(meta);
})

// Círculo de progresso
const progress = document.querySelector('.card__progress');

var bar = new ProgressBar.Circle(progress, {
  color: '#717171',
  strokeWidth: 7,
  trailWidth: 7,
  easing: 'easeInOut',
  duration: 1400,
  text: {
    autoStyleContainer: false
  },
  from: { color: '#7FC396', width: 7 },
  to: { color: '#7FC396', width: 7 },
  step: function (state, circle) {
    circle.path.setAttribute('stroke', state.color);
    circle.path.setAttribute('stroke-width', state.width);

    var value = Math.round(circle.value() * 100);
    if (value === 0) {
      circle.setText('');
    } else {
      circle.setText(`${value}%`);
    }

  }
});
bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
bar.text.style.fontSize = '2rem';

bar.animate(0.6);