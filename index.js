const chalk = require('chalk');

const FRUITS_PER_TREE = 4;
const MAX_CROW_STEPS = 4;

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const rollDice = () => getRandomInt(0, 5);

const repeatIcon = (icon, times) => {
  let res = '';
  for (let i = 0; i<times; i++) {
      res += icon + ' ';
  }
  return res;
}

const printSymbol = (symbol, count, max) => {
  let res = '';
  for (let i = 0; i<max; i++) {
    if (count > i) {
      res += symbol + ' ';
    } else {
      res += '  ';
    }
    
  }
  return res;
}

const printCrow = (count, max) => {
  const tree = '🌳';
  const home = '🏡';
  const crow = '🦅 ';

  const treesBefore = max - count;
  const treesAfter = max - treesBefore - 1;

  return repeatIcon(tree, treesBefore) + crow + repeatIcon(tree, treesAfter) + (count === 0 ? '' : home);
}

class Game {
  constructor() {
    this.init();
  }

  init() {
    this.trees = [ FRUITS_PER_TREE, FRUITS_PER_TREE, FRUITS_PER_TREE, FRUITS_PER_TREE ];
    this.remainingFruits = FRUITS_PER_TREE * this.trees.length;
    this.crowSteps = MAX_CROW_STEPS;
    this.lastDice = null;
    this.turns = 0;
    this.basketCount = 0;
  }

  removeFruit(index) {
    this.trees[index] = this.trees[index] - 1;
    this.remainingFruits--;
  }

  playOneTurn() {
    const dice = rollDice();
    this.lastDice = dice;
    this.turns ++;
    if (dice < 4 && this.trees[dice] > 0) {
      this.removeFruit(dice);
    } else if (dice === 5) {
      this.crowSteps--;

      if (this.crowSteps < 0) {
        throw Error('Negative crow step');
      }
    } else if (dice === 4) {
      this.basketCount ++;
      this.playBasket();
      // if (this.remainingFruits > 0) {
      //   this.playBasket();
      // }
    }
  }

  play() {
    while(!this.hasFinished) {
      this.playOneTurn();
    }
    return this.hasWon;
  }

  playBasket() {
    if (this.remainingFruits === 0) {
      throw Error('No more fruits for basket play');
    }
    for (let i = 0; i < this.trees.length; i++) {
      if (this.trees[i] > 0) {
        this.removeFruit(i);
        break;
      }
    }
  }

  get hasFinished() {
    return this.crowSteps === 0 || this.remainingFruits === 0;
  }

  get hasWon() {
    return this.remainingFruits === 0;
  }

  get name() {
    return 'Dumb Algo';
  }

  display() {
    const icons = [ '🍏', '🍎', '🍐', '🍇', '👜', '🦅' ];

    const fruits = this.trees.map((count, index) => {
      return printSymbol(icons[index], count, FRUITS_PER_TREE);
    });
    const crow = printCrow(this.crowSteps, MAX_CROW_STEPS);
    const played = this.lastDice !== null ? `${icons[this.lastDice]}    ==>   ` : '           ';
    console.log(played + fruits.join('   ') + '    ' + crow );
  }
}

class SmartGame extends Game {
  playBasket() {
    let maxValue = 0;
    let maxValueIndex = -1;
    for (let i = 0; i < this.trees.length; i++) {
      if (this.trees[i] > maxValue) {
        maxValue = this.trees[i];
        maxValueIndex = i;
      }
    }
    
    this.removeFruit(maxValueIndex);
  }

  get name() {
    return 'Smart Algo';
  }
}

class VeryStupidGame extends Game {
  playBasket() {
    let minValue = 10;
    let minValueIndex = -1;
    for (let i = 0; i < this.trees.length; i++) {
      if (this.trees[i] > 0 && this.trees[i] < minValue) {
        minValue = this.trees[i];
        minValueIndex = i;
      }
    }

    this.removeFruit(minValueIndex);
  }

  get name() {
    return 'Very stupid Algo';
  }
}

const game = new Game();

const runGame = (game) => {
  let victories = 0;
  let defeats = 0;

  const start = new Date();
  
  for(let i = 0; i < 1000000; i++) {
    if (game.play()) {
      victories++;
    } else {
      defeats++;
    }
    game.init();
  }

  const elapsed = (new Date().getTime() - start.getTime()) / 1000;

  console.log('Done in ', elapsed, 'seconds')
  console.log('Algo: ', game.name);
  console.log('Victories: ', victories);
  console.log('Defeats: ', defeats);
  console.log(Math.round((victories / (victories + defeats))*10000)/100 + '%');
}

const runOneGame = (game) => {
  game.init();
  game.display();

  while(!game.hasFinished) {
    const dice = game.playOneTurn();
    game.display();
  }

  if (game.hasWon) {
    console.log(chalk.green('You won!'));
  } else {
    console.log(chalk.red('You lost...'));
  }
  
  return game.turns === 16 && game.remainingFruits === 0 && game.basketCount > 6;
}

//while(!runOneGame(new SmartGame()));

//runOneGame(new SmartGame())

runGame(new Game());
runGame(new SmartGame());
runGame(new VeryStupidGame());