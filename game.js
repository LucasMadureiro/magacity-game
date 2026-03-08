const SEC_W = 70; 
const SEC_H = 52;
const COLUNAS = SEC_W * 3; 
const LINHAS = SEC_H * 3;

let ferramentaAtual = 'estrada';
let jogoRodando = false; 
let jogoPausado = false; 
let tempoPausado = false; 
let slotAtivo = null; 
let modoSaveModal = 'carregar'; 
let cooldownEventos = 350; 
let isDragging = false; 
let isRelocating = false; 
let primeiraNoitePassou = false; // NOVA REGRA: Controla o Fim da Imunidade

let scale = 1; 
let panX = 0; 
let panY = 0; 
let isPanning = false; 
let startX, startY;
let setoresDesbloqueados = ["1,1"]; 
let agentes = [];
let faseSemaforo = 'V'; 
let tickSemaforo = 0; 

let idLoopTransito = null; 
let idLoopEconomia = null; 
let idLoopFisica = null;

let recursos = { dinheiro: 3000, saldo: 0, aprovacao: 50, isNoite: false, tickRelogio: 0, ciencia: 0 };
let taxas = { res: 10, com: 12, ind: 20 }; 
let stats = { adultos:0, criancas:0, vagasTotais:0, trabalhadoresUsados:0, energiaG:0, energiaU:0, aguaG:0, aguaU:0, lixoG:0, lixoU:0, vagasEscola:0, leitos:0, forcaPolicial:0, doentes:0, crime:0, rendaImpostos:0, rendaExportacao:0, rendaTransporte:0, rendaTurismo:0, despesaManutencao:0, cienciaGerada: 0 };
let demanda = { res: 50, com: 50, ind: 50 }; 
let especializacaoAtual = "Nenhuma"; 
let taxaEscolaridade = 0; 
let historicoRenda = { ind: 0, total: 0 };
let feedbackAprovacaoMensagem = "👻 Cidade Fantasma"; 
let feedbackAprovacaoCor = "#bdc3c7";

let techs = {
    filtros: false, reciclagem_urbana: false, tratamento_agua: false, solar: false, baterias: false, urbanismo_verde: false, carbono_zero: false, eco_circular: false,
    automacao: false, logistica: false, ind40: false, fab_inteligentes: false, robotica: false, ind_autonoma: false,
    supermercado: false, imposto_prog: false, livre_comercio: false, shopping: false, distrito_fin: false, bolsa_valores: false,
    log_rodoviaria: false, casa_grande: false, plan_urbano: false, mansao: false, transp_publico: false, metropole_vertical: false,
    edu_basica: false, universidade: false, pesq_aplicada: false, cid_conhecimento: false,
    parques_urb: false, festival: false, turismo_reg: false, cap_cultural: false,
    eco_industrial: false, vale_tec: false, cap_turistica: false, smart_city: false
};

const arvoreData = [
    { ramo: "🌱 Sustentabilidade", cor: "#2ecc71", itens: [
        { id: "filtros", nome: "Filtros Industriais", custo: 50, req: [], desc: "Reduz o raio da poluição." },
        { id: "reciclagem_urbana", nome: "Reciclagem Urbana", custo: 80, req: [], desc: "Desbloqueia Reciclagem.", unlock: ['reciclagem'] },
        { id: "tratamento_agua", nome: "Tratamento de Água", custo: 100, req: [], desc: "Reduz consumo de água global em 20%." },
        { id: "solar", nome: "Energia Solar", custo: 250, req: ["filtros", "reciclagem_urbana"], desc: "Desbloqueia Usina Solar.", unlock: ['solar'] },
        { id: "baterias", nome: "Armazenamento Energ.", custo: 350, req: ["solar"], desc: "Remove apagão noturno." },
        { id: "urbanismo_verde", nome: "Urbanismo Verde", custo: 450, req: ["tratamento_agua"], desc: "Parques bloqueiam poluição." },
        { id: "carbono_zero", nome: "Cidade Carbono Zero", custo: 900, req: ["baterias", "urbanismo_verde"], desc: "Remove poluição." },
        { id: "eco_circular", nome: "Economia Circular", custo: 1000, req: ["reciclagem_urbana"], desc: "Reciclagem gera R$ 500." }
    ]},
    { ramo: "🏭 Indústria", cor: "#f1c40f", itens: [
        { id: "automacao", nome: "Automação Básica", custo: 60, req: [], desc: "Manutenção cai 50%." },
        { id: "logistica", nome: "Logística Industrial", custo: 90, req: [], desc: "Exportação +20%." },
        { id: "ind40", nome: "Indústria 4.0", custo: 300, req: ["automacao"], desc: "Remove nevoeiro industrial." },
        { id: "fab_inteligentes", nome: "Fábricas Inteligentes", custo: 400, req: ["logistica"], desc: "Indústrias rendem +30%." },
        { id: "robotica", nome: "Robótica", custo: 800, req: ["ind40"], desc: "Desbloqueia Lab. Robótica.", unlock: ['robotica'] },
        { id: "ind_autonoma", nome: "Indústria Autônoma", custo: 1200, req: ["fab_inteligentes", "robotica"], desc: "Usa metade dos trabalhadores." }
    ]},
    { ramo: "🏛️ Economia", cor: "#3498db", itens: [
        { id: "supermercado", nome: "Varejo Local", custo: 50, req: [], desc: "Lojas viram Mercados." },
        { id: "imposto_prog", nome: "Imposto Progressivo", custo: 100, req: [], desc: "Aumenta limite de impostos." },
        { id: "livre_comercio", nome: "Livre Comércio", custo: 300, req: ["supermercado"], desc: "Exportação rende o dobro." },
        { id: "shopping", nome: "Shopping Centers", custo: 400, req: ["supermercado"], desc: "Mercados viram Shoppings." },
        { id: "distrito_fin", nome: "Distrito Financeiro", custo: 900, req: ["shopping"], desc: "Comércio gera +20%." },
        { id: "bolsa_valores", nome: "Bolsa de Valores", custo: 1500, req: ["distrito_fin", "imposto_prog"], desc: "Lucro TOTAL +15%." }
    ]},
    { ramo: "🏘️ Urbanismo", cor: "#e67e22", itens: [
        { id: "log_rodoviaria", nome: "Logística Rodoviária", custo: 30, req: [], desc: "Permite construir ao lado da Rodovia Estadual." },
        { id: "casa_grande", nome: "Expansão Urbana", custo: 50, req: [], desc: "Casas viram Casas Grandes." },
        { id: "plan_urbano", nome: "Planejamento Urbano", custo: 100, req: [], desc: "Estradas a metade do preço." },
        { id: "mansao", nome: "Condomínios", custo: 300, req: ["casa_grande"], desc: "Casas Grandes viram Mansões." },
        { id: "transp_publico", nome: "Transporte Público", custo: 400, req: ["plan_urbano"], desc: "Terminais dão aprovação." },
        { id: "metropole_vertical", nome: "Metrópole Vertical", custo: 1200, req: ["mansao", "transp_publico"], desc: "Mansões viram Arranha-céus." }
    ]},
    { ramo: "🎓 Educação", cor: "#9b59b6", itens: [
        { id: "edu_basica", nome: "Educação Básica", custo: 80, req: [], desc: "Escola gera 1.0 PC em vez de 0.2 PC." },
        { id: "universidade", nome: "Campus Universitário", custo: 350, req: ["edu_basica"], desc: "Desbloqueia Universidade.", unlock: ['universidade'] },
        { id: "pesq_aplicada", nome: "Pesquisa Aplicada", custo: 500, req: ["universidade"], desc: "Tecnologias 20% mais baratas." },
        { id: "cid_conhecimento", nome: "Cidade do Conhecimento", custo: 1200, req: ["pesq_aplicada"], desc: "População gera mais PC." }
    ]},
    { ramo: "🎭 Cultura e Sociedade", cor: "#e84393", itens: [
        { id: "parques_urb", nome: "Parques Urbanos", custo: 70, req: [], desc: "Parque gera +0.5% aprovação." },
        { id: "festival", nome: "Eventos Culturais", custo: 400, req: ["parques_urb"], desc: "Desbloqueia Festival Manguebeat.", unlock: ['festival'] },
        { id: "turismo_reg", nome: "Turismo Regional", custo: 500, req: ["festival"], desc: "Festival gera dobro de renda." },
        { id: "cap_cultural", nome: "Capital Cultural", custo: 1000, req: ["turismo_reg"], desc: "Turismo rende o dobro." }
    ]},
    { ramo: "🔮 Tecnologias Secretas", cor: "#1abc9c", itens: [
        { id: "eco_industrial", secreta: true, nome: "Mega Indústria Verde", custo: 2000, req: ["ind40", "solar"], desc: "Indústrias GERAM energia limpa." },
        { id: "vale_tec", secreta: true, nome: "Vale Tecnológico", custo: 2500, req: ["universidade", "robotica"], desc: "Ciência global x3." },
        { id: "cap_turistica", secreta: true, nome: "Capital Turística", custo: 2500, req: ["festival", "shopping"], desc: "Turismo rende x3." },
        { id: "smart_city", secreta: true, nome: "Cidade Inteligente", custo: 3000, req: ["cid_conhecimento", "ind_autonoma"], desc: "Consumo global cai 30%." }
    ]}
];

// REVISÃO 3.1: NERF DA ÁGUA E LIXO APLICADO AQUI (40 em vez de 50)
const catalogo = {
    estrada: { custo: 10, w: 2, h: 2, icone: '', manutencao: 1},
    ponte: { custo: 50, w: 2, h: 2, icone: '', manutencao: 2 },
    residencial: { custo: 100, w: 2, h: 2, icone: '🏠', popA: 3, popC: 1, energiaConsumo: 1, aguaConsumo: 1, lixoConsumo: 2 },
    residencial2: { custo: 0, w: 2, h: 2, icone: '🏡', popA: 7, popC: 2, energiaConsumo: 2, aguaConsumo: 2, lixoConsumo: 4 },
    residencial3: { custo: 0, w: 2, h: 2, icone: '🏰', popA: 15, popC: 4, energiaConsumo: 4, aguaConsumo: 4, lixoConsumo: 8 },
    residencial4: { custo: 0, w: 2, h: 2, icone: '🏙️', popA: 30, popC: 8, energiaConsumo: 16, aguaConsumo: 16, lixoConsumo: 32 }, 
    comercial: { custo: 150, w: 2, h: 2, icone: '🏪', energiaConsumo: 2, aguaConsumo: 1, trabConsumo: 2, lixoConsumo: 2 },
    comercial2: { custo: 0, w: 2, h: 2, icone: '🛒', energiaConsumo: 3, aguaConsumo: 2, trabConsumo: 6, lixoConsumo: 3 },
    comercial3: { custo: 0, w: 2, h: 2, icone: '🏬', energiaConsumo: 5, aguaConsumo: 4, trabConsumo: 15, lixoConsumo: 6 },
    industrial: { custo: 250, w: 4, h: 2, icone: '🏭', energiaConsumo: 2, aguaConsumo: 3, trabConsumo: 6, lixoConsumo: 4, manutencao: 15, poluicao: true },
    usina: { custo: 450, w: 3, h: 3, icone: '🏭', energiaGera: 40, manutencao: 35, poluicao: true },
    solar: { custo: 900, w: 3, h: 3, icone: '☀️', energiaGera: 60, manutencao: 20 },
    agua: { custo: 350, w: 2, h: 2, icone: '💧', aguaGera: 40, manutencao: 25 },
    aterro: { custo: 200, w: 3, h: 2, icone: '🗑️', lixoGera: 40, manutencao: 10, poluicao: true },
    reciclagem: { custo: 700, w: 3, h: 3, icone: '♻️', lixoGera: 40, energiaConsumo: 2, aguaConsumo: 1, trabConsumo: 3, manutencao: 15 },
    parque: { custo: 50, w: 2, h: 2, icone: '🌳', manutencao: 5 },
    terminal: { custo: 250, w: 3, h: 2, icone: '🚌', energiaConsumo: 1, aguaConsumo: 1, trabConsumo: 2, manutencao: 15 },
    escola: { custo: 400, w: 3, h: 2, icone: '🏫', vagasEscola: 25, pc: 0.2, energiaConsumo: 1, aguaConsumo: 1, trabConsumo: 3, manutencao: 25 },
    universidade: { custo: 1500, w: 4, h: 4, icone: '🎓', popA: 10, vagasEscola: 120, pc: 1.5, energiaConsumo: 3, aguaConsumo: 2, trabConsumo: 8, manutencao: 50 },
    hospital: { custo: 500, w: 3, h: 3, icone: '🏥', leitos: 30, energiaConsumo: 2, aguaConsumo: 2, trabConsumo: 4, manutencao: 30 },
    policia: { custo: 400, w: 3, h: 2, icone: '🚓', forcaPolicial: 40, energiaConsumo: 1, aguaConsumo: 1, trabConsumo: 3, manutencao: 25 },
    robotica: { custo: 1000, w: 4, h: 3, icone: '🤖', energiaConsumo: 4, aguaConsumo: 2, trabConsumo: 6, manutencao: 35 },
    festival: { custo: 1200, w: 5, h: 4, icone: '🦀', energiaConsumo: 5, aguaConsumo: 2, trabConsumo: 5, manutencao: 45 }
};

