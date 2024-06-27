// TO DO
// Ideal por mês (M)
// Concluir meta quando atingir 100% (M)

const form = document.getElementById('metaForm');
const formEdit = document.getElementById('formEdit');
const formDeposit = document.getElementById('formDeposit');

const descricao = document.querySelector('#descricao');
const saldoInicial = document.querySelector('#saldo-inicial');
const metaC = document.querySelector('#meta');
const alcancarEm = document.querySelector('#alcancar-em');
const observacao = document.querySelector('#observacoes');
const salvarBtn = document.querySelector('.c-button-save');

const descricaoEdit = document.querySelector('#descricao-edit');
const saldoInicialEdit = document.querySelector('#saldo-inicial-edit');
const metaEdit = document.querySelector('#meta-edit');
const alcancarEmEdit = document.querySelector('#alcancar-em-edit');
const observacaoEdit = document.querySelector('#observacoes-edit');
const saveEditBtn = document.querySelector('.c-button-edit');

const labelDeposito = document.querySelector('#modalDepositLabel');
const descricaoDeposito = document.querySelector('#descricao-deposit');
const valorDeposito = document.querySelector('#valor-deposit');
const tipoDeposito = document.querySelector('#tipo-deposit');
const dataDeposito = document.querySelector('#data-deposit');
const depositarBtn = document.querySelector('.c-button-deposit');

const incluirBtn = document.querySelector('.c-button-incluir');
const cardsContainer = document.querySelector('#card-wrapper');

const urlBase = 'http://localhost:3000';
let editingMetaId = null;
let currentMetaId = null;
let modalInstance;

function coinMask(e) {
  let value = e.target.value.replace(/\D/g, '');
  value = (value / 100).toFixed(2);
  e.target.value = value.replace(".", ",");
}

function limparFormulario() {
  descricao.value = '';
  saldoInicial.value = '0,00';
  metaC.value = '0,00';
  alcancarEm.value = '';
  observacao.value = '';
}

function limparFormularioDeposito() {
  descricaoDeposito.value = '';
  valorDeposito.value = '0,00';
  tipoDeposito.value = 'default';
  dataDeposito.value = getCurrentDate();
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
    const res = await fetch(`${urlBase}/metas/${meta.id}`);
    if (!res.ok) throw new Error('Meta não encontrada');
    const metaExistente = await res.json();

    meta.movimentacoes = metaExistente.movimentacoes;
    meta.status = 'Em andamento';

    const atualizarRes = await fetch(`${urlBase}/metas/${meta.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meta),
    });
    const data = await atualizarRes.json();
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
    }).then(() => {
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
  descricaoEdit.value = meta.descricao;
  saldoInicialEdit.value = meta.saldoInicial;
  metaEdit.value = meta.meta;
  alcancarEmEdit.value = meta.alcancarEm;
  observacaoEdit.value = meta.observacoes;
  editingMetaId = meta.id;
  modalInstance = new bootstrap.Modal(document.getElementById('modalEdit'));
  modalInstance.show();
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
  if (!meta.movimentacoes) return meta.saldoInicial;
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
      const cardMonthlyLabel = criarElemento('p', 'card__monthly-label', 'Ideal por mês (dev)');
      const cardMonthlyAmount = criarElemento('p', 'card__monthly-amount', 'Ex.: R$ 180,00');
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
      const cardBtnDepositar = criarElemento('button', 'c-button', 'Lançar movto');
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

function openModalInclude() {
  modalInstance = new bootstrap.Modal(document.getElementById('staticBackdrop'));
  modalInstance.show();
}

function depositar(meta) {
  limparFormularioDeposito();
  currentMetaId = meta.id;
  labelDeposito.innerText = `Depósito: ${meta.descricao}`;
  if (!modalInstance) {
    modalInstance = new bootstrap.Modal(document.getElementById('modalDeposit'));
  }
  modalInstance.show();
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
  if (form.checkValidity()) {
    if (metaC.value == '0,00') {
      alert('Não foi possível gravar pois a meta está definida como zero!');
      return false;
    }
    const meta = {
      descricao: descricao.value,
      saldoInicial: +saldoInicial.value.replace(",", "."),
      meta: +metaC.value.replace(",", "."),
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
    modalInstance.hide();
    modalInstance = null;
  } else {
    form.reportValidity();
  }
});

incluirBtn.addEventListener('click', () => {
  limparFormulario();
  openModalInclude();
  editingMetaId = null;
});

depositarBtn.addEventListener('click', () => {
  if (formDeposit.checkValidity()) {
    if (valorDeposito.value == '0,00') {
      alert('Não é possível lançar movimentação com valor zerado!');
      return false;
    }
    if (tipoDeposito.value == 'default') {
      alert('Selecione qual o tipo de movimentação você está lançando!');
      return;
    }
    const deposito = {
      descricao: descricaoDeposito.value,
      valor: +valorDeposito.value.replace(",", "."),
      tipo: tipoDeposito.value,
      data: dataDeposito.value
    };

    gravarDeposito(currentMetaId, deposito);
    modalInstance.hide();
    modalInstance = null;
  } else {
    formDeposit.reportValidity();
  }
});

saveEditBtn.addEventListener('click', () => {
  if (formEdit.checkValidity()) {
    if (metaEdit.value == '0,00') {
      alert('Não foi possível gravar pois a meta está definida como zero!');
      return false;
    }
    const meta = {
      descricao: descricaoEdit.value,
      saldoInicial: +saldoInicialEdit.value.replace(",", "."),
      meta: +metaEdit.value.replace(",", "."),
      alcancarEm: alcancarEmEdit.value,
      observacoes: observacaoEdit.value,
    };

    meta.id = editingMetaId;
    atualizarMeta(meta);
    modalInstance.hide();
    modalInstance = null;
  } else {
    formEdit.reportValidity();
  }
});

window.addEventListener('load', criarCards);
saldoInicial.addEventListener('input', coinMask);
metaC.addEventListener('input', coinMask);
saldoInicialEdit.addEventListener('input', coinMask);
metaEdit.addEventListener('input', coinMask);
valorDeposito.addEventListener('input', coinMask);
