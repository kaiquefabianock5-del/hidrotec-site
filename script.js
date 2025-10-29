// === SISTEMA DE ABAS COM HISTÓRICO DE NAVEGAÇÃO ===
function mostrarGuia(idGuia) {
    document.querySelectorAll('.guia').forEach(guia => {
        guia.classList.remove('ativa');
    });
    
    const guiaAtiva = document.getElementById(idGuia);
    if (guiaAtiva) {
        guiaAtiva.classList.add('ativa');
        history.pushState(null, '', `#${idGuia}`);
    }
}

// Suporte ao botão "voltar"
window.addEventListener('popstate', function() {
    const hash = window.location.hash.substring(1);
    if (['inicio', 'calendario', 'projeto'].includes(hash)) {
        mostrarGuia(hash);
    } else {
        mostrarGuia('inicio');
    }
});

// =============== CALENDÁRIO AVANÇADO ===============
let dataAtual = new Date();
let eventos = JSON.parse(localStorage.getItem('hidrotecEventos')) || {};

function salvarEventos() {
    localStorage.setItem('hidrotecEventos', JSON.stringify(eventos));
}

renderizarCalendario(); // já chama mostrarEventosDoMes() internamente

function formatarDataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function renderizarCalendario() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const nomeMes = dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('mes-ano-atual').textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);

    const grid = document.getElementById('calendario-grid');
    // Mantém os cabeçalhos (7 primeiros elementos)
    while (grid.children.length > 7) {
        grid.removeChild(grid.lastChild);
    }

    // Primeiro dia do mês (0 = dom, 1 = seg, ...)
    const primeiroDia = new Date(ano, mes, 1).getDay();
    // Último dia do mês
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    // Último dia do mês anterior
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();

    // Dias do mês anterior
    for (let i = primeiroDia - 1; i >= 0; i--) {
        const dia = ultimoDiaMesAnterior - i;
        const diaEl = criarDiaCalendario(dia, true);
        grid.appendChild(diaEl);
    }

    // Dias do mês atual
    for (let dia = 1; dia <= ultimoDia; dia++) {
        const data = new Date(ano, mes, dia);
        const dataISO = formatarDataISO(data);
        const diaEl = criarDiaCalendario(dia, false, dataISO);
        grid.appendChild(diaEl);
    }

    // Dias do próximo mês (até completar 6 semanas = 42 dias)
    const totalDias = grid.children.length - 7; // menos os cabeçalhos
    const diasProximoMes = 42 - totalDias;
    for (let dia = 1; dia <= diasProximoMes; dia++) {
        const diaEl = criarDiaCalendario(dia, true);
        grid.appendChild(diaEl);
    }
    // No final da função renderizarCalendario()
mostrarEventosDoMes();
}

mostrarEventosDoMes();

function criarDiaCalendario(numero, foraDoMes, dataISO = '') {
    const div = document.createElement('div');
    div.classList.add('dia-calendario');
    if (foraDoMes) div.classList.add('dia-fora');

    const numeroEl = document.createElement('div');
    numeroEl.classList.add('dia-numero');
    numeroEl.textContent = numero;
    div.appendChild(numeroEl);

    // Mostrar indicadores de evento
    if (!foraDoMes && eventos[dataISO] && eventos[dataISO].length > 0) {
        const indicador = document.createElement('div');
        indicador.classList.add('evento-indicador');
        div.appendChild(indicador);
    }

    if (!foraDoMes) {
        div.addEventListener('click', () => {
            mostrarEventosDoDia(dataISO);
            // Destacar visualmente (opcional)
            document.querySelectorAll('.dia-calendario.selecionado').forEach(el => {
                el.classList.remove('selecionado');
            });
            div.classList.add('selecionado');
        });

        // Duplo clique para adicionar evento
        div.addEventListener('dblclick', () => {
            adicionarEvento(dataISO);
        });
    }

    return div;
}

