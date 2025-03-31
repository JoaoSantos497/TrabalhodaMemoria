/** 
 * Aplicações multimeedia - Trabalho Prático 1
 * (c) Catarina Cruz, 2025
 * 
 */

const game = {}; // encapsula a informação de jogo. Está vazio mas vai-se preenchendo com definições adicionais.

// sons do jogo
const sounds = {
	background: new Audio("/sounds/euro2016.mp3"),
	flip: new Audio("/sounds/virar.mp3"),
	success: new Audio("/sounds/sucesso.mp3"),
	hide: new Audio("/sounds/esconder.mp3")
};

// numero de linhas e colunas do tabuleiro;
const ROWS = 4;
const COLS = 4;

game.sounds = sounds; // Adicionar os sons sons do jogo ao objeto game.
const board = Array(ROWS).fill().map(() => Array(COLS).fill(null)); // criação do tabuleiro como um array de 4 linhas x 8 colunas

 
// Representa a imagem de uma carta de um país. Esta definição e apenas um modelo para outros objectos que sejam criados
// com esta base atraves de let umaFace = Object.create(face).
const face = {
	country: -1,
	x: -1,
	y: -1
};

const CARDSIZE = 102; 	// tamanho da carta (altura e largura)
let firstCard = null, secondCard = null;
let flip =true;
let matchPairs = 0
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
	getFaces(); 		// calcular as faces e guardar no array faces
	createCountries();	// criar países
	//game.sounds.background.play(); //Background Music
    scramble(); // Baralhar as cartas
    startTimer(); // Contador de tempo
    restartGame();
    render();
	//completar
}

function setupBoard() {
    let mixedFaces = [...faces, ...faces];
    mixedFaces = mixedFaces.sort(() => Math.random() - 0.5);
    game.stage.innerHTML ="";
    //board = [];
    cartas.forEach((carta, index) => {
		let umaCarta = document.createElement("div");
		umaCarta.classList.add("carta", "escondida");
		umaCarta.style.backgroundImage = `url(../images/download.png)`; // Certifique-se do caminho correto
		umaCarta.style.backgroundPosition = `-${carta.x}px -${carta.y}px`;
		umaCarta.dataset.country = carta.country;
		umaCarta.addEventListener("click", virarCarta);
		tabuleiro.appendChild(umaCarta);
        clearInterval(timeHandler);
	})
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	 
}

function createCountries() {
    const tabuleiro = document.querySelector("#tabuleiro");
    tabuleiro.innerHTML = ""; // Limpa o tabuleiro antes de adicionar cartas

    let totalCartas = ROWS * COLS;
    let cartas = [];

    // Criar pares de cartas
    for (let i = 0; i < totalCartas / 2; i++) {
        let umaFace1 = Object.create(face);
        let umaFace2 = Object.create(face);
        umaFace1.country = i;
        umaFace2.country = i;
        cartas.push(umaFace1, umaFace2);
    }

    cartas.sort(() => Math.random() - 0.5); // Embaralhar

    // Criar as cartas no HTML
    cartas.forEach((carta, index) => {
        let umaCarta = document.createElement("div");
        umaCarta.classList.add("carta", "escondida");
        umaCarta.dataset.country = carta.country;
        umaCarta.style.backgroundImage = "url('images/download.png')";
        umaCarta.style.backgroundSize = "cover";
        umaCarta.addEventListener("click", virarCarta);

        // Adicionar ao tabuleiro
        tabuleiro.appendChild(umaCarta);
        console.log(`Carta ${index} adicionada ao tabuleiro: País ${carta.country}`);
    });

    console.log("Cartas criadas e adicionadas ao tabuleiro.");
}

// baralha as cartas no tabuleiro
function scramble() {
    let tabuleiro = document.querySelector("#tabuleiro");
    let cartas = Array.from(tabuleiro.children); // Pegamos todas as cartas já criadas
    cartas.sort(() => Math.random() - 0.5); // Baralhamos as cartas aleatoriamente

    // Removemos todas as cartas do tabuleiro e as adicionamos na nova ordem
    tabuleiro.innerHTML = "";
    cartas.forEach(carta => tabuleiro.appendChild(carta));
}

function virarCarta() {
    if (this.classList.contains("escondida")) {
        this.classList.remove("escondida");
        this.classList.add("virada");
        this.style.backgroundImage = `url(${faces[this.dataset.country].img})`;
        game.sounds.flip.play();
    } else {
        this.classList.add("escondida");
        this.classList.remove("virada");
        this.style.backgroundImage = "url('images/download.png')";
    }
}

function resetSelection() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
}

function restartGame() {
    clearInterval(timeHandler);
    matchPairs = 0; // Resetar pares encontrados
    firstCard = null;
    secondCard = null;
    flip = true;

    // Resetar o tempo na tela
    document.querySelector("#time").value = "0";

    // Reiniciar o tabuleiro e embaralhar cartas
    createCountries();  
    scramble();    

    // Resetar todas as cartas para ficarem viradas para baixo
    document.querySelectorAll(".carta").forEach(carta => {
        carta.classList.remove("virada");
        carta.classList.add("escondida");
        carta.style.backgroundImage = "url('images/download.png')";
    });

    startTimer(); // Reinicia o tempo
}


function checkWin() {
    if (matchPairs === (ROWS * COLS) / 2) {
        clearInterval(timeHandler); // Para o tempo
        setTimeout(() => {
            alert("Parabéns! Encontrou todos os pares!");
            resetGame();
        }, 500);
    }
}

let timeHandler;  
function startTimer() {
    let contador = 0;
    let maxCount = 45;
    let timeDisplay = document.getElementById("time");
  
    // Se já houver um temporizador, limpar antes de iniciar um novo
    clearInterval(timeHandler);
  
    // Atualizar o display para começar do zero
    timeDisplay.value = contador;
    timeDisplay.classList.remove("warning");
  
    // Iniciar o temporizador
    timeHandler = setInterval(() => {
      contador++;
      timeDisplay.value = contador;
  
      if (contador === maxCount - 5) {
        timeDisplay.classList.add("warning"); // Adicionar alerta nos últimos 5 segundos
      }
  
      if (contador === maxCount) {
        clearInterval(timeHandler);
        timeDisplay.classList.remove("warning");
      } 
    }, 1000); // Agora conta corretamente de 1 em 1 segundo
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