function alternarTempo() {
    tempoPausado = !tempoPausado;
    let btn = document.getElementById('btn-tempo');
    if (tempoPausado) {
        btn.innerText = "▶️ RETOMAR TEMPO";
        btn.style.background = "#e67e22";
    } else {
        btn.innerText = "⏸️ PAUSAR";
        btn.style.background = "#3498db"; 
    }
}

function getCustoDinamico(tipo) {
    let base = catalogo[tipo].custo; 
    if (!base) return 0;
    
    if (tipo === 'estrada' || tipo === 'ponte') {
        return techs.plan_urbano ? Math.floor(base/2) : base; 
    }
    
    let count = listaPredios.filter(p => p.tipo === tipo && !p.indestrutivel).length; 
    return Math.floor(base * Math.pow(1.05, count));
}

function atualizarCustosUI() { 
    Object.keys(catalogo).forEach(tipo => { 
        let el = document.getElementById(`c-${tipo}`); 
        if (el) el.innerText = getCustoDinamico(tipo); 
    }); 
}

function calcularCustoSetor() { 
    return Math.floor(15000 * Math.pow(1.8, setoresDesbloqueados.length - 1)); 
}

function desenharSetores() {
    document.querySelectorAll('.sector-overlay').forEach(e => e.remove());
    for(let sy = 0; sy < 3; sy++) {
        for(let sx = 0; sx < 3; sx++) {
            let id = `${sx},${sy}`;
            if(!setoresDesbloqueados.includes(id)) {
                let div = document.createElement('div'); 
                div.className = 'sector-overlay';
                div.style.gridColumn = `${sx * SEC_W + 1} / span ${SEC_W}`; 
                div.style.gridRow = `${sy * SEC_H + 1} / span ${SEC_H}`;
                
                let lock = document.createElement('div'); 
                lock.className = 'sector-lock';
                lock.innerHTML = `🔒 Terreno Privado<br>Comprar: R$ ${calcularCustoSetor()}`; 
                lock.onclick = () => { comprarSetor(sx, sy); };
                
                div.appendChild(lock); 
                document.getElementById('game-board').appendChild(div);
            }
        }
    }
}

function comprarSetor(sx, sy) {
    let custo = calcularCustoSetor();
    if (recursos.dinheiro >= custo) { 
        recursos.dinheiro -= custo; 
        setoresDesbloqueados.push(`${sx},${sy}`); 
        desenharSetores(); 
        atualizarUI(); 
    } else { 
        alert("Dinheiro na Câmara insuficiente para expandir a cidade!"); 
    }
}

let terreno = Array(LINHAS).fill().map(() => Array(COLUNAS).fill('vazio')); 
let ocupacao = Array(LINHAS).fill().map(() => Array(COLUNAS).fill(false)); 
let listaPredios = [];

function prepararTerrenoVazio() {
    terreno = Array(LINHAS).fill().map(() => Array(COLUNAS).fill('vazio')); 
    ocupacao = Array(LINHAS).fill().map(() => Array(COLUNAS).fill(false)); 
    listaPredios = []; 
    
    let rxCentro = Math.floor(Math.random() * (SEC_W - 20)) + SEC_W + 10; 
    for (let y = 0; y < LINHAS; y++) {
        for(let w = 0; w < 4; w++) {
            if(rxCentro + w >= 0 && rxCentro + w < COLUNAS) {
                terreno[y][rxCentro + w] = 'agua_natural';
            }
        }
        if (y % 4 === 0) rxCentro += Math.floor(Math.random() * 3) - 1;
    }
    
    for(let i = 0; i < 2; i++) {
        let rx = Math.floor(Math.random() * (COLUNAS - 16)) + 8; 
        for (let y = 0; y < LINHAS; y++) {
            for(let w = 0; w < 4; w++) {
                if(rx + w >= 0 && rx + w < COLUNAS) {
                    terreno[y][rx + w] = 'agua_natural';
                }
            }
            if (y % 4 === 0) rx += Math.floor(Math.random() * 3) - 1;
        }
    }
}

function gerarRodoviaEstadual() {
    let y = 78; 
    for (let x = 0; x < COLUNAS; x += 2) { 
        let sobreAgua = false; 
        for(let py = 0; py < 2; py++) {
            for(let px = 0; px < 2; px++) {
                if(terreno[y+py][x+px] === 'agua_natural') sobreAgua = true;
            }
        }
        construirPredioDireto(x, y, sobreAgua ? 'ponte' : 'estrada', true); 
        if(listaPredios.length > 0) {
            listaPredios[listaPredios.length-1].indestrutivel = true;
        }
    }
}

function desenharTerrenoHtml() {
    const board = document.getElementById('game-board'); 
    board.innerHTML = '<div id="ghost-cursor"></div>'; 
    for (let y = 0; y < LINHAS; y++) {
        for (let x = 0; x < COLUNAS; x++) {
            const div = document.createElement('div'); 
            div.className = 'celula'; 
            div.style.gridColumn = x + 1; 
            div.style.gridRow = y + 1;
            if (terreno[y][x] === 'agua_natural') {
                div.classList.add('agua_natural'); 
            }
            board.appendChild(div);
        }
    }
}

function centralizarCamera() {
    const vp = document.getElementById('viewport'); 
    const rect = vp.getBoundingClientRect(); 
    let sizePx = parseInt(getComputedStyle(document.body).getPropertyValue('--tamanho-celula'));
    
    scale = 1; 
    panX = (rect.width / 2) - (105 * sizePx); 
    panY = (rect.height / 2) - (78 * sizePx); 
    updateTransform();
}

window.onload = () => {
    const vp = document.getElementById('viewport');
    
    vp.addEventListener('mousemove', moverFantasma);
    
    vp.addEventListener('mousedown', (e) => { 
        if(e.button === 1) { 
            e.preventDefault(); 
            isPanning = true; 
            startX = e.clientX - panX; 
            startY = e.clientY - panY; 
            vp.style.cursor = 'grabbing'; 
            return; 
        }
        if (!jogoRodando || jogoPausado || e.button !== 0) return; 
        isDragging = true; 
        moverFantasma(e); 
        clicarNoGrid();
        let g = document.getElementById('ghost-cursor'); 
        if (g && g.dataset.gx) { 
            lastDragX = parseInt(g.dataset.gx); 
            lastDragY = parseInt(g.dataset.gy); 
        }
    });
    
    window.addEventListener('mouseup', (e) => { 
        if(e.button === 1) { 
            isPanning = false; 
            vp.style.cursor = 'grab'; 
        } 
        isDragging = false; 
        lastDragX = -1; 
        lastDragY = -1; 
    });
    
    vp.addEventListener('wheel', (e) => {
        e.preventDefault(); 
        const zoomSpeed = 0.1;
        let newScale = scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed); 
        newScale = Math.max(0.3, Math.min(newScale, 3)); 
        
        const rect = vp.getBoundingClientRect(); 
        const mouseX = e.clientX - rect.left; 
        const mouseY = e.clientY - rect.top;
        
        panX = mouseX - (mouseX - panX) * (newScale / scale); 
        panY = mouseY - (mouseY - panY) * (newScale / scale); 
        scale = newScale; 
        updateTransform();
    });
    
    atualizarCustosUI();
}

function updateTransform() { 
    document.getElementById('game-board').style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; 
}

function limparAgentes() { 
    agentes.forEach(a => { if(a.carDom) a.carDom.remove(); }); 
    agentes = []; 
}

function iniciarMotores() {
    if(idLoopTransito) clearInterval(idLoopTransito); 
    if(idLoopEconomia) clearInterval(idLoopEconomia); 
    if(idLoopFisica) clearInterval(idLoopFisica);
    
    idLoopTransito = setInterval(motorTransito, 1000); 
    idLoopEconomia = setInterval(motorEconomia, 3000); 
    idLoopFisica = setInterval(motorFisica, 10000);
}

function novoJogo() {
    document.getElementById('tela-inicial').classList.add('oculto'); 
    document.getElementById('panel-stats').classList.remove('oculto'); 
    document.getElementById('viewport').classList.remove('oculto'); 
    document.getElementById('panel-tools').classList.remove('oculto');
    
    recursos = { dinheiro: 3000, saldo: 0, aprovacao: 50, isNoite: false, tickRelogio: 0, ciencia: 0 };
    taxas = { res: 10, com: 12, ind: 20 }; 
    demanda = { res: 50, com: 50, ind: 50 };
    
    Object.keys(techs).forEach(k => techs[k] = false);
    setoresDesbloqueados = ["1,1"]; 
    especializacaoAtual = "Nenhuma"; 
    taxaEscolaridade = 0; 
    historicoRenda = { ind: 0, total: 0 }; 
    cooldownEventos = 350;
    feedbackAprovacaoMensagem = "👻 Cidade Fantasma"; 
    feedbackAprovacaoCor = "#bdc3c7";
    
    tempoPausado = false;
    primeiraNoitePassou = false; // Reset da Imunidade
    let btn = document.getElementById('btn-tempo');
    if(btn) { btn.innerText = "⏸️ PAUSAR"; btn.style.background = "#3498db"; }
    
    document.getElementById('taxa-res').value = taxas.res; 
    document.getElementById('taxa-com').value = taxas.com; 
    document.getElementById('taxa-ind').value = taxas.ind;
    
    document.body.classList.remove('tech-filtros', 'tech-ind40', 'tech-carbono_zero');
    
    limparAgentes(); 
    prepararTerrenoVazio(); 
    desenharTerrenoHtml(); 
    gerarRodoviaEstadual(); 
    desenharSetores();
    centralizarCamera(); 
    atualizarEstradas(); 
    atualizarBotoesLiberados(); 
    atualizarCustosUI();
    
    jogoRodando = true; 
    jogoPausado = false; 
    slotAtivo = null;
    
    iniciarMotores(); 
    atualizarUI();
}