function mostrarEventosDoDia(dataISO) {
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);
    const dataFormatada = dataLocal.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    document.getElementById('data-eventos').textContent = dataFormatada;

    const lista = document.getElementById('lista-eventos-dia');
    const semEventos = document.getElementById('sem-eventos');
    lista.innerHTML = '';

    if (eventos[dataISO] && eventos[dataISO].length > 0) {
        eventos[dataISO].forEach((evento, index) => {
            const li = document.createElement('li');
            
            // Container para texto e botão
            const conteudoEvento = document.createElement('div');
            conteudoEvento.style.display = 'flex';
            conteudoEvento.style.justifyContent = 'space-between';
            conteudoEvento.style.alignItems = 'center';
            conteudoEvento.style.width = '100%';
            
            const texto = document.createElement('span');
            texto.textContent = evento;
            texto.style.flex = '1';
            texto.style.wordBreak = 'break-word';
            
            // Botão de excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.innerHTML = '🗑️';
            btnExcluir.title = 'Excluir evento';
            btnExcluir.className = 'btn-excluir-evento';
            btnExcluir.style.background = 'none';
            btnExcluir.style.border = 'none';
            btnExcluir.style.fontSize = '1.2rem';
            btnExcluir.style.cursor = 'pointer';
            btnExcluir.style.padding = '4px';
            btnExcluir.style.borderRadius = '4px';
            btnExcluir.style.marginLeft = '8px';
            btnExcluir.onclick = function() {
                confirmarExclusao(() => {
                    eventos[dataISO].splice(index, 1);
                    if (eventos[dataISO].length === 0) {
                        delete eventos[dataISO];
                    }
                    salvarEventos();
                    renderizarCalendario();
                    mostrarEventosDoDia(dataISO);
                });
            };
            
            conteudoEvento.appendChild(texto);
            conteudoEvento.appendChild(btnExcluir);
            li.appendChild(conteudoEvento);
            lista.appendChild(li);
        });
        semEventos.style.display = 'none';
    } else {
        semEventos.style.display = 'block';
    }
}
function mostrarEventosDoMes() {
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth() + 1;
    const mesStr = String(mes).padStart(2, '0');
    
    const eventosDoMes = [];
    
    for (const dataISO in eventos) {
        if (eventos.hasOwnProperty(dataISO)) {
            const [anoEvento, mesEvento] = dataISO.split('-');
            if (parseInt(anoEvento) === ano && parseInt(mesEvento) === mes) {
                eventos[dataISO].forEach((desc, index) => {
                    const dia = parseInt(dataISO.split('-')[2]);
                    eventosDoMes.push({ dia, descricao: desc, dataISO, index });
                });
            }
        }
    }

    const lista = document.getElementById('lista-eventos-mes');
    if (eventosDoMes.length === 0) {
        lista.innerHTML = '<li class="sem-eventos-mes">Nenhum evento agendado para este mês.</li>';
    } else {
        eventosDoMes.sort((a, b) => a.dia - b.dia);
        lista.innerHTML = '';
        eventosDoMes.forEach(item => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            
            const texto = document.createElement('span');
            texto.innerHTML = `<strong>${item.dia}</strong> — ${item.descricao}`;
            texto.style.flex = '1';
            texto.style.cursor = 'pointer';
            texto.onclick = () => {
                renderizarCalendario();
                mostrarEventosDoDia(item.dataISO);
                document.querySelectorAll('.dia-calendario').forEach(el => {
                    const num = el.querySelector('.dia-numero')?.textContent;
                    if (num == item.dia && !el.classList.contains('dia-fora')) {
                        el.classList.add('selecionado');
                    }
                });
            };
            
            // Botão de excluir
            const btnExcluir = document.createElement('button');
            btnExcluir.innerHTML = '🗑️';
            btnExcluir.title = 'Excluir evento';
            btnExcluir.className = 'btn-excluir-evento-mes';
            btnExcluir.style.background = 'none';
            btnExcluir.style.border = 'none';
            btnExcluir.style.fontSize = '1.1rem';
            btnExcluir.style.cursor = 'pointer';
            btnExcluir.style.padding = '4px';
            btnExcluir.onclick = function(e) {
                e.stopPropagation(); // evita selecionar o dia ao clicar no lixeira
                if (confirm('Excluir este evento permanentemente?')) {
                    eventos[item.dataISO].splice(item.index, 1);
                    if (eventos[item.dataISO].length === 0) {
                        delete eventos[item.dataISO];
                    }
                    salvarEventos();
                    renderizarCalendario();
                }
            };
            
            li.appendChild(texto);
            li.appendChild(btnExcluir);
            lista.appendChild(li);
        });
    }
}
let dataSelecionadaParaEvento = null;

