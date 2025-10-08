// Sistema de carregamento com fade-out elegante
window.addEventListener('load', function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        // Pequeno delay pra garantir que o fade-out seja visível
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remove do DOM após a animação
            setTimeout(() => {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.remove();
                }
            }, 400); // Tempo da transição (0.4s)
        }, 200); // Delay antes de começar a esconder
    }
});

// Fallback se demorar muito
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            if (loadingScreen && loadingScreen.parentNode) {
                loadingScreen.remove();
            }
        }, 400);
    }
}, 5000);

// Também pode esconder se demorar muito (fallback)
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 500);
    }
}, 5000); // 5 segundos de fallback
// Mostra a guia clicada e esconde as outras
function mostrarGuia(idGuia) {
    // Esconde todas
    document.querySelectorAll('.guia').forEach(guia => {
        guia.classList.remove('ativa');
    });
    // Mostra a escolhida
    document.getElementById(idGuia).classList.add('ativa');
}

// Função do calendário
function mostrarDataSelecionada() {
    const input = document.getElementById('seletor-data');
    const dataSelecionada = document.getElementById('data-selecionada');
    const listaEventos = document.getElementById('lista-eventos');

    if (input.value) {
        const data = new Date(input.value);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dataSelecionada.textContent = "Você selecionou: " + data.toLocaleDateString('pt-BR', options);

        // Eventos simulados
        const eventos = {
            '2025-04-22': 'Dia da Terra - Mutirão de limpeza no Córrego Verde',
            '2025-06-05': 'Dia Mundial do Meio Ambiente - Palestra na escola',
            '2025-08-15': 'Oficina de reaproveitamento de água',
            '2025-11-20': 'Plantio de árvores nativas às margens do lago'
        };

        listaEventos.textContent = eventos[input.value] || "Nenhum evento cadastrado para esta data.";
    } else {
        dataSelecionada.textContent = "Nenhuma data selecionada.";
        listaEventos.textContent = "Selecione uma data para ver os eventos.";
    }
}

// Ao carregar a página, garante que "Início" esteja ativo
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('.guia.ativa')) {
        mostrarGuia('inicio');
    }
});
// Rolar suavemente até o conteúdo ao clicar na seta
document.addEventListener('DOMContentLoaded', function() {
    const setaRolar = document.querySelector('.seta-rolar');
    if (setaRolar) {
        setaRolar.addEventListener('click', function(e) {
            e.preventDefault(); // Evita comportamento padrão de âncora
            const alvo = document.getElementById('conteudo-abaixo');
            if (alvo) {
                alvo.scrollIntoView({
                    behavior: 'smooth', // Rola suavemente
                    block: 'start'      // Alinha no topo
                });
            }
        });
    }
});