function sairParaMenu() {
    jogoRodando = false; 
    limparAgentes();
    if(idLoopTransito) clearInterval(idLoopTransito); 
    if(idLoopEconomia) clearInterval(idLoopEconomia); 
    if(idLoopFisica) clearInterval(idLoopFisica);
    
    document.getElementById('tela-inicial').classList.remove('oculto'); 
    document.getElementById('panel-stats').classList.add('oculto'); 
    document.getElementById('viewport').classList.add('oculto'); 
    document.getElementById('panel-tools').classList.add('oculto');
}

// -------------------------------------------------------------
// SISTEMA DE SAVE E LOAD
// -------------------------------------------------------------
function abrirModalSaves(modo) { 
    modoSaveModal = modo; 
    document.getElementById('titulo-saves').innerText = modo === 'salvar' ? "💾 Salvar a sua Cidade" : "📂 Carregar Cidade"; 
    
    let botoes = document.getElementById('saves-grid').querySelectorAll('button');
    for(let i = 1; i <= 3; i++) {
        let saveData = localStorage.getItem('megacity_save_' + i);
        if(saveData) {
            try {
                let dados = JSON.parse(saveData);
                let dinheiroStr = dados.recursos ? Math.floor(dados.recursos.dinheiro) : 0;
                botoes[i-1].innerText = `Slot ${i}: R$ ${dinheiroStr} | ${dados.dataHora || 'Salvo'}`;
            } catch(e) {
                botoes[i-1].innerText = `Slot ${i}: Dados Corrompidos`;
            }
        } else {
            botoes[i-1].innerText = `Slot ${i}: Vazio`;
        }
    }
    document.getElementById('modal-saves').classList.remove('escondido'); 
} 

function fecharModalSaves() { 
    document.getElementById('modal-saves').classList.add('escondido'); 
}

function acaoSlot(slot) { 
    if (modoSaveModal === 'salvar') salvarJogo(slot);
    else carregarJogo(slot);
}

function salvarJogo(slot) {
    let dados = {
        recursos: recursos,
        taxas: taxas,
        techs: techs,
        setoresDesbloqueados: setoresDesbloqueados,
        terreno: terreno,
        predios: listaPredios.map(p => ({ tipo: p.tipo, x: p.x, y: p.y, indestrutivel: p.indestrutivel })),
        primeiraNoitePassou: primeiraNoitePassou,
        dataHora: new Date().toLocaleString()
    };
    
    localStorage.setItem('megacity_save_' + slot, JSON.stringify(dados));
    alert('Cidade salva com sucesso no Slot ' + slot + '!');
    fecharModalSaves();
}

function carregarJogo(slot) {
    let saveData = localStorage.getItem('megacity_save_' + slot);
    if (!saveData) { alert('Este slot está vazio!'); return; }
    
    let dados;
    try { dados = JSON.parse(saveData); } catch(e) { alert('Erro ao ler o ficheiro de save!'); return; }
    
    recursos = dados.recursos || { dinheiro: 3000, saldo: 0, aprovacao: 50, isNoite: false, tickRelogio: 0, ciencia: 0 };
    taxas = dados.taxas || { res: 10, com: 12, ind: 20 };
    Object.assign(techs, dados.techs || {});
    setoresDesbloqueados = dados.setoresDesbloqueados || ["1,1"];
    terreno = dados.terreno || Array(LINHAS).fill().map(() => Array(COLUNAS).fill('vazio'));
    primeiraNoitePassou = dados.primeiraNoitePassou || false;
    
    tempoPausado = false;
    let btn = document.getElementById('btn-tempo');
    if(btn) { btn.innerText = "⏸️ PAUSAR"; btn.style.background = "#3498db"; }

    limparAgentes();
    ocupacao = Array(LINHAS).fill().map(() => Array(COLUNAS).fill(false));
    listaPredios = [];
    document.getElementById('game-board').innerHTML = '<div id="ghost-cursor"></div>';
    
    document.body.classList.remove('tech-filtros', 'tech-ind40', 'tech-carbono_zero');
    if (techs.filtros) document.body.classList.add('tech-filtros');
    if (techs.ind40) document.body.classList.add('tech-ind40');
    if (techs.carbono_zero) document.body.classList.add('tech-carbono_zero');
    
    document.getElementById('taxa-res').value = taxas.res; 
    document.getElementById('taxa-com').value = taxas.com; 
    document.getElementById('taxa-ind').value = taxas.ind;
    
    desenharTerrenoHtml();
    desenharSetores();
    centralizarCamera();
    
    if (dados.predios) {
        dados.predios.forEach(p => {
            construirPredioDireto(p.x, p.y, p.tipo, true);
            listaPredios[listaPredios.length - 1].indestrutivel = p.indestrutivel;
        });
    }
    
    atualizarEstradas();
    atualizarBotoesLiberados();
    atualizarCustosUI();
    
    document.getElementById('tela-inicial').classList.add('oculto'); 
    document.getElementById('panel-stats').classList.remove('oculto'); 
    document.getElementById('viewport').classList.remove('oculto'); 
    document.getElementById('panel-tools').classList.remove('oculto');
    
    jogoRodando = true;
    jogoPausado = false;
    
    iniciarMotores();
    atualizarUI();
    fecharModalSaves();
}

function abrirModalRegras() { document.getElementById('modal-regras').classList.remove('escondido'); }
function fecharModalRegras() { document.getElementById('modal-regras').classList.add('escondido'); }

function abrirModalTech() { 
    jogoPausado = true; 
    document.getElementById('tech-pc-display').innerText = Math.floor(recursos.ciencia);
    let container = document.getElementById('tech-container'); 
    container.innerHTML = '';
    
    let techsDesbloqueadas = Object.values(techs).filter(v => v).length; 
    let redutorPesquisa = techs.pesq_aplicada ? 0.8 : 1.0;
    
    arvoreData.forEach(ramo => {
        let rDiv = document.createElement('div'); 
        rDiv.className = 'tech-ramo'; 
        rDiv.innerHTML = `<h3>${ramo.ramo}</h3>`; 
        let techsMostradas = 0;
        
        ramo.itens.forEach(t => {
            let isRes = techs[t.id]; 
            let isUnlockable = t.req.length === 0 || t.req.every(r => techs[r]);
            if (t.secreta && !isUnlockable && !isRes) return;
            
            techsMostradas++; 
            let extraClass = (t.secreta && (isRes || isUnlockable)) ? "secreta-revelada" : "";
            let card = document.createElement('div'); 
            card.className = `tech-card ${isRes ? 'pesquisado' : (isUnlockable ? '' : 'trancado')} ${extraClass}`;
            
            let custoDinamico = Math.floor(t.custo * (1 + techsDesbloqueadas * 0.1) * redutorPesquisa); 
            let btnHtml = '';
            
            if (isRes) {
                btnHtml = `<button class="tech-btn" disabled style="background:#2ecc71;">Pesquisado</button>`; 
            } else if (!isUnlockable) {
                btnHtml = `<button class="tech-btn" disabled>Bloqueado</button>`; 
            } else {
                btnHtml = `<button class="tech-btn" onclick="comprarTech('${t.id}', ${custoDinamico})" ${recursos.ciencia >= custoDinamico ? '' : 'disabled'}>${custoDinamico} PC</button>`;
            }
            
            card.innerHTML = `<h4>${t.secreta ? '🌟 ' : ''}${t.nome}</h4><p>${t.desc}</p>${btnHtml}`; 
            rDiv.appendChild(card);
        }); 
        if(techsMostradas > 0) container.appendChild(rDiv);
    });
    document.getElementById('modal-tech').classList.remove('escondido'); 
}

function fecharModalTech() { 
    jogoPausado = false; 
    document.getElementById('modal-tech').classList.add('escondido'); 
}

function comprarTech(id, custo) {
    if(recursos.ciencia >= custo) {
        recursos.ciencia -= custo; 
        techs[id] = true;
        
        if (id === 'filtros') document.body.classList.add('tech-filtros'); 
        if (id === 'ind40') document.body.classList.add('tech-ind40'); 
        if (id === 'carbono_zero') document.body.classList.add('tech-carbono_zero');
        
        arvoreData.forEach(r => r.itens.forEach(i => { 
            if (i.id === id && i.unlock) { 
                i.unlock.forEach(pId => { 
                    let btn = document.getElementById(`btn-${pId}`); 
                    if(btn) btn.classList.remove('bloqueado'); 
                }); 
            } 
        }));
        
        atualizarCustosUI(); 
        abrirModalTech(); 
        atualizarUI();
    }
}

function atualizarBotoesLiberados() {
    ['solar', 'reciclagem', 'universidade', 'robotica', 'festival'].forEach(id => { 
        let btn = document.getElementById(`btn-${id}`); 
        if(btn) btn.classList.add('bloqueado'); 
    });
    
    arvoreData.forEach(r => r.itens.forEach(i => { 
        if (techs[i.id] && i.unlock) { 
            i.unlock.forEach(pId => { 
                let btn = document.getElementById(`btn-${pId}`); 
                if(btn) btn.classList.remove('bloqueado'); 
            }); 
        } 
    }));
}

