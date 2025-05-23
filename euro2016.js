/** 
 * Aplicações multimeedia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// sons do jogo
const sounds = {
	background: new Audio ('sounds/background.mp3'),
    flip: new Audio ('sounds/flip.mp3'),
    success: new Audio ('sounds/success.mp3'),
    hide: new Audio ('sounds/hide.mp3')
};

// numero de linhas e colunas do tabuleiro;
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
//const board = Array(ROWS).fill().map(() => Array(COLS).fill(null)); // criação do tabuleiro como um array de 4 linhas x 8 colunas

const CARDSIZE = 102; 

let firstCard = null;
let secondCard = null;
let flip = true;
let matchPairsFound = false;
let timeHandler;  
let tempoDecorrido = 0;
let contador = 0;  

const maxCount = 46;  // Define o limite de 45 segundos
let tempoInicial = Date.now();

// Array que armazena objectos face que contem posicionamentos da imagem e codigos dos paises
let faces = [
    { code: "DE", img: "images/Alemanha.png" },   // Alemanha
    { code: "BE", img: "images/Belgica.png" },   // Belgica
    { code: "FR", img: "images/Franca.png" },    // França
    { code: "WA", img: "images/Gales.png" },     // País de Gales
    { code: "IS", img: "images/Islandia.png" },   // Islândia
    { code: "IT", img: "images/Italia.png" },     // Itália
    { code: "PL", img: "images/Polonia.png" },    // Polônia
    { code: "PT", img: "images/Portugal.png" }   // Portugal
];	

let cartas = [];

window.addEventListener("load", init, false);
window.addEventListener("keydown", (e) => { if (e.code === "Space") restartGame(); });

function init() {
    game.stage = document.querySelector("#stage");
    document.querySelector("#restartbtn").addEventListener("click", restartGame);

    clearInterval(timeHandler); // Resetar o tempo se necessário
    setupAudio();               // Configurar o áudio
    createCountries();          // Criar países
    game.sounds.background.loop = true;
    game.sounds.background.play();

    showAllCards();             // Mostra todas as cartas inicialmente

    // Espera 2 segundos antes de começar o baralhamento
    setTimeout(() => {
        scrambleInitial();             // Embaralha as cartas visivelmente
        setTimeout(() => {
            hideAllCards();     // Esconde as cartas após o baralhamento
            startTimer();       // Inicia o temporizador
        }, 2000);               // Espera 2 segundos após o embaralhamento
    }, 2000);                   // Espera 2 segundos antes de embaralhar

    // Criar a barra de progresso
    ProgressBar();
    updateProgressBar(contador);
}

function setupBoard() {
    let mixedFaces = [...faces, ...faces];
    mixedFaces = mixedFaces.sort(() => Math.random() - 0.5);
    game.stage.innerHTML = "";

    cartas.forEach((carta, index) => {
        let umaCarta = document.createElement("div");
        umaCarta.classList.add("carta", "escondida");
        umaCarta.style.backgroundImage = `url(../images/download.png)`;
        umaCarta.style.backgroundPosition = `-${carta.x}px -${carta.y}px`;
        umaCarta.dataset.country = carta.country;
        umaCarta.addEventListener("click", virarCarta);
    });
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	 
}

function createCountries() {
    const tabuleiro = document.querySelector("#tabuleiro");
    tabuleiro.innerHTML = "";

    let totalCartas = ROWS * COLS;
    cartas = [];

    for (let i = 0; i < totalCartas / 2; i++) {
        let umaFace1 = { country: faces[i].code, img: faces[i].img };
        let umaFace2 = { country: faces[i].code, img: faces[i].img };
        cartas.push(umaFace1, umaFace2);
    }

    cartas.sort(() => Math.random() - 0.5);

    cartas.forEach((carta) => {
        let umaCarta = document.createElement("div");
        umaCarta.classList.add("carta");
        umaCarta.dataset.country = carta.country;
        umaCarta.style.backgroundImage = `url(${carta.img})`;
        umaCarta.style.backgroundSize = "cover";
        umaCarta.addEventListener("click", virarCarta);
        tabuleiro.appendChild(umaCarta);
    });
}


// Mostra todas as cartas
function showAllCards() {
    document.querySelectorAll(".carta").forEach(carta => {
        carta.classList.add("virada"); // Aplica a classe 'virada' para mostrar a imagem
    });
}


// Esconde todas as cartas, voltando à imagem inicial
function hideAllCards() {
    document.querySelectorAll(".carta").forEach(carta => {
        carta.classList.remove("virada"); // Remove a classe 'virada' para esconder a imagem
        carta.style.backgroundImage = "url('images/download.png')"; // Reverte a imagem de fundo para a inicial
    });
}


// Scramble inicial
function scrambleInitial() {
    const tabuleiro = document.querySelector("#tabuleiro");
    let cartas = Array.from(tabuleiro.children); // Pega todas as cartas do tabuleiro
    
    // Embaralha as cartas
    cartas.sort(() => Math.random() - 0.5);

    // Reposiciona as cartas no tabuleiro
    cartas.forEach((carta, index) => {
        tabuleiro.appendChild(carta); // Adiciona a carta no novo local
    });
}

let isScrambling = false;
// Scramble após os 45 segundos
function scrambleAfterTime() {
    if (isScrambling) return; // Impede baralhamentos simultâneos
    isScrambling = true;

    const tabuleiro = document.querySelector("#tabuleiro");
    let cartas = Array.from(tabuleiro.children);

    // Cria uma nova ordem preservando posições das cartas bloqueadas
    let novaOrdem = Array(cartas.length);
    let cartasNaoBloqueadas = [];

    cartas.forEach((carta, index) => {
        if (carta.classList.contains("bloqueada")) {
            novaOrdem[index] = carta; // Mantém carta bloqueada na mesma posição
        } else {
            cartasNaoBloqueadas.push(carta); // Para baralhar
        }
    });

    // Embaralha cartas não bloqueadas
    cartasNaoBloqueadas.sort(() => Math.random() - 0.5);

    // Preenche posições vazias com cartas baralhadas
    let indexEmbaralhada = 0;
    for (let i = 0; i < novaOrdem.length; i++) {
        if (!novaOrdem[i]) {
            novaOrdem[i] = cartasNaoBloqueadas[indexEmbaralhada];
            indexEmbaralhada++;
        }
    }

    // Atualiza o DOM com a nova ordem
    novaOrdem.forEach(carta => {
        tabuleiro.appendChild(carta);
    });

    // Esconde as cartas não bloqueadas após 2 segundos
    setTimeout(() => {
        cartasNaoBloqueadas.forEach(carta => {
            carta.classList.remove("virada");
            carta.style.backgroundImage = "url('images/download.png')";
        });

        isScrambling = false; // Libera para futuros embaralhamentos
    }, 2000);
}

function virarCarta() {
    if (this.classList.contains("virada") || secondCard) return;
    this.classList.add("virada");
    let countryCode = this.dataset.country;
    let cartaCorrespondente = faces.find(f => f.code === countryCode);

    if (cartaCorrespondente) {
        this.style.backgroundImage = `url(${cartaCorrespondente.img})`;
        game.sounds.flip.play();
    }

    if (!firstCard) {
        firstCard = this;
    } else {
        secondCard = this;
        setTimeout(matchPairs, 500);
    }
}

function matchPairs() {
    if (!firstCard || !secondCard) return;

    if (firstCard.dataset.country === secondCard.dataset.country) {
        game.sounds.success.play();
        // Marca as cartas como bloqueadas (não movem durante o embaralhamento)
        firstCard.classList.add("bloqueada");
        secondCard.classList.add("bloqueada");

        firstCard.removeEventListener("click", virarCarta);
        secondCard.removeEventListener("click", virarCarta);
        firstCard = null;
        secondCard = null;
        checkWin();
    } else {
        setTimeout(() => {
            firstCard.classList.remove("virada");
            secondCard.classList.remove("virada");
            firstCard.style.backgroundImage = "url('images/download.png')";
            secondCard.style.backgroundImage = "url('images/download.png')";
            firstCard = null;
            secondCard = null;
        }, 500);
    }
}



// REINICIAR O JOGO
function restartGame() {
    // Reset das variáveis do jogo
    firstCard = null;
    secondCard = null;
    tempoDecorrido = 0;
    contador = 0;

    createCountries(); // Cria novas cartas
    showAllCards();    // Mostra as cartas inicialmente
    clearInterval(timeHandler); // Para o temporizador anterior, se necessário

    setTimeout(() => {
        scrambleInitial(); // Embaralha as cartas visivelmente
        setTimeout(() => {
            hideAllCards(); // Esconde as cartas após o embaralhamento
            startTimer();   // Inicia o temporizador
        }, 2000); // Espera 2 segundos após o embaralhamento
    }, 2000); // Espera 2 segundos para mostrar as cartas inicialmente
}

function resetSelection() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
}

function checkWin() {
    let cartasViradas = document.querySelectorAll(".carta.virada").length;
    let totalCartas = document.querySelectorAll(".carta").length;

    if (cartasViradas === totalCartas) {
        clearInterval(timeHandler);
        showModal("Parabéns! Concluiste o jogo!");
    }
}

// Style do Modal
const style = document.createElement("style");
style.innerHTML = `
.modal {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.4);
    display: none;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1000;
}

.modal.show {
    opacity: 1;
}

.modal-content {
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    transform: scale(0.95);
    animation: zoomIn 0.3s ease forwards;
    font-family: Arial, sans-serif;
}

.modal-content p {
    font-size: 18px;
    margin-bottom: 25px;
    color: #333;
}

.modal-content button {
    padding: 10px 25px;
    font-size: 15px;
    background-color: #333;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
}

.modal-content button:hover {
    background-color: #555;
}

@keyframes zoomIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}
`;
document.head.appendChild(style);

// Estrutura do Modal
function createModalStructure() {
    const modal = document.createElement("div");
    modal.id = "winModal";
    modal.classList.add("modal");

    const content = document.createElement("div");
    content.classList.add("modal-content");

    const message = document.createElement("p");
    message.id = "modalMessage";

    const closeBtn = document.createElement("button");
    closeBtn.id = "closeModal";
    closeBtn.innerText = "Fechar";

    content.appendChild(message);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Evento de fechar o modal
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("show"); // Remove a classe para esconder o modal
        setTimeout(() => {
            modal.style.display = "none"; // Remove o modal do DOM após a animação
            restartGame(); // Reinicia o jogo após o fechamento
        }, 300); // Tempo para animação
    });
}


// Alert Box Finish
function showModal(message = "Parabéns! Ganhaste o jogo!") {
    let modal = document.getElementById("winModal");

    if (!modal) {
        createModalStructure();
        modal = document.getElementById("winModal");
    }

    // Só adiciona tempo se a mensagem ainda não contiver "segundo"
    if (!message.includes("segundo")) {
        let segundosDecorridos = tempoDecorrido + contador;
        let minutos = Math.floor(segundosDecorridos / 60);
        let segundos = segundosDecorridos % 60;
        let tempoFormatado = `${minutos}m ${segundos}s`;
        message += `\nTempo: ${tempoFormatado}`;

    }

    document.getElementById("modalMessage").innerText = message;
    modal.style.display = "flex";
    setTimeout(() => modal.classList.add("show"), 10);
}

// Barra de Progresso
function ProgressBar() {
    const barra = document.createElement("progress");
    barra.id = "time";
    barra.max = 45;  
    barra.value = 1; 
    document.body.appendChild(barra);
}

// Update da Progress Bar
function updateProgressBar(segundos) {
    const progressBar = document.getElementById("time");
    progressBar.value = Math.min(segundos, maxCount);
}

// Restart da Progress Bar após os 45 segundos
function restartProgressBarVisual() {
    contador = 0;
    updateProgressBar(0);
}

// Contador de Tempo
function startTimer() {
    const timeDisplay = document.getElementById("time");
    clearInterval(timeHandler);

    contador = 0; // contador visual
    timeDisplay.value = contador;

    timeHandler = setInterval(() => {
        contador++;
        updateProgressBar(contador); 
        timeDisplay.value = contador;

        if (contador >= maxCount - 5) {
            timeDisplay.classList.add("alerta");
        } else {
            timeDisplay.classList.remove("alerta");
        }

        if (contador >= maxCount) {
            // Acumula o tempo total decorrido
            tempoDecorrido += contador;

            // Reinicia só o visual
            contador = 0;
            restartProgressBarVisual(); 
            timeDisplay.value = 0;
            timeDisplay.classList.remove("alerta");

            // Virar cartas temporariamente (para mostrar todas)
            const todasCartas = Array.from(document.querySelectorAll(".carta"));
            const cartasNaoBloqueadas = todasCartas.filter(carta => !carta.classList.contains("bloqueada"));

            cartasNaoBloqueadas.forEach(carta => {
                const code = carta.dataset.country;
                const match = faces.find(f => f.code === code);
                if (match) {
                    carta.classList.add("virada");
                    carta.style.backgroundImage = `url(${match.img})`;
                }
            });

            // Embaralhar e esconder novamente
            setTimeout(() => {
                scrambleAfterTime();
            }, 1000);
        }
    }, 1000);
}

/* ------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
-------------------------------------------------------------------------------------------------- */
 
