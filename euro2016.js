/** 
 * Aplicações multimeedia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// sons do jogo
const sounds = {
	background: null,
	flip: null,
	success: null,
	hide: null
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
//let matchPairs = 0;
let tempoDecorrido = 0;

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
	setupAudio(); 		// configurar o audio
	//getFaces(); 		// calcular as faces e guardar no array faces
	createCountries();	// criar países
	//game.sounds.background.play(); //Background Music
    showAllCards();
    setTimeout(() => {
        scramble();
        hideAllCards();
        startTimer();
        //game.sounds.background.loop = true;
        //game.sounds.background.play();
    }, 2000);
    scramble(); // Baralhar as cartas
    startTimer(); // Contador de tempo
    //restartGame();
    //render();
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
        carta.classList.add("virada");
    });
}

// Esconde as cartas
function hideAllCards() {
    document.querySelectorAll(".carta").forEach(carta => {
        carta.classList.remove("virada");
        carta.style.backgroundImage = "url('images/download.png')";
    });
}

// baralha as cartas no tabuleiro
function scramble() {
    let tabuleiro = document.querySelector("#tabuleiro");
    let cartas = Array.from(tabuleiro.children);
    cartas.sort(() => Math.random() - 0.5);
    tabuleiro.innerHTML = "";
    cartas.forEach(carta => tabuleiro.appendChild(carta));
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

function restartGame() {
    firstCard = null;
    secondCard = null;
    createCountries();
    showAllCards();
    setTimeout(() => {
        scramble();
        hideAllCards();
        startTimer();
    }, 2000);
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
        showModal();
    }
}

function showModal() {
    const modal = document.getElementById("winModal");
    modal.style.display = "flex";
    document.getElementById("closeModal").addEventListener("click", () => {
        modal.style.display = "none";
        restartGame();
    });
}

function startTimer() {
    let contador = 0;
    let maxCount = 45;
    let timeDisplay = document.getElementById("time");

    clearInterval(timeHandler);
    timeDisplay.value = contador;

    timeHandler = setInterval(() => {
        contador++;
        timeDisplay.value = contador;

        if (contador % maxCount === 0) {
            scramble();
            document.querySelectorAll(".carta").forEach(carta => {
                if (!carta.classList.contains("virada")) {
                    carta.style.backgroundImage = "url('images/download.png')";
                    setTimeout(() => carta.classList.remove("virada"), 1000);
                }
            });
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