function moverFantasma(e) {
    if (isPanning) { 
        panX = e.clientX - startX; 
        panY = e.clientY - startY; 
        updateTransform(); 
        return; 
    }
    
    let rect = document.getElementById('game-board').getBoundingClientRect(); 
    let sizePx = rect.width / COLUNAS; 
    let xGrid = Math.floor((e.clientX - rect.left) / sizePx); 
    let yGrid = Math.floor((e.clientY - rect.top) / sizePx);
    
    if (xGrid < 0 || xGrid >= COLUNAS || yGrid < 0 || yGrid >= LINHAS) return;

    if (ferramentaAtual === 'estrada') { 
        xGrid = Math.floor(xGrid / 2) * 2; 
        yGrid = Math.floor(yGrid / 2) * 2; 
    }
    
    const ghost = document.getElementById('ghost-cursor'); 
    let ghostSize = parseInt(getComputedStyle(document.body).getPropertyValue('--tamanho-celula'));

    if (ferramentaAtual === 'apagar' || ferramentaAtual === 'mover') {
        ghost.style.display = 'flex'; 
        ghost.style.width = ghostSize + 'px'; 
        ghost.style.height = ghostSize + 'px'; 
        ghost.style.gridColumn = `${xGrid + 1} / span 1`; 
        ghost.style.gridRow = `${yGrid + 1} / span 1`;
        ghost.innerText = ferramentaAtual === 'apagar' ? '🚜' : '🔄'; 
        ghost.className = ferramentaAtual === 'apagar' ? 'ghost-apagar' : 'ghost-mover'; 
        ghost.dataset.valido = 'ferramenta'; 
        ghost.dataset.gx = xGrid; 
        ghost.dataset.gy = yGrid;
        
        if (isDragging && ferramentaAtual === 'apagar' && (xGrid !== lastDragX || yGrid !== lastDragY)) { 
            lastDragX = xGrid; 
            lastDragY = yGrid; 
            clicarNoGrid(); 
        } 
        return;
    }
    
    const info = catalogo[ferramentaAtual]; 
    if(!info) return;
    
    if (xGrid + info.w > COLUNAS) xGrid = COLUNAS - info.w; 
    if (yGrid + info.h > LINHAS) yGrid = LINHAS - info.h;
    
    ghost.style.display = 'flex'; 
    ghost.style.width = (info.w * ghostSize) + 'px'; 
    ghost.style.height = (info.h * ghostSize) + 'px'; 
    ghost.style.gridColumn = `${xGrid + 1} / span ${info.w}`; 
    ghost.style.gridRow = `${yGrid + 1} / span ${info.h}`; 
    ghost.innerText = info.icone;
    
    let espacoLivre = true; 
    let sobreAgua = false; 
    let tocandoRodovia = false;
    
    for(let py = 0; py < info.h; py++) { 
        for(let px = 0; px < info.w; px++) { 
            if (ocupacao[yGrid + py][xGrid + px]) espacoLivre = false; 
            if (terreno[yGrid + py][xGrid + px] === 'agua_natural') sobreAgua = true; 
            
            let sX = Math.floor((xGrid + px) / SEC_W); 
            let sY = Math.floor((yGrid + py) / SEC_H); 
            if (!setoresDesbloqueados.includes(`${sX},${sY}`)) espacoLivre = false; 
        } 
    }
    
    if (!techs.log_rodoviaria && ferramentaAtual !== 'estrada' && ferramentaAtual !== 'ponte' && ferramentaAtual !== 'agua') { 
        for(let py = -1; py <= info.h; py++) { 
            for(let px = -1; px <= info.w; px++) { 
                let cx = xGrid + px; 
                let cy = yGrid + py; 
                if (cx >= 0 && cx < COLUNAS && cy >= 0 && cy < LINHAS) { 
                    let pAt = listaPredios.find(b => cx >= b.x && cx < b.x + b.w && cy >= b.y && cy < b.y + b.h); 
                    if (pAt && pAt.indestrutivel) tocandoRodovia = true; 
                } 
            } 
        } 
    }
    
    if (tocandoRodovia) espacoLivre = false; 
    if (sobreAgua && ferramentaAtual !== 'estrada' && ferramentaAtual !== 'agua') espacoLivre = false; 
    if (ferramentaAtual === 'agua' && !sobreAgua) espacoLivre = false;
    
    ghost.className = espacoLivre ? 'ghost-valido' : 'ghost-invalido'; 
    ghost.dataset.valido = espacoLivre ? 'sim' : 'nao'; 
    ghost.dataset.gx = xGrid; 
    ghost.dataset.gy = yGrid;
    
    if (isDragging && ferramentaAtual === 'estrada' && (xGrid !== lastDragX || yGrid !== lastDragY)) { 
        lastDragX = xGrid; 
        lastDragY = yGrid; 
        clicarNoGrid(); 
    }
}

function clicarNoGrid() {
    if (!jogoRodando || jogoPausado || isPanning) return;
    
    const ghost = document.getElementById('ghost-cursor'); 
    if (!ghost.dataset.gx) return; 
    
    let x = parseInt(ghost.dataset.gx); 
    let y = parseInt(ghost.dataset.gy);
    
    if (ferramentaAtual === 'apagar' || ferramentaAtual === 'mover') {
        let idx = listaPredios.findIndex(p => x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h);
        if (idx !== -1) { 
            let pM = listaPredios[idx]; 
            if (pM.indestrutivel) return; 
            
            agentes.forEach(a => { 
                if ((a.casa === pM || a.trabalho === pM) && a.carDom) a.carDom.remove(); 
            }); 
            agentes = agentes.filter(a => a.casa !== pM && a.trabalho !== pM);
            
            for(let py = 0; py < pM.h; py++) { 
                for(let px = 0; px < pM.w; px++) {
                    ocupacao[pM.y + py][pM.x + px] = false; 
                }
            } 
            pM.dom.remove(); 
            listaPredios.splice(idx, 1); 
            
            if (ferramentaAtual === 'mover') { 
                recursos.dinheiro += getCustoDinamico(pM.tipo); 
                isRelocating = true; 
                selecionarFerramenta(pM.tipo); 
                isRelocating = true; 
            } 
            atualizarEstradas(); 
            atualizarCustosUI(); 
        } 
        return; 
    }
    
    if (ghost.dataset.valido === 'nao') { 
        if(!isDragging) { 
            ghost.style.transform = 'translate(5px, 0)'; 
            setTimeout(() => ghost.style.transform = 'none', 100); 
        } 
        return; 
    }
    
    let custo = getCustoDinamico(ferramentaAtual); 
    if (recursos.dinheiro < custo) { 
        if(!isDragging) alert("Dinheiro na Câmara insuficiente!"); 
        return; 
    }
    
    construirPredioDireto(x, y, ferramentaAtual, false);
}

function construirPredioDireto(x, y, tipo, isLoading = false) {
    let info = catalogo[tipo]; 
    let tipoReal = tipo; 
    let sobreAgua = false;
    
    for(let py = 0; py < info.h; py++) { 
        for(let px = 0; px < info.w; px++) { 
            ocupacao[y+py][x+px] = true; 
            if (terreno[y+py][x+px] === 'agua_natural') sobreAgua = true; 
        } 
    }
    
    if (tipoReal === 'estrada' && sobreAgua) tipoReal = 'ponte'; 
    if (!isLoading) recursos.dinheiro -= getCustoDinamico(tipoReal);
    
    const domPrédio = document.createElement('div'); 
    domPrédio.className = `predio-render ${tipoReal}`; 
    domPrédio.innerText = info.icone;
    domPrédio.style.gridColumn = `${x + 1} / span ${info.w}`; 
    domPrédio.style.gridRow = `${y + 1} / span ${info.h}`; 
    if (info.poluicao) domPrédio.dataset.polui = "true";
    
    let objPredio = { 
        tipo: tipoReal, x: x, y: y, w: info.w, h: info.h, dom: domPrédio, 
        isCruzamento: false, indestrutivel: false 
    };
    
    document.getElementById('game-board').appendChild(domPrédio); 
    listaPredios.push(objPredio);
    
    if (tipo.includes('residencial') || tipo === 'universidade') { 
        let qtdCarros = 1; 
        if (tipo === 'residencial3') qtdCarros = 2; 
        if (tipo === 'residencial4' || tipo === 'universidade') qtdCarros = 3; 
        spawnAgentesExtras(objPredio, qtdCarros); 
    }
    
    if (!isLoading) { 
        if (tipoReal === 'estrada' || tipoReal === 'ponte') { atualizarEstradas(); } 
        if (isRelocating) { 
            isRelocating = false; 
            selecionarFerramenta('mover'); 
        } 
        atualizarUI(); 
        atualizarCustosUI(); 
    }
}

function spawnAgentesExtras(p, qtd) {
    const coresCarros = ['#e74c3c', '#f1c40f', '#3498db', '#ecf0f1', '#9b59b6']; 
    let currentTimer = Math.floor(Math.random() * 2) + 1; 
    
    for(let i = 0; i < qtd; i++) { 
        agentes.push({ 
            casa: p, trabalho: null, estado: 'home', timer: currentTimer, 
            path: [], viaAtual: null, ox: 0, oy: 0, carDom: null, 
            color: coresCarros[Math.floor(Math.random() * coresCarros.length)], 
            isTruck: false, cssClass: 'carro' 
        }); 
        currentTimer += Math.floor(Math.random() * 3) + 2; 
    }
}

function obterViasAdjacentes(p) { 
    let viasAtivas = listaPredios.filter(v => (v.tipo === 'estrada' || v.tipo === 'ponte') && v.conectada); 
    return viasAtivas.filter(v => { 
        let tX = (v.x < p.x + p.w) && (v.x + v.w > p.x); 
        let tY = (v.y < p.y + p.h) && (v.y + v.h > p.y); 
        let aX = (v.x + v.w === p.x) || (v.x === p.x + p.w); 
        let aY = (v.y + v.h === p.y) || (v.y === p.y + p.h); 
        return (tX && aY) || (tY && aX); 
    }); 
}

function temEstradaGeral(p) { 
    let vias = listaPredios.filter(v => v.tipo === 'estrada' || v.tipo === 'ponte'); 
    return vias.some(v => { 
        let tX = (v.x < p.x + p.w) && (v.x + v.w > p.x); 
        let tY = (v.y < p.y + p.h) && (v.y + v.h > p.y); 
        let aX = (v.x + v.w === p.x) || (v.x === p.x + p.w); 
        let aY = (v.y + v.h === p.y) || (v.y === p.y + p.h); 
        return (tX && aY) || (tY && aX); 
    }); 
}

function temEstradaConectada(p) { 
    return obterViasAdjacentes(p).length > 0; 
}

function distQuad(a, b) { 
    return Math.max(
        Math.max(0, a.x - (b.x + b.w - 1), b.x - (a.x + a.w - 1)), 
        Math.max(0, a.y - (b.y + b.h - 1), b.y - (a.y + a.h - 1))
    ); 
}

function atualizarEstradas() {
    let vias = listaPredios.filter(p => p.tipo === 'estrada' || p.tipo === 'ponte'); 
    vias.forEach(v => { v.conectada = false; v.engarrafada = false; }); 
    
    let fila = vias.filter(v => v.indestrutivel); 
    fila.forEach(v => v.conectada = true); 
    let head = 0;
    
    while(head < fila.length) { 
        let via = fila[head++]; 
        let vizinhos = vias.filter(o => !o.conectada && (
            (o.y + o.h === via.y && o.x < via.x + via.w && o.x + o.w > via.x) || 
            (o.y === via.y + via.h && o.x < via.x + via.w && o.x + o.w > via.x) || 
            (o.x + o.w === via.x && o.y < via.y + via.h && o.y + o.h > via.y) || 
            (o.x === via.x + via.w && o.y < via.y + via.h && o.y + o.h > via.y)
        )); 
        vizinhos.forEach(viz => { viz.conectada = true; fila.push(viz); }); 
    }
    
    vias.forEach(via => {
        via.vizinhos = vias.filter(o => (
            (o.y + o.h === via.y && o.x < via.x + via.w && o.x + o.w > via.x) || 
            (o.y === via.y + via.h && o.x < via.x + via.w && o.x + o.w > via.x) || 
            (o.x + o.w === via.x && o.y < via.y + via.h && o.y + o.h > via.y) || 
            (o.x === via.x + via.w && o.y < via.y + via.h && o.y + o.h > via.y)
        ));
        
        let tC = via.vizinhos.some(o => o.y + o.h === via.y); 
        let tB = via.vizinhos.some(o => o.y === via.y + via.h); 
        let tE = via.vizinhos.some(o => o.x + o.w === via.x); 
        let tD = via.vizinhos.some(o => o.x === via.x + via.w);
        
        let mask = (tC ? 1 : 0) + (tD ? 2 : 0) + (tB ? 4 : 0) + (tE ? 8 : 0); 
        let numVizinhos = (tC ? 1 : 0) + (tD ? 1 : 0) + (tB ? 1 : 0) + (tE ? 1 : 0); 
        via.isCruzamento = (numVizinhos >= 3);
        
        for (let i = 0; i <= 15; i++) {
            via.dom.classList.remove(`e-${i}`); 
        }
        
        via.dom.classList.remove('borda-t', 'borda-r', 'borda-b', 'borda-l', 'inativo'); 
        via.dom.classList.add(`e-${mask}`); 
        via.dom.title = "";
        
        if (via.tipo === 'ponte') { 
            if (!tC && !tD && !tB && !tE) {
                via.dom.classList.add('borda-l', 'borda-r'); 
            } else { 
                if (!tC) via.dom.classList.add('borda-t'); 
                if (!tD) via.dom.classList.add('borda-r'); 
                if (!tB) via.dom.classList.add('borda-b'); 
                if (!tE) via.dom.classList.add('borda-l'); 
            } 
        }
        
        if (!via.conectada && !via.indestrutivel) { 
            via.dom.classList.add('inativo'); 
            via.dom.title = "⚠️ Rua isolada da Rodovia Central"; 
        }
    });
    atualizarVisualSemaforos(); 
}