function adicionarEvento(dataISO) {
    dataSelecionadaParaEvento = dataISO;
    
    // Correção aqui também!
    const [ano, mes, dia] = dataISO.split('-').map(Number);
    const dataLocal = new Date(ano, mes - 1, dia);
    
    const dataFormatada = dataLocal.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    document.getElementById('modal-data-exibida').textContent = `Data: ${dataFormatada}`;
    document.getElementById('descricao-evento').value = '';
    document.getElementById('modal-evento').style.display = 'flex';
    btnExcluir.onclick = function(e) {
        e.stopPropagation();
        confirmarExclusao(() => {
            eventos[item.dataISO].splice(item.index, 1);
            if (eventos[item.dataISO].length === 0) {
                delete eventos[item.dataISO];
            }
            salvarEventos();
            renderizarCalendario();
        });
    };
}

// Fechar modal ao clicar em "Cancelar"
document.getElementById('btn-cancelar-modal').addEventListener('click', () => {
    document.getElementById('modal-evento').style.display = 'none';
});

// Fechar modal ao clicar fora dele
document.getElementById('modal-evento').addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal-evento')) {
        document.getElementById('modal-evento').style.display = 'none';
    }
});

// Salvar evento
document.getElementById('btn-salvar-modal').addEventListener('click', () => {
    const descricao = document.getElementById('descricao-evento').value.trim();
    if (descricao) {
        if (!eventos[dataSelecionadaParaEvento]) {
            eventos[dataSelecionadaParaEvento] = [];
        }
        eventos[dataSelecionadaParaEvento].push(descricao);
        salvarEventos();
        renderizarCalendario();
        mostrarEventosDoDia(dataSelecionadaParaEvento);
        document.getElementById('modal-evento').style.display = 'none';
    } else {
        alert('Por favor, insira uma descrição para o evento.');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Botões de navegação
    document.getElementById('btn-mes-anterior').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() - 1);
        renderizarCalendario();
    });

    document.getElementById('btn-mes-proximo').addEventListener('click', () => {
        dataAtual.setMonth(dataAtual.getMonth() + 1);
        renderizarCalendario();
    });

    // Botão de adicionar evento (abre hoje)
    document.getElementById('btn-adicionar-evento').addEventListener('click', () => {
        const hoje = formatarDataISO(new Date());
        adicionarEvento(hoje);
    });

    // Renderiza o calendário inicial
    renderizarCalendario();
    mostrarEventosDoDia(formatarDataISO(new Date()));
});

// === ROLAGEM SUAVE DA SETA ===
document.addEventListener('DOMContentLoaded', function() {
    const setaRolar = document.querySelector('.seta-rolar');
    if (setaRolar) {
        setaRolar.addEventListener('click', function(e) {
            e.preventDefault();
            const alvo = document.getElementById('conteudo-abaixo');
            if (alvo) {
                alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
});

// === TELA DE CARREGAMENTO ===
document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                if (loadingScreen.parentNode) loadingScreen.remove();
            }, 600);
        }, 300);
    }
});

// Fallback de segurança
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen && loadingScreen.parentNode) loadingScreen.remove();
        }, 600);
    }
}, 4000);

// Inicializa a aba correta ao carregar
document.addEventListener('DOMContentLoaded', function() {
    let guiaInicial = 'inicio';
    const hash = window.location.hash.substring(1);
    if (['inicio', 'calendario', 'projeto'].includes(hash)) {
        guiaInicial = hash;
    }
    mostrarGuia(guiaInicial);
});
// Função para mostrar modal de confirmação
function confirmarExclusao(callback) {
    document.getElementById('modal-confirmacao').style.display = 'flex';
    
    // Botão "Excluir"
    const btnExcluir = document.getElementById('btn-confirmar-exclusao');
    btnExcluir.onclick = () => {
        callback(); // executa a exclusão
        document.getElementById('modal-confirmacao').style.display = 'none';
    };
    
    // Botão "Cancelar"
    document.getElementById('btn-cancelar-confirmacao').onclick = () => {
        document.getElementById('modal-confirmacao').style.display = 'none';
    };
    
    // Clicar fora fecha
    document.getElementById('modal-confirmacao').onclick = (e) => {
        if (e.target === document.getElementById('modal-confirmacao')) {
            document.getElementById('modal-confirmacao').style.display = 'none';
        }
    };
}