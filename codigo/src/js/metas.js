// TO DO
// Ideal por mês
// Regex no campo de moeda
// Concluir meta quando atigit 100%
// Alterar o título no modal de edição
// Inserir o nome da meta no modal de depósito
// Sugerir data atual no modal de depósito
// Validação de campos

const descricao = document.querySelector('#descricao');
const saldoInicial = document.querySelector('#saldo-inicial');
const metaC = document.querySelector('#meta');
const alcancarEm = document.querySelector('#alcancar-em');
const observacao = document.querySelector('#observacoes');
const salvarBtn = document.querySelector('.c-button-save');

const descricaoDeposito = document.querySelector('#descricao-deposit');
const valorDeposito = document.querySelector('#valor-deposit');
const tipoDeposito = document.querySelector('#tipo-deposit');
const dataDeposito = document.querySelector('#data-deposit');
const depositarBtn = document.querySelector('.c-button-deposit');

const incluirBtn = document.querySelector('.c-button[data-bs-toggle="modal"]');
const cardsContainer = document.querySelector('#card-wrapper');

const urlBase = 'http://localhost:3000';
let editingMetaId = null;
let currentMetaId = null;

function limparFormulario() {
  descricao.value = '';
  saldoInicial.value = '';
  metaC.value = '';
  alcancarEm.value = '';
  observacao.value = '';
}

async function criarMeta(meta) {
  try {
    const res = await fetch(`${urlBase}/metas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });
    const data = await res.json();
    console.log('Meta inserida com sucesso!');
    criarCards();
  } catch (error) {
    console.error('Erro ao inserir meta');
  }
}

async function atualizarMeta(meta) {
  try {
    const res = await fetch(`${urlBase}/metas/${meta.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });
    const data = await res.json();
    console.log('Meta atualizada com sucesso!');
    criarCards();
  } catch (error) {
    console.error('Erro ao atualizar meta');
  }
}

async function excluirMeta(metaId) {
  try {
    await fetch(`${urlBase}/metas/${metaId}`, {
      method: 'DELETE',
    });
    console.log('Meta excluída com sucesso!');
    document.querySelector(`[data-index='${metaId}']`).remove();

    Swal.fire({
      title: 'Excluído!',
      text: 'A meta foi excluída.',
      icon: 'success',
      showConfirmButton: true,
      confirmButtonColor: '#7FC396',
      customClass: {
        container: 'custom-swal-container',
        title: 'custom-swal-title',
        text: 'custom-swal-text'
      }
    }
    ).then(() => {
      location.reload();
    });
  } catch (error) {
    console.error('Erro ao excluir meta');
  }
}

async function confirmarExclusao(metaId) {
  const result = await Swal.fire({
    title: 'Tem certeza?',
    text: "Você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#C63637',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar',
    customClass: {
      container: 'custom-swal-container',
      title: 'custom-swal-title',
      text: 'custom-swal-text',
      confirmButton: 'custom-swal-confirm-button',
      cancelButton: 'custom-swal-cancel-button'
    }
  });

  if (result.isConfirmed) {
    excluirMeta(metaId);
  }
}

function editarMeta(meta) {
  descricao.value = meta.descricao;
  saldoInicial.value = meta.saldoInicial;
  metaC.value = meta.meta;
  alcancarEm.value = meta.alcancarEm;
  observacao.value = meta.observacoes;
  editingMetaId = meta.id;
  const modal = new bootstrap.Modal(document.getElementById('staticBackdrop'));
  modal.show();
}

async function buscarMetas() {
  const res = await fetch(`${urlBase}/metas`);
  if (!res.ok) throw new Error('Não foi possível buscar as metas');
  return res.json();
}

function criarElemento(tag, classNames, innerText = '') {
  const elemento = document.createElement(tag);
  if (classNames) {
    classNames.split(' ').forEach(className => elemento.classList.add(className));
  }
  if (innerText) elemento.innerText = innerText;
  return elemento;
}

function calcularSaldoAtual(meta) {
  return meta.movimentacoes.reduce((saldo, mov) => {
    return mov.tipo === 'e' ? saldo + mov.valor : saldo - mov.valor;
  }, meta.saldoInicial);
}