function atualizarVisualSemaforos() { 
    listaPredios.forEach(p => { 
        p.dom.classList.remove('semaforo-v', 'semaforo-h'); 
        if (p.isCruzamento && p.conectada && !p.engarrafada) {
            p.dom.classList.add(faseSemaforo === 'V' ? 'semaforo-v' : 'semaforo-h'); 
        }
    }); 
}

function atualizarTaxas() {
    taxas.res = parseInt(document.getElementById('taxa-res').value); 
    taxas.com = parseInt(document.getElementById('taxa-com').value); 
    taxas.ind = parseInt(document.getElementById('taxa-ind').value);
    
    document.getElementById('val-taxa-res').innerText = taxas.res; 
    document.getElementById('val-taxa-com').innerText = taxas.com; 
    document.getElementById('val-taxa-ind').innerText = taxas.ind;
}

function atualizarUI() {
    document.getElementById('periodo-dia').innerText = recursos.isNoite ? "🌙 Noite" : "🌞 Dia"; 
    document.body.classList.toggle('noite', recursos.isNoite);
    
    document.getElementById('ciencia').innerText = Math.floor(recursos.ciencia); 
    document.getElementById('taxa-escola').innerText = Math.floor(taxaEscolaridade * 100);
    document.getElementById('especializacao-cidade').innerText = especializacaoAtual; 
    
    let elDinheiro = document.getElementById('dinheiro');
    elDinheiro.innerText = Math.floor(recursos.dinheiro);
    if (recursos.dinheiro < 0) {
        elDinheiro.style.color = "#e74c3c";
        elDinheiro.style.textShadow = "0 0 10px rgba(231,76,60,0.5)";
    } else {
        elDinheiro.style.color = "#2ecc71";
        elDinheiro.style.textShadow = "0 0 10px rgba(46,204,113,0.3)";
    }

    document.getElementById('renda-impostos').innerText = Math.floor(stats.rendaImpostos); 
    document.getElementById('renda-exportacao').innerText = Math.floor(stats.rendaExportacao);
    document.getElementById('renda-turismo').innerText = Math.floor(stats.rendaTurismo); 
    document.getElementById('despesa-manut').innerText = Math.floor(stats.despesaManutencao);
    
    let strSaldo = (recursos.saldo >= 0 ? "+ R$ " : "- R$ ") + Math.abs(Math.floor(recursos.saldo));
    document.getElementById('saldo-ciclo').innerText = strSaldo; 
    document.getElementById('saldo-ciclo').style.color = recursos.saldo >= 0 ? "#2ecc71" : "#e74c3c";
    
    document.getElementById('aprovacao').innerText = Math.floor(recursos.aprovacao);
    let msgEl = document.getElementById('motivo-aprovacao'); 
    msgEl.innerText = feedbackAprovacaoMensagem; 
    msgEl.style.color = feedbackAprovacaoCor;

    document.getElementById('adultos').innerText = stats.adultos; 
    document.getElementById('criancas').innerText = stats.criancas;
    document.getElementById('vagas-totais').innerText = stats.vagasTotais; 
    document.getElementById('trabalhadores').innerText = stats.trabalhadoresUsados;
    document.getElementById('lixo-uso').innerText = stats.lixoU; 
    document.getElementById('lixo-max').innerText = stats.lixoG;
    document.getElementById('aviso-lixo').style.color = stats.lixoU > stats.lixoG ? "#e74c3c" : "white";
    
    const aE = document.getElementById('aviso-emprego');
    if (stats.vagasTotais > stats.adultos) { 
        aE.innerText = `⚠️ Falta Mão de Obra!`; 
        aE.style.color = "#e74c3c"; 
    } else if (stats.adultos > stats.vagasTotais) { 
        aE.innerText = `⚠️ Desemprego / Crime!`; 
        aE.style.color = "#e67e22"; 
    } else { 
        aE.innerText = "✅ Pleno Emprego!"; 
        aE.style.color = "#2ecc71"; 
    }
    
    document.getElementById('energia-max').innerText = stats.energiaG; 
    document.getElementById('energia').innerText = stats.energiaU;
    document.getElementById('agua-max').innerText = stats.aguaG; 
    document.getElementById('agua').innerText = stats.aguaU;
    document.getElementById('vagas-escola').innerText = stats.vagasEscola; 
    document.getElementById('alunos').innerText = stats.criancas;
    document.getElementById('leitos').innerText = stats.leitos; 
    document.getElementById('doentes').innerText = stats.doentes;

    // REVISÃO 3.1: INFORMAÇÕES DE SEGURANÇA NA UI
    document.getElementById('forca-policial').innerText = stats.forcaPolicial; 
    let elCrime = document.getElementById('crime');
    elCrime.innerText = stats.crime;
    elCrime.style.color = stats.crime > stats.forcaPolicial ? "#e74c3c" : "#2ecc71";
}

function selecionarFerramenta(f) {
    ferramentaAtual = f; 
    isRelocating = false; 
    let nome = f.toUpperCase();
    if (f === 'apagar') nome = '🚜 TRATOR'; 
    if (f === 'mover') nome = '🔄 MOVER'; 
    if (f === 'estrada') nome = '🛣️ ESTRADA'; 
    document.getElementById('ferramenta-atual').innerText = `Ferramenta: ${nome}`;
}

const eventosRaros = [
    { requisito: 'robotica', titulo: "🏆 Patrocínio da LASER", desc: "Ganhe fundos, mas irrite moradores.", opcoes: [{ texto: "Aceitar (+R$ 2000, -5% Aprov.)", classe: "", acao: () => { recursos.dinheiro += 2000; recursos.aprovacao -= 5; } }, { texto: "Recusar", classe: "btn-secundario", acao: () => { } }] },
    { requisito: 'festival', titulo: "🎶 Explosão do Manguebeat!", desc: "Turistas inundam a cidade.", opcoes: [{ texto: "Viva o Mangue! (+10% Aprov., +R$ 1000)", classe: "", acao: () => { recursos.aprovacao += 10; recursos.dinheiro += 1000; } }] },
    { condicao: () => stats.adultos >= 30 && listaPredios.some(p => p.tipo === 'agua'), titulo: "⚠️ Crise Hídrica na Região", desc: "Cidades vizinhas pagam o dobro por água.", opcoes: [{ texto: "Exportar com Ágio (-10% Aprov., R$ 1500)", classe: "negativo", acao: () => { recursos.aprovacao -= 10; recursos.dinheiro += 1500; } }, { texto: "Ignorar", classe: "btn-secundario", acao: () => { } }] },
    { condicao: () => Math.floor(recursos.aprovacao) <= 35, titulo: "🚨 Protestos na Cidade!", desc: "O povo exige melhorias imediatas!", opcoes: [{ texto: "Investir (-R$ 1000, +15% Aprov.)", classe: "", acao: () => { if(recursos.dinheiro >= 1000) { recursos.dinheiro -= 1000; recursos.aprovacao += 15; } else { alert("Sem dinheiro!"); recursos.aprovacao -= 5; } } }, { texto: "Força Tática (-10% Aprov.)", classe: "negativo", acao: () => { recursos.aprovacao -= 10; } }] }
];

function dispararEvento() {
    let evPossiveis = eventosRaros.filter(ev => { 
        if (ev.requisito && !listaPredios.some(p => p.tipo === ev.requisito)) return false; 
        if (ev.condicao && !ev.condicao()) return false; 
        return true; 
    });
    
    if (evPossiveis.length === 0) return; 
    
    jogoPausado = true; 
    let ev = evPossiveis[Math.floor(Math.random() * evPossiveis.length)];
    
    document.getElementById('evento-titulo').innerText = ev.titulo; 
    document.getElementById('evento-desc').innerText = ev.desc;
    
    let opcoesDiv = document.getElementById('evento-opcoes'); 
    opcoesDiv.innerHTML = '';
    
    ev.opcoes.forEach(op => { 
        let btn = document.createElement('button'); 
        btn.innerText = op.texto; 
        if (op.classe) btn.className = op.classe; 
        btn.onclick = () => { 
            op.acao(); 
            jogoPausado = false; 
            document.getElementById('modal-evento').classList.add('escondido'); 
            atualizarUI(); 
            cooldownEventos = 350 + Math.floor(Math.random() * 100); 
        }; 
        opcoesDiv.appendChild(btn); 
    });
    
    document.getElementById('modal-evento').classList.remove('escondido');
}

function encontrarCaminhoGPS(inicioPredio, fimPredio) {
    let viasIniciais = (inicioPredio.tipo === 'estrada' || inicioPredio.tipo === 'ponte') ? [inicioPredio] : obterViasAdjacentes(inicioPredio); 
    let viasFinais = (fimPredio.tipo === 'estrada' || fimPredio.tipo === 'ponte') ? [fimPredio] : obterViasAdjacentes(fimPredio);
    
    if (viasIniciais.length === 0 || viasFinais.length === 0) return null; 
    
    let queue = viasIniciais.map(v => [v]); 
    let visited = new Set(viasIniciais.map(v => v.y * COLUNAS + v.x)); 
    let limit = 0;
    
    while (queue.length > 0 && limit < 5000) { 
        limit++; 
        let path = queue.shift(); 
        let curr = path[path.length - 1]; 
        
        if (viasFinais.includes(curr)) return path; 
        
        let vizinhos = curr.vizinhos || []; 
        for (let viz of vizinhos) { 
            if(!viz.conectada) continue; 
            let key = viz.y * COLUNAS + viz.x; 
            if (!visited.has(key)) { 
                visited.add(key); 
                queue.push([...path, viz]); 
            } 
        } 
    }
    return null;
}