// configuração do audio
function setupAudio() {
	game.sounds.background = document.querySelector("#backgroundSnd");
	game.sounds.success = document.querySelector("#successSnd");
	game.sounds.flip = document.querySelector("#flipSnd");
	game.sounds.hide = document.querySelector("#hideSnd");
	game.sounds.win = document.querySelector("#goalSnd");

	// definições de volume;
	game.sounds.background.volume=0.05;  // o volume varia entre 0 e 1

	// nesta pode-se mexer se for necessário acrescentar ou configurar mais sons

}

// calcula as coordenadas das imagens da selecao de cada país e atribui um código único
function getFaces() {
/* NÂO MOFIFICAR ESTA FUNCAO */
	let offsetX = 1;
	let offsetY = 1;
	for (let i = 0; i < 3; i++) {
		offsetX = 1;
		for (let j = 0; j < 3; j++) {
			let countryFace = Object.create(face); 				// criar um objeto com base no objeto face
			countryFace.x = -(j * CARDSIZE + offsetX) + "px";   // calculo da coordenada x na imagem
			countryFace.y = -(i * CARDSIZE + offsetY) + "px";   // calculo da coordenada y na imagem
			countryFace.country = "" + i + "" + j; 			    // criação do código do país
			faces.push(countryFace); 					        // guardar o objeto no array de faces
			offsetX += 2;
		}
		offsetY += 2;
	}
}


/*------------------------------------------------------------------------------------------------  
 ** /!\ NÃO MODIFICAR ESTAS FUNÇÕES /!\
--------------------------------------------------------------------------------------------------*/