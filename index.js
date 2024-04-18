const gameTable = document.getElementById('gametable-container')
const optionContainer = document.querySelector('.option-container');
const turnBtn = document.getElementById('turn-btn');



/* - Função que vira os barcos.
- Variavel angle iniciada para fazermos a função de retornar para o angulo padrão
caso tenha sido modificiado */
let angle = 0;
function turnShip(){
  //utilizei Array.from para colocar todos os filhos da div em um array
  const ships = Array.from(optionContainer.children)
  if(angle === 0){
    angle = 90;
  }else{
    angle = 0;
  }
    ships.forEach(ship => {
      ship.style.transform = `rotate(${angle}deg)`
    });
  }
  
//Criando nossas tabelas
//largura 10x10 por bloco da nossa tabela 
const width = 10;
function createTable(color, id){
  const gameTableContainer =  document.createElement('div');
  gameTableContainer.classList.add('game-table');
  gameTableContainer.style.backgroundColor = color;
  gameTableContainer.id = id;

  for (let i = 0; i < width * width; i++){
    const block = document.createElement('div');
    block.classList.add('block')
    block.id = i;
    gameTableContainer.append(block)
  }
  gameTable.append(gameTableContainer);
}
createTable('pink', 'player');
createTable('yellow', 'bot');


//Barcos
class Ship {
  constructor(name, length){
    this.name = name;
    this.length = length;
  }
}

const destroyer =  new Ship('destroyer', 2);
const submarine =  new Ship('submarine', 3);
const cruiser =  new Ship('cruiser', 3);
const battleShip =  new Ship('battleship', 4);
const carrier =  new Ship('carrier', 5);

const ships = [destroyer, submarine, cruiser, battleShip, carrier];

function addShipPiece(ship){
  const boardBlocksBot = document.querySelectorAll('#bot div')
  let randomBoolean = Math.random() < 0.5 //me retorna um true or false aleatoriamente
  let isHorizontal = randomBoolean
  let randomBoardBot = Math.floor(Math.random() * width * width)

  /*validamos se nosso valor inicial  , e atribuimos um calculo para ver se 
  o campo tem espaço suficiente para ocupar os blocos sem quebrar nosso bloco */ 
  let validStart;
  if(isHorizontal ){
    if(randomBoardBot <= width * width - ship.length){
      validStart = randomBoardBot;
    }else{
      validStart = width * width - ship.length;
    }
  }else{
    //handle para os blocos em vertical
    if(randomBoardBot <= width * width - ship.length){
      validStart = randomBoardBot;
    }else{
      validStart = randomBoardBot - ship.length * width + width;
    }
  }

  let shipBlocks = [];

  for(let i = 0; i < ship.length; i++){
    /*verificamos se é horizontal caso não seja pegamos nossa div aletoria e mutiplicamos por 10 accim fazendo com que peguemos o espaço na vertical*/
    if(isHorizontal){
      shipBlocks.push(boardBlocksBot[Number(validStart) + i])
    } else{
      shipBlocks.push(boardBlocksBot[Number(validStart) + i * width])
    }
  }

  shipBlocks.forEach(block => {
    block.classList.add(ship.name)
    block.classList.add('taken')
  })
  
}
ships.forEach(ship => addShipPiece(ship))