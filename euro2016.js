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
const board = Array(ROWS).fill().map(() => Array(COLS).fill(null)); // criação do tabuleiro como um array de 4 linhas x 8 colunas

 
// Representa a imagem de uma carta de um país. Esta definição e apenas um modelo para outros objectos que sejam criados
// com esta base atraves de let umaFace = Object.create(face).
const face = {
	country: -1,
	x: -1,
	y: -1
};

const CARDSIZE = 102; 	// tamanho da carta (altura e largura)
let firstCard = null;
let secondCard = null;
let flip = true;
let matchPairsFound = false;
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
	getFaces(); 		// calcular as faces e guardar no array faces
	createCountries();	// criar países
	//game.sounds.background.play(); //Background Music
    scramble(); // Baralhar as cartas
    startTimer(); // Contador de tempo
    restartGame();
    render();
}

function setupBoard() {
    let mixedFaces = [...faces, ...faces];
    mixedFaces = mixedFaces.sort(() => Math.random() - 0.5);
    game.stage.innerHTML ="";

    cartas.forEach((carta, index) => {
		let umaCarta = document.createElement("div");
		umaCarta.classList.add("carta", "escondida");
		umaCarta.style.backgroundImage = `url(../images/download.png)`; // Certifique-se do caminho correto
		umaCarta.style.backgroundPosition = `-${carta.x}px -${carta.y}px`;
		umaCarta.dataset.country = carta.country;
		umaCarta.addEventListener("click", virarCarta);
        clearInterval(timeHandler);
	})
}

// Adicionar as cartas do tabuleiro à stage
function render() {
	 
}

function createCountries() {
    const tabuleiro = document.querySelector("#tabuleiro");
    tabuleiro.innerHTML = ""; // Limpar o tabuleiro antes de criar novas cartas

    let totalCartas = ROWS * COLS;
    let cartas = [];

    // Criar pares de cartas (8 pares para um tabuleiro 4x4)
    for (let i = 0; i < totalCartas / 2; i++) {
        let umaFace1 = { country: faces[i].code, img: faces[i].img };
        let umaFace2 = { country: faces[i].code, img: faces[i].img };
        cartas.push(umaFace1, umaFace2);
    }

    cartas.sort(() => Math.random() - 0.5); // Embaralhar

    // Criar e adicionar as cartas ao tabuleiro
    cartas.forEach((carta) => {
        let umaCarta = document.createElement("div");
        umaCarta.classList.add("carta", "escondida");
        umaCarta.dataset.country = carta.country;
        umaCarta.style.backgroundImage = "url('images/download.png')"; // Imagem de verso
        umaCarta.style.backgroundSize = "cover";
        umaCarta.addEventListener("click", virarCarta);

        tabuleiro.appendChild(umaCarta);
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
    // Evitar virar mais de duas cartas ao mesmo tempo
    if (this.classList.contains("virada") || secondCard) return; 

    this.classList.remove("escondida");
    this.classList.add("virada");

    let countryCode = this.dataset.country;
    let cartaCorrespondente = faces.find(f => f.code === countryCode);
    
    if (cartaCorrespondente) {
        this.style.backgroundImage = `url(${cartaCorrespondente.img})`;
        game.sounds.flip.play();
    } else {
        console.error("Erro ao encontrar imagem para o país:", countryCode);
    }

    // Se for a primeira carta virada
    if (!firstCard) {
        firstCard = this;
    } else {
        // Se for a segunda carta virada, faz a verificação do par
        secondCard = this;
        setTimeout(matchPairs, 500); 
    }
}




function matchPairs() {
    if (!firstCard || !secondCard) return;

    let country1 = firstCard.dataset.country;
    let country2 = secondCard.dataset.country;

    if (country1 === country2) {
        game.sounds.success.play();

        // Manter as cartas visíveis e impedir que sejam clicadas novamente
        firstCard.removeEventListener("click", virarCarta);
        secondCard.removeEventListener("click", virarCarta);

        firstCard = null;
        secondCard = null;

        checkWin();
    } else {
        // Se as cartas não forem um par, esconde após um pequeno delay
        setTimeout(() => {
            firstCard.classList.remove("virada");
            secondCard.classList.remove("virada");

            firstCard.classList.add("escondida");
            secondCard.classList.add("escondida");

            firstCard.style.backgroundImage = "url('images/download.png')";
            secondCard.style.backgroundImage = "url('images/download.png')";

            // Permitir que o jogador vire novas cartas
            firstCard = null;
            secondCard = null;
        }, 500);
    }
}



function restartGame() {
    matchPairsFound = false; // Resetando o estado de pares encontrados
    firstCard = null;
    secondCard = null;

    createCountries(); // Garante que as cartas são recriadas
    scramble(); // Embaralha novamente

    // Reseta todas as cartas para o estado inicial
    document.querySelectorAll(".carta").forEach(carta => {
        carta.classList.add("escondida");
        carta.classList.remove("virada");
        carta.style.backgroundImage = "url('images/download.png')";
    });

    startTimer(); // Inicia o timer novamente
}


function resetSelection() {
    firstCard = null;
    secondCard = null;
    canFlip = true;
}


function checkWin() {
    let cartasViradas = document.querySelectorAll(".carta.virada").length;
    let totalCartas = document.querySelectorAll(".carta").length;

    console.log(`Cartas viradas: ${cartasViradas}, Total de cartas: ${totalCartas}`);

    if (cartasViradas === totalCartas) { 
        clearInterval(timeHandler); // Para o tempo
        console.log("Jogo concluído!");
        
        setTimeout(() => {
            alert(`Parabéns! Encontrou todos os pares!`);
            document.getElementById("reiniciar").disabled = false; // Garante que o botão está ativo
        }, 300); // Espera 
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
        timeDisplay.classList("warning");
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