// REVISÃO 3.1: PENALIDADE DA RODOVIA
function calcularValorTerreno(p) {
    let valor = 10; 
    let distParque = Math.min(...listaPredios.filter(o => o.tipo === 'parque').map(o => distQuad(p, o))); 
    let distEscola = Math.min(...listaPredios.filter(o => o.tipo === 'escola' || o.tipo === 'universidade').map(o => distQuad(p, o))); 
    let distHosp = Math.min(...listaPredios.filter(o => o.tipo === 'hospital').map(o => distQuad(p, o))); 
    let distPol = Math.min(...listaPredios.filter(o => o.tipo === 'policia').map(o => distQuad(p, o))); 
    let distPoluicao = Math.min(...listaPredios.filter(o => o.tipo === 'usina' || o.tipo === 'aterro' || (o.tipo === 'industrial' && !techs.ind40)).map(o => distQuad(p, o)));
    
    if(distParque <= 4) valor += 15; 
    if(distEscola <= 6) valor += 20; 
    if(distHosp <= 6) valor += 15; 
    if(distPol <= 5) valor += 15; 
    if(distPoluicao <= 4 && !techs.carbono_zero) valor -= 20; 
    
    if (!p.indestrutivel) {
        let coladoRodovia = listaPredios.some(v => v.indestrutivel && (v.tipo === 'estrada' || v.tipo === 'ponte') && distQuad(p, v) <= 1);
        if (coladoRodovia) valor -= 5;
    }

    return Math.floor(valor);
}

// REVISÃO 3.1: CENTRAL DE VERIFICAÇÃO DE POLUIÇÃO (Para Água e Casas)
function estaPoluido(p) {
    let raioPoluicao = techs.carbono_zero ? 0 : (techs.filtros ? 2 : 4); 
    if (raioPoluicao === 0) return false;
    
    return listaPredios.some(ind => { 
        if((ind.tipo === 'industrial' && !techs.ind40) || ind.tipo === 'usina' || ind.tipo === 'aterro') { 
            let dist = distQuad(p, ind); 
            if (dist <= raioPoluicao + (ind.tipo === 'usina' ? 1 : 0)) { 
                if (techs.urbanismo_verde && p.tipo.includes('residencial')) { 
                    let temParqueSalvador = listaPredios.some(pk => pk.tipo === 'parque' && distQuad(p, pk) <= 2 && distQuad(ind, pk) <= dist); 
                    if (temParqueSalvador) return false; 
                } 
                return true; 
            } 
        } 
        return false; 
    }); 
}

function tentarUpgrade(p, novoTipo) {
    let cat = catalogo[novoTipo]; 
    if (p.x + cat.w > COLUNAS || p.y + cat.h > LINHAS) return false;
    
    for(let py = 0; py < cat.h; py++) { 
        for(let px = 0; px < cat.w; px++) { 
            if (py < p.h && px < p.w) continue;  
            if (ocupacao[p.y+py][p.x+px] || terreno[p.y+py][p.x+px] === 'agua_natural') return false; 
        } 
    }
    
    for(let py = 0; py < cat.h; py++) { 
        for(let px = 0; px < cat.w; px++) { 
            ocupacao[p.y+py][p.x+px] = true; 
        } 
    }
    
    p.tipo = novoTipo; 
    p.w = cat.w; 
    p.h = cat.h; 
    p.dom.className = `predio-render ${novoTipo}`; 
    p.dom.innerText = cat.icone; 
    p.dom.style.gridColumn = `${p.x + 1} / span ${p.w}`; 
    p.dom.style.gridRow = `${p.y + 1} / span ${p.h}`; 
    
    atualizarCustosUI(); 
    return true;
}

// REVISÃO 3.1: SISTEMA DE DOWNGRADE
function executarDowngrade(p, novoTipo) {
    let cat = catalogo[novoTipo];
    p.tipo = novoTipo;
    p.w = cat.w;
    p.h = cat.h;
    p.dom.className = `predio-render ${novoTipo}`;
    p.dom.innerText = cat.icone;
    
    // Remove os carros associados ao prédio antigo
    agentes.forEach(a => { if ((a.casa === p || a.trabalho === p) && a.carDom) a.carDom.remove(); });
    agentes = agentes.filter(a => a.casa !== p && a.trabalho !== p);
    
    if(novoTipo === 'residencial') spawnAgentesExtras(p, 1);
    atualizarCustosUI();
}

let ocupacaoVias = {}; 

function motorTransito() {
    if (!jogoRodando || jogoPausado || tempoPausado) return;
    
    tickSemaforo++; 
    if (tickSemaforo >= 4) { 
        faseSemaforo = (faseSemaforo === 'V') ? 'H' : 'V'; 
        tickSemaforo = 0; 
        atualizarVisualSemaforos(); 
    }
    
    let viasAtivas = listaPredios.filter(p => (p.tipo === 'estrada' || p.tipo === 'ponte') && p.conectada); 
    viasAtivas.forEach(v => { 
        v.engarrafada = false; 
        v.dom.classList.remove('engarrafada'); 
    });
    
    let rodoviasNoMapa = viasAtivas.filter(p => p.indestrutivel);
    if (rodoviasNoMapa.length > 0 && Math.random() < 0.2) { 
        let leftEdge = rodoviasNoMapa.find(v => v.x === 0); 
        let rightEdge = rodoviasNoMapa.find(v => v.x === COLUNAS - 2);
        
        if (leftEdge && rightEdge) { 
            let fromLeft = Math.random() > 0.5; 
            let start = fromLeft ? leftEdge : rightEdge; 
            let end = fromLeft ? rightEdge : leftEdge; 
            let path = encontrarCaminhoGPS(start, end); 
            
            if (path) { 
                const coresCarros = ['#e74c3c', '#f1c40f', '#3498db', '#ecf0f1', '#9b59b6']; 
                agentes.push({ 
                    casa: start, trabalho: end, estado: 'indo_trabalho', timer: 0, 
                    path: path, viaAtual: start, ox: 0, oy: 0, carDom: null, 
                    color: coresCarros[Math.floor(Math.random() * coresCarros.length)], 
                    isDummy: true, cssClass: 'carro' 
                }); 
            } 
        }
    }
    
    ocupacaoVias = {}; 
    let sizePx = parseInt(getComputedStyle(document.body).getPropertyValue('--tamanho-celula'));
    
    agentes.forEach(a => {
        if ((a.estado === 'indo_trabalho' || a.estado === 'indo_casa') && a.path.length > 0) {
            let nextVia = a.path[0]; 
            let prevVia = a.viaAtual || a.casa || nextVia; 
            let ox = 0, oy = 0; 
            let dx = nextVia.x - prevVia.x; 
            let dy = nextVia.y - prevVia.y;
            
            if (dx > 0) oy = 6; 
            else if (dx < 0) oy = -6; 
            else if (dy > 0) ox = -6; 
            else if (dy < 0) ox = 6; 
            
            let sinalVermelho = false;
            if (nextVia.isCruzamento && prevVia !== nextVia) { 
                if (dy !== 0 && faseSemaforo === 'H') sinalVermelho = true; 
                if (dx !== 0 && faseSemaforo === 'V') sinalVermelho = true; 
                if (sinalVermelho && techs.ia_transito) { 
                    let temCarroCruzando = agentes.some(outro => outro !== a && outro.carDom && (outro.viaAtual === nextVia || (outro.path.length > 0 && outro.path[0] === nextVia && ((dy !== 0 && outro.viaAtual.y === nextVia.y) || (dx !== 0 && outro.viaAtual.x === nextVia.x))))); 
                    if (!temCarroCruzando) sinalVermelho = false; 
                } 
            }
            
            if (sinalVermelho) return; 
            
            let temCarroNaFrente = agentes.some(outro => outro !== a && outro.carDom && outro.viaAtual === nextVia && outro.ox === ox && outro.oy === oy); 
            if (temCarroNaFrente) return; 
            
            a.path.shift(); 
            a.viaAtual = nextVia; 
            a.ox = ox; 
            a.oy = oy;
            
            if (!viasAtivas.includes(nextVia)) { 
                if (a.carDom) { a.carDom.remove(); a.carDom = null; } 
                a.estado = 'home'; a.timer = 3; a.path = []; 
                return; 
            }
            
            if (!a.carDom) { 
                a.carDom = document.createElement('div'); 
                a.carDom.className = a.cssClass || 'carro'; 
                a.carDom.style.backgroundColor = a.color; 
                document.getElementById('game-board').appendChild(a.carDom); 
            }
            a.carDom.style.transform = `translate(calc(${nextVia.x + 1} * ${sizePx}px - 3px + ${ox}px), calc(${nextVia.y + 1} * ${sizePx}px - 3px + ${oy}px))`;
        
        } else if ((a.estado === 'indo_trabalho' || a.estado === 'indo_casa') && a.path.length === 0) {
            if (a.isDummy) { 
                a.delete = true; 
            } else if (a.estado === 'indo_trabalho') { 
                a.estado = 'work'; 
                a.timer = 3; 
            } else { 
                if (a.isTruck) { 
                    a.delete = true; 
                } else { 
                    a.estado = 'home'; 
                    a.timer = Math.floor(Math.random() * 3) + 2; 
                } 
            }
            if (a.carDom) { a.carDom.remove(); a.carDom = null; } 
            a.viaAtual = null;
        }
        
        if (a.viaAtual && a.carDom) { 
            let id = a.viaAtual.x + ',' + a.viaAtual.y; 
            ocupacaoVias[id] = (ocupacaoVias[id] || 0) + 1; 
            if (ocupacaoVias[id] >= 3) { a.viaAtual.engarrafada = true; } 
        }
    });
    
    viasAtivas.forEach(v => { 
        if (v.engarrafada) v.dom.classList.add('engarrafada'); 
    }); 
    agentes = agentes.filter(a => !a.delete);
}