async function criarCards() {
  cardsContainer.innerHTML = '';
  try {
    const metas = await buscarMetas();
    metas.forEach(meta => {
      const saldoAtual = calcularSaldoAtual(meta);
      const faltando = meta.meta - saldoAtual;
      const progresso = saldoAtual / meta.meta;

      const card = criarElemento('div', 'card');
      card.setAttribute('data-index', meta.id);

      const cardHeader = criarElemento('div', 'card__header');
      const cardInfo = criarElemento('div', 'card__info');
      const cardTitle = criarElemento('p', 'card__title', meta.descricao);
      const cardDescription = criarElemento('span', 'card__description', meta.observacoes);

      cardInfo.append(cardTitle, cardDescription);

      const cardStatus = criarElemento('div', 'card__status');
      const cardStatusText = criarElemento('p', 'card__status-text', meta.status);

      cardStatus.appendChild(cardStatusText);
      cardHeader.append(cardInfo, cardStatus);

      const cardBody = criarElemento('div', 'card__body');
      const cardBodyContainer = criarElemento('div', 'card__body-container');

      const cardGoal = criarElemento('div', 'card__goal');
      const cardGoalLabel = criarElemento('p', 'card__goal-label', 'Objetivo');
      const cardGoalAmount = criarElemento('p', 'card__goal-amount', meta.meta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      cardGoal.append(cardGoalLabel, cardGoalAmount);

      const cardTarget = criarElemento('div', 'card__target');
      const cardTargetLabel = criarElemento('p', 'card__target-label', 'Espero alcançar em');
      const cardTargetDate = criarElemento('p', 'card__target-date', dateFns.format(dateFns.parseISO(meta.alcancarEm), 'dd/MM/yyyy'));
      cardTarget.append(cardTargetLabel, cardTargetDate);

      const cardMonthly = criarElemento('div', 'card__monthly');
      const cardMonthlyLabel = criarElemento('p', 'card__monthly-label', 'Ideal por mês');
      const cardMonthlyAmount = criarElemento('p', 'card__monthly-amount', 'R$ 180,00');
      cardMonthly.append(cardMonthlyLabel, cardMonthlyAmount);

      const cardProgressWrapper = criarElemento('div', 'card__progress-wrapper');
      const cardProgress = criarElemento('div', 'card__progress');
      const cardProgressMoney = criarElemento('div', 'card__progress-money');
      const cardCurrentAmount = criarElemento('p', 'card__current-amount', saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
      const cardRemainingAmount = criarElemento('p', 'card__remaining-amount', `Faltam ${faltando.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
      cardProgressMoney.append(cardCurrentAmount, cardRemainingAmount);
      cardProgressWrapper.append(cardProgress, cardProgressMoney);

      const cardFooter = criarElemento('div', 'card__footer');
      const cardBtnExcluir = criarElemento('button', 'card__button card__button--delete', 'Excluir');
      const cardBtnEditar = criarElemento('button', 'card__button card__button--edit', 'Editar');
      const cardBtnDepositar = criarElemento('button', 'c-button', 'Depositar');
      cardFooter.append(cardBtnExcluir, cardBtnEditar, cardBtnDepositar);

      cardBodyContainer.append(cardGoal, cardTarget, cardMonthly);
      cardBody.append(cardBodyContainer, cardProgressWrapper);
      card.append(cardHeader, cardBody, cardFooter);

      cardsContainer.appendChild(card);

      cardBtnExcluir.addEventListener('click', () => confirmarExclusao(meta.id));
      cardBtnEditar.addEventListener('click', () => editarMeta(meta));
      cardBtnDepositar.addEventListener('click', () => depositar(meta));

      iniciarProgresso(cardProgress, progresso);
    });
  } catch (error) {
    console.error(error.message);
  }
}

function iniciarProgresso(elemento, valorProgresso) {
  const bar = new ProgressBar.Circle(elemento, {
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

      const value = Math.round(circle.value() * 100);
      circle.setText(value === 0 ? '0%' : `${value}%`);
    }
  });
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = '2rem';

  bar.animate(valorProgresso);
}

function depositar(meta) {
  currentMetaId = meta.id;
  const modal = new bootstrap.Modal(document.getElementById('modalDeposit'));
  modal.show();
}

async function gravarDeposito(metaId, deposito) {
  try {
    const res = await fetch(`${urlBase}/metas/${metaId}`);
    if (!res.ok) throw new Error('Meta não encontrada');
    const meta = await res.json();

    const novaMovimentacao = {
      id: meta.movimentacoes.length ? meta.movimentacoes[meta.movimentacoes.length - 1].id + 1 : 1,
      ...deposito
    };
    meta.movimentacoes.push(novaMovimentacao);

    const atualizarRes = await fetch(`${urlBase}/metas/${metaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });
    if (!atualizarRes.ok) throw new Error('Erro ao atualizar a meta');
    const metaAtualizada = await atualizarRes.json();
    console.log('Movimentação adicionada com sucesso!', metaAtualizada);
    criarCards();
  } catch (error) {
    console.error('Erro ao gravar depósito:', error);
  }
}

salvarBtn.addEventListener('click', () => {
  const meta = {
    descricao: descricao.value,
    saldoInicial: +saldoInicial.value,
    meta: +metaC.value,
    alcancarEm: alcancarEm.value,
    status: 'Em andamento',
    observacoes: observacao.value,
    movimentacoes: [],
  };

  if (editingMetaId) {
    meta.id = editingMetaId;
    atualizarMeta(meta);
    editingMetaId = null;
  } else {
    criarMeta(meta);
  }
});

depositarBtn.addEventListener('click', () => {
  const deposito = {
    descricao: descricaoDeposito.value,
    valor: +valorDeposito.value,
    tipo: tipoDeposito.value,
    data: dataDeposito.value
  }

  gravarDeposito(currentMetaId, deposito);
});

incluirBtn.addEventListener('click', () => {
  limparFormulario();
  editingMetaId = null;
});

window.addEventListener('load', criarCards);