function motorEconomia() {
    if (!jogoRodando || jogoPausado || tempoPausado) return;
    
    cooldownEventos--; 
    if (cooldownEventos <= 0 && Math.random() < 0.20) { dispararEvento(); return; }
    
    recursos.tickRelogio++; 
    if (recursos.tickRelogio >= (recursos.isNoite ? 20 : 100)) { 
        if (!recursos.isNoite) primeiraNoitePassou = true; // REVISÃO 3.1: Fim da Imunidade
        recursos.isNoite = !recursos.isNoite; 
        recursos.tickRelogio = 0; 
    }
    
    let rodoviasAtivas = listaPredios.filter(p => (p.tipo === 'estrada' || p.tipo === 'ponte') && p.indestrutivel && p.conectada);
    
    if (rodoviasAtivas.length > 0 && stats.adultos > 0 && !recursos.isNoite) {
        let industriasAtivas = listaPredios.filter(p => p.tipo === 'industrial' && p.conectada);
        industriasAtivas.forEach(ind => { 
            let temCaminhao = agentes.some(a => a.isTruck && (a.trabalho === ind || a.casa === ind)); 
            if (!temCaminhao && Math.random() < 0.2 && rodoviasAtivas.some(p => !p.isTruck)) { 
                let spawn = rodoviasAtivas[Math.floor(Math.random() * rodoviasAtivas.length)]; 
                let path = encontrarCaminhoGPS(spawn, ind); 
                if (path) agentes.push({ casa: spawn, trabalho: ind, estado: 'indo_trabalho', timer: 1, path: path, viaAtual: spawn, ox: 0, oy: 0, carDom: null, color: '#34495e', isTruck: true, cssClass: 'caminhao' }); 
            } 
        });
        
        let aterrosAtivos = listaPredios.filter(p => (p.tipo === 'aterro' || p.tipo === 'reciclagem') && p.conectada);
        aterrosAtivos.forEach(at => { 
            let temCaminhao = agentes.some(a => a.isTruck && (a.trabalho === at || a.casa === at)); 
            if (!temCaminhao && Math.random() < 0.2 && rodoviasAtivas.some(p => !p.isTruck)) { 
                let spawn = rodoviasAtivas[Math.floor(Math.random() * rodoviasAtivas.length)]; 
                let path = encontrarCaminhoGPS(spawn, at); 
                if (path) agentes.push({ casa: spawn, trabalho: at, estado: 'indo_trabalho', timer: 1, path: path, viaAtual: spawn, ox: 0, oy: 0, carDom: null, color: '#e67e22', isTruck: true, cssClass: 'caminhao' }); 
            } 
        });
    }

    let locaisTrabalho = listaPredios.filter(p => temEstradaConectada(p) && ['comercial', 'comercial2', 'comercial3', 'industrial', 'robotica', 'escola', 'universidade', 'hospital', 'policia', 'terminal', 'reciclagem'].includes(p.tipo));
    
    agentes.forEach(a => {
        if (a.estado === 'home' && !a.isTruck && !a.isDummy) { 
            if (recursos.isNoite) return; 
            a.timer--; 
            if (a.timer <= 0) { 
                if (locaisTrabalho.length > 0) { 
                    let job = locaisTrabalho[Math.floor(Math.random() * locaisTrabalho.length)]; 
                    let path = encontrarCaminhoGPS(a.casa, job); 
                    if (path) { a.estado = 'indo_trabalho'; a.trabalho = job; a.path = path; a.viaAtual = a.casa; } else { a.timer = 1; } 
                } else { a.timer = 1; } 
            }
        } else if (a.estado === 'work') { 
            a.timer--; 
            if (a.timer <= 0 || (recursos.isNoite && !a.isTruck && !a.isDummy)) { 
                let target = a.isTruck ? rodoviasAtivas[Math.floor(Math.random() * rodoviasAtivas.length)] : a.casa; 
                let path = encontrarCaminhoGPS(a.trabalho, target); 
                if (path) { a.estado = 'indo_casa'; a.path = path; a.viaAtual = a.trabalho; } else { if (a.isTruck) a.delete = true; else { a.estado = 'home'; a.timer = 3; } } 
            } 
        }
    });

    let mE = (recursos.isNoite && !techs.baterias) ? 2 : 1; 
    let multSmart = techs.smart_city ? 0.7 : 1.0; 
    let multAgua = techs.tratamento_agua ? 0.8 : 1.0; 
    let multAuto = techs.automacao ? 0.5 : 1.0; 
    let multTur = techs.cap_turistica ? 3.0 : (techs.cap_cultural ? 2.0 : 1.0); 
    let multCien = techs.vale_tec ? 3.0 : 1.0;
    
    stats = { adultos:0, criancas:0, vagasTotais:0, trabalhadoresUsados:0, energiaG:0, energiaU:0, aguaG:0, aguaU:0, lixoG:0, lixoU:0, vagasEscola:0, leitos:0, forcaPolicial:0, doentes:0, crime:0, rendaImpostos:0, rendaExportacao:0, rendaTransporte:0, rendaTurismo:0, despesaManutencao:0, cienciaGerada: 0 };
    let comerciosAtivos = 0; 
    let rIndBase = 0; 
    let geradoresAtivos = []; 
    let deltaAprovacao = 0;

    let nomesNiveis = { 'residencial': '🏠 Casa Nível 1', 'residencial2': '🏡 Casa Grande Nível 2', 'residencial3': '🏰 Mansão Nível 3', 'residencial4': '🏙️ Arranha-Céus Nível 4', 'comercial': '🏪 Mercadinho Nível 1', 'comercial2': '🛒 Mercado Nível 2', 'comercial3': '🏬 Shopping Nível 3', 'industrial': '🏭 Indústria', 'robotica': '🤖 Lab. de Robótica', 'escola': '🏫 Escola', 'universidade': '🎓 Universidade', 'hospital': '🏥 Hospital', 'policia': '🚓 Polícia', 'reciclagem': '♻️ Centro de Reciclagem', 'festival': '🦀 Festival Manguebeat', 'parque': '🌳 Parque Municipal', 'terminal': '🚌 Terminal' };

    listaPredios.forEach(p => {
        let info = catalogo[p.tipo]; 
        if (!info) return; 
        p.dom.classList.remove('inativo', 'poluido', 'apagao'); 
        let estGeral = temEstradaGeral(p); 
        let estConectada = temEstradaConectada(p);
        
        if (p.tipo === 'estrada' || p.tipo === 'ponte') { 
            if (!p.indestrutivel) { stats.despesaManutencao += info.manutencao; } 
            if (!p.conectada && !p.indestrutivel) { p.dom.classList.add('inativo'); p.dom.title = "⚠️ Rua isolada"; } 
        } else {
            let vagasT = info.trabConsumo || 0; 
            if(p.tipo === 'industrial' && techs.ind_autonoma) vagasT = Math.ceil(vagasT / 2);
            
            if (!['estrada', 'ponte', 'usina', 'solar', 'agua', 'aterro'].includes(p.tipo)) { 
                if (estConectada) stats.vagasTotais += vagasT;
            } else if (p.tipo !== 'estrada' && p.tipo !== 'ponte') {
                let utilNomes = { 'usina':'🏭 Usina a Carvão', 'solar':'☀️ Usina Solar', 'agua':"💧 Bomba d'Água", 'aterro':'🗑️ Aterro Sanitário' }; 
                let utilTooltip = `[ ${utilNomes[p.tipo]} ]\n`; 
                if(info.energiaGera) utilTooltip += `⚡ Gera Energia: ${info.energiaGera} MW\n`; 
                if(info.aguaGera) utilTooltip += `💧 Gera Água: ${info.aguaGera} ML\n`; 
                if(info.lixoGera) utilTooltip += `🗑️ Capacidade Lixo: ${info.lixoGera} Ton\n`;
                
                if (!estConectada) { 
                    p.dom.classList.add('inativo'); 
                    p.dom.title = utilTooltip + (estGeral ? "⚠️ Rua isolada da Rodovia Central." : "⚠️ Sem acesso à rua!"); 
                    stats.despesaManutencao += (info.manutencao || 0) * 0.5;
                } else {
                    // REVISÃO 3.1: CONTAMINAÇÃO HÍDRICA
                    if (p.tipo === 'agua' && estaPoluido(p)) {
                        p.dom.classList.add('inativo', 'poluido');
                        p.dom.title = utilTooltip + "☢️ ÁGUA CONTAMINADA!";
                        stats.despesaManutencao += info.manutencao;
                    } else {
                        p.dom.title = utilTooltip + "✅ Operando Normalmente"; 
                        if (p.tipo === 'usina' || p.tipo === 'solar') { stats.despesaManutencao += info.manutencao; stats.energiaG += info.energiaGera; geradoresAtivos.push(p); } 
                        else if (p.tipo === 'agua') { stats.despesaManutencao += info.manutencao; stats.aguaG += info.aguaGera; } 
                        else if (p.tipo === 'aterro') { stats.despesaManutencao += info.manutencao; stats.lixoG += info.lixoGera; } 
                    }
                }
            }
            if (p.tipo !== 'usina' && p.tipo !== 'solar' && p.tipo !== 'agua' && p.tipo !== 'aterro') { 
                if (!estConectada) { stats.despesaManutencao += (info.manutencao || 0) * 0.5; } 
            }
        }
    });

    let eDisp = stats.energiaG, aDisp = stats.aguaG;
    listaPredios.forEach(p => { 
        p.distGerador = geradoresAtivos.length > 0 ? Math.min(...geradoresAtivos.map(g => distQuad(p, g))) : 9999; 
    });

    let prediosOrdenados = [...listaPredios].sort((a, b) => { 
        let rankA = a.tipo.includes('residencial') ? 1 : (['hospital', 'policia', 'reciclagem', 'escola', 'universidade'].includes(a.tipo) ? 2 : 3); 
        let rankB = b.tipo.includes('residencial') ? 1 : (['hospital', 'policia', 'reciclagem', 'escola', 'universidade'].includes(b.tipo) ? 2 : 3); 
        if (rankA !== rankB) return rankA - rankB; 
        
        let aConsome = (catalogo[a.tipo].energiaConsumo || 0) > 0; 
        let bConsome = (catalogo[b.tipo].energiaConsumo || 0) > 0; 
        if (aConsome && bConsome && a.distGerador !== b.distGerador) return a.distGerador - b.distGerador; 
        return 0; 
    });

    prediosOrdenados.forEach(p => {
        let info = catalogo[p.tipo]; 
        if (!info || ['estrada', 'ponte', 'usina', 'solar', 'agua', 'aterro'].includes(p.tipo)) return;
        let estConectada = temEstradaConectada(p); 
        if (!estConectada) { p.dom.classList.add('inativo'); return; }

        let vizinhosVias = obterViasAdjacentes(p); 
        let sofreTransito = vizinhosVias.some(v => v.engarrafada); 
        let multTransito = sofreTransito ? 0.7 : 1.0; 
        let valTerreno = calcularValorTerreno(p); 
        let poluido = false; 
        
        if (p.tipo.includes('residencial')) { 
            poluido = estaPoluido(p);
        }
        
        let consT = info.trabConsumo || 0; 
        if(p.tipo === 'industrial' && techs.ind_autonoma) consT = Math.ceil(consT / 2);
        
        let nomeVisual = nomesNiveis[p.tipo] || p.tipo.toUpperCase(); 
        let tooltip = `[ ${nomeVisual} ]\n`;
        
        if (info.popA) tooltip += `👥 Habitantes: ${info.popA}\n`; 
        if (consT > 0) tooltip += `👷 Exige Trabalhadores: ${consT}\n`; 
        if (info.vagasEscola) tooltip += `🎓 Vagas de Estudo: ${info.vagasEscola}\n`; 
        if (info.leitos) tooltip += `🛏️ Leitos de Saúde: ${info.leitos}\n`; 
        if (p.tipo.includes('residencial') || p.tipo.includes('comercial')) tooltip += `💰 Valor do Terreno: ${valTerreno}\n`; 
        tooltip += `\n`;
        
        let consE = Math.ceil((info.energiaConsumo || 0) * mE * multSmart); 
        let consA = Math.ceil((info.aguaConsumo || 0) * multSmart * multAgua); 
        let consLixo = info.lixoConsumo || 0;
        
        let err = []; 
        if (eDisp < consE) err.push("⚡ APAGÃO SETORIAL"); 
        if (aDisp < consA) err.push("Falta Água"); 
        if (consT > 0 && (stats.adultos - stats.trabalhadoresUsados) < consT) err.push("Falta Trabalhadores");
        
        let temTudo = (eDisp >= consE) && (aDisp >= consA) && (consT === 0 || (stats.adultos - stats.trabalhadoresUsados) >= consT);
        if (p.tipo === 'robotica' && !listaPredios.some(o => o.tipo === 'escola' || o.tipo === 'universidade')) { temTudo = false; err.push("Exige Escolas/Univ."); }
        if (p.tipo === 'festival' && !listaPredios.some(t => t.tipo === 'terminal' && distQuad(p, t) <= 8)) { temTudo = false; err.push("Exige Terminal próximo"); }

        if (temTudo) { 
            eDisp -= consE; 
            aDisp -= consA; 
            stats.energiaU += consE; 
            stats.aguaU += consA; 
            if (consT > 0) stats.trabalhadoresUsados += consT; 
            stats.lixoU += consLixo;
            
            let manut = info.manutencao || 0; 
            if(p.tipo === 'industrial') manut *= multAuto; 
            stats.despesaManutencao += manut;
            
            if (p.tipo.includes('residencial')) { 
                stats.adultos += info.popA; 
                stats.criancas += info.popC; 
                stats.rendaImpostos += info.popA * (taxas.res/10); 
                if(sofreTransito && Math.random() < 0.2) deltaAprovacao -= 1; 
            }
            else if (p.tipo.includes('comercial')) { 
                stats.rendaImpostos += consT * (taxas.com/2) * multTransito * (techs.distrito_fin ? 1.2 : 1.0); 
                comerciosAtivos++; 
            }
            else if (p.tipo === 'industrial') { 
                let iRenda = consT * (taxas.ind/2) * multTransito * (techs.fab_inteligentes ? 1.3 : 1.0); 
                stats.rendaImpostos += iRenda; 
                rIndBase += iRenda; 
                if (techs.eco_industrial) { stats.energiaG += 15; geradoresAtivos.push(p); } 
            }
            else if (p.tipo === 'robotica') { stats.rendaImpostos += consT * taxas.ind; }
            else if (p.tipo === 'festival') { stats.rendaTurismo += (techs.turismo_reg ? 300 : 150) * multTur; deltaAprovacao += 1; }
            else if (p.tipo === 'reciclagem') { stats.rendaImpostos += (techs.eco_circular ? 500 : 200); stats.lixoG += info.lixoGera; }
            else if (p.tipo === 'escola') { stats.vagasEscola += info.vagasEscola; stats.cienciaGerada += techs.edu_basica ? 1.0 : info.pc; }
            else if (p.tipo === 'universidade') { stats.vagasEscola += info.vagasEscola; stats.adultos += info.popA; stats.cienciaGerada += info.pc; }
            else if (p.tipo === 'hospital') { stats.leitos += info.leitos; }
            else if (p.tipo === 'policia') { stats.forcaPolicial += info.forcaPolicial; }
            else if (p.tipo === 'parque') { deltaAprovacao += techs.parques_urb ? 0.5 : 0; }
            else if (p.tipo === 'terminal' && techs.transp_publico) { deltaAprovacao += 0.5; }
            
            if (poluido && p.tipo.includes('residencial')) { 
                p.dom.classList.add('poluido'); 
                p.dom.title = tooltip + "☢️ ÁREA TÓXICA! Moradores doentes."; 
                stats.doentes += info.popA; 
            } else { 
                p.dom.title = tooltip + (sofreTransito ? `⚠️ ENGARRAFAMENTO (-30% Lucro)` : `✅ Funcional e Operando`); 
            }
        } else { 
            p.dom.classList.add('inativo'); 
            if (err.includes("⚡ APAGÃO SETORIAL")) p.dom.classList.add('apagao');
            p.dom.title = tooltip + "⚠️ ERROS CRÍTICOS:\n- " + err.join('\n- '); 
            let manut = info.manutencao || 0; 
            if(p.tipo === 'industrial') manut *= multAuto; 
            stats.despesaManutencao += (manut * 0.5);
        }
    });

    let popTotalEsperada = stats.adultos > 0 ? stats.adultos : 1; 
    taxaEscolaridade = Math.min(1, stats.vagasEscola / Math.max(1, (stats.criancas + (popTotalEsperada * 0.1))));
    historicoRenda.ind = rIndBase; 
    historicoRenda.total = stats.rendaImpostos + stats.rendaTurismo;

    let desemprego = Math.max(0, stats.adultos - stats.trabalhadoresUsados); 
    let taxaIgnorancia = 1 - taxaEscolaridade;
    stats.crime = Math.max(0, stats.criancas - stats.vagasEscola) + Math.floor(desemprego * 1.2) + Math.floor((stats.adultos * taxaIgnorancia) * 0.5);
    
    let mults = { ind: 1, tur: 1, ci: 1 }; 
    especializacaoAtual = "Nenhuma";
    if (historicoRenda.total > 500) {
        if (techs.polo_turistico) { especializacaoAtual = "Polo Turístico Manguebeat"; mults.tur = 3.0; mults.ind = 0.8; } 
        else if (techs.cidade_verde && taxaEscolaridade > 0.8) { especializacaoAtual = "Cidade Verde / Tecnológica"; mults.ci = 1.5; } 
        else if (historicoRenda.ind > historicoRenda.total * 0.4) { especializacaoAtual = "Polo Industrial Pesado"; mults.ind = 1.2; mults.tur = 0.5; }
    }
    
    let baseCiencia = stats.adultos * taxaEscolaridade * (techs.cid_conhecimento ? 0.05 : 0.01); 
    stats.cienciaGerada = (stats.cienciaGerada + baseCiencia) * mults.ci * multCien; 
    recursos.ciencia += stats.cienciaGerada;

    demanda.res = (Math.max(0, stats.vagasTotais - stats.adultos) * 1.5) + (recursos.aprovacao * 0.2) - 10;
    demanda.com = (stats.adultos * 0.5) - (comerciosAtivos * 10) + (recursos.aprovacao * 0.1);
    demanda.ind = (desemprego * 1.5) + (comerciosAtivos * 0.5) - 5; 

    let valExportacao = Math.max(0, stats.energiaG - stats.energiaU) + Math.max(0, stats.aguaG - stats.aguaU); 
    stats.rendaExportacao = (techs.livre_comercio ? valExportacao * 2 : valExportacao) * (techs.logistica ? 1.2 : 1.0);
    
    // REVISÃO 3.1: MATEMÁTICA LENTA E SEM EFEITO ELÁSTICO
    let deltaImpostos = 0;
    if (taxas.res < 8) deltaImpostos += 0.1; else if (taxas.res > 10) deltaImpostos -= 1;
    if (taxas.com < 11) deltaImpostos += 0.1; else if (taxas.com > 15) deltaImpostos -= 1;
    if (taxas.ind < 20) deltaImpostos += 0.1; else if (taxas.ind > 25) deltaImpostos -= 1;
    
    let crimeRestante = Math.max(0, stats.crime - stats.forcaPolicial);
    let isEarlyGame = !primeiraNoitePassou; // A imunidade agora acaba na primeira noite
    
    if (stats.adultos === 0) {
        feedbackAprovacaoMensagem = "👻 Cidade Fantasma"; 
        feedbackAprovacaoCor = "#bdc3c7";
    } else {
        
        // No Early Game, a aprovação simplesmente não cai por problemas estruturais
        if (isEarlyGame && deltaAprovacao < 0) {
            deltaAprovacao = 0; 
        }
        
        recursos.aprovacao += deltaAprovacao; 
        recursos.aprovacao += deltaImpostos;  

        if (crimeRestante > 0 && !isEarlyGame) {
            stats.rendaImpostos *= (1 - (Math.min(0.5, crimeRestante * 0.02))); 
            recursos.aprovacao -= 1;
            feedbackAprovacaoMensagem = "🚨 Crime Assusta!"; 
            feedbackAprovacaoCor = "#e74c3c";
        } else if (stats.lixoU > stats.lixoG && !isEarlyGame) {
            recursos.aprovacao -= 2;
            feedbackAprovacaoMensagem = "🗑️ Lixo nas Ruas!"; 
            feedbackAprovacaoCor = "#e74c3c";
        } else if (stats.doentes > stats.leitos && !isEarlyGame) {
            recursos.aprovacao -= 1;
            feedbackAprovacaoMensagem = "🏥 Faltam Hospitais!"; 
            feedbackAprovacaoCor = "#e74c3c";
        } else if (recursos.dinheiro < 0 && !isEarlyGame) { 
            recursos.aprovacao -= 2;
            feedbackAprovacaoMensagem = "💸 Prefeitura Falida!"; 
            feedbackAprovacaoCor = "#e74c3c";
        } else {
            if (deltaImpostos < 0) {
                feedbackAprovacaoMensagem = "😡 Impostos Abusivos"; 
                feedbackAprovacaoCor = "#e74c3c";
            } else if (deltaImpostos > 0 && recursos.aprovacao < 100) {
                feedbackAprovacaoMensagem = "💖 Paraíso Fiscal"; 
                feedbackAprovacaoCor = "#2ecc71";
            } else {
                feedbackAprovacaoMensagem = "⚖️ Impostos Neutros"; 
                feedbackAprovacaoCor = "#3498db";
            }
            
            if (isEarlyGame) {
                feedbackAprovacaoMensagem = "🌱 Imunidade de Vila"; 
                feedbackAprovacaoCor = "#f1c40f";
            }
        }
    }

    recursos.saldo = stats.rendaImpostos + stats.rendaExportacao + stats.rendaTransporte + stats.rendaTurismo - stats.despesaManutencao;
    if (techs.bolsa_valores) { recursos.saldo *= 1.15; } 
    recursos.dinheiro += recursos.saldo;
    
    let cap = especializacaoAtual.includes("Verde") ? 110 : (techs.smart_city ? 105 : 100); 
    recursos.aprovacao = Math.min(cap, Math.max(0, recursos.aprovacao));
    
    atualizarUI();
}

function motorFisica() {
    if (!jogoRodando || jogoPausado || tempoPausado) return; 
    
    listaPredios.forEach(p => {
        let valTerreno = calcularValorTerreno(p); 
        let poluido = false; 
        
        if (p.tipo.includes('residencial')) { 
            poluido = estaPoluido(p);
        }
        
        // REVISÃO 3.1: DOWNGRADES (Se o valor do terreno afundar, os prédios de luxo entram em ruína)
        if (p.tipo === 'residencial2' && valTerreno < 30) executarDowngrade(p, 'residencial');
        else if (p.tipo === 'residencial3' && valTerreno < 55) executarDowngrade(p, 'residencial');
        else if (p.tipo === 'residencial4' && valTerreno < 80) executarDowngrade(p, 'residencial');
        else if (p.tipo === 'comercial2' && valTerreno < 25) executarDowngrade(p, 'comercial');
        else if (p.tipo === 'comercial3' && valTerreno < 50) executarDowngrade(p, 'comercial');
        
        // UPGRADES
        else if (!poluido) { 
            if (p.tipo === 'residencial' && techs.casa_grande && valTerreno >= 30 && Math.floor(recursos.aprovacao) >= 60) { 
                if(tentarUpgrade(p, 'residencial2')) { } 
            } else if (p.tipo === 'residencial2' && techs.mansao && valTerreno >= 55 && Math.floor(recursos.aprovacao) >= 80) { 
                if(tentarUpgrade(p, 'residencial3')) spawnAgentesExtras(p, 1); 
            } else if (p.tipo === 'residencial3' && techs.metropole_vertical && valTerreno >= 80 && Math.floor(recursos.aprovacao) >= 90) { 
                if(tentarUpgrade(p, 'residencial4')) spawnAgentesExtras(p, 2); 
            }
            
            if (p.tipo === 'comercial' && techs.supermercado && valTerreno >= 25 && Math.floor(recursos.aprovacao) >= 60) { 
                tentarUpgrade(p, 'comercial2'); 
            } else if (p.tipo === 'comercial2' && techs.shopping && valTerreno >= 50 && Math.floor(recursos.aprovacao) >= 80) { 
                tentarUpgrade(p, 'comercial3'); 
            }
        }
    });
}