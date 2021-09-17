import React, {useEffect, useState, useRef} from 'react';
import Board from './Board';
import Stats from './Stats'
import './Game.css'

const Game = (props) => {
  const DELAY = 80
  let boardRef = useRef(null);
  let interval;
  const [snakes, setSnakes] = useState([])
  const [snack, setSnack] = useState()
  const [bonusSnack, setBonusSnack] = useState(null);
  const [nextBonusAt, setNextBonusAt] = useState(10)
  const [delay, setDelay] = useState(DELAY);
  const [directions, setDirections] = useState(['right']);
  const [directionChanged, setDirectionChanged] = useState(false);
  const [boardData, setBoardData] = useState({boxesCount:0, rows: 0, boxSize: 0, columns:15})
  const [score, setScore] = useState({current:0, high:0})
  const [gameOver, setGameOver] = useState(false);
  const movement = {up: -boardData.columns, down: boardData.columns, left: -1, right: 1};
  const ensureSnakePosition = (snake)=>{
    switch(true){
      case snake.index % boardData.columns===0 && snake.direction==='right':
        snake.index-=boardData.columns;
        break;
      case (snake.index % boardData.columns===boardData.columns-1 || snake.index===-1) && snake.direction==='left':
        snake.index+=boardData.columns;
        break;    
      case snake.index >= boardData.boxesCount || snake.index<0:
        snake.index = Math.abs(boardData.boxesCount - Math.abs(snake.index));
    }
    return snake;
  }

  const updateSnakes = (newSnakes)=>{
    setSnakes(newSnakes.map((snake,index)=>{
      if(newSnakes[index+1]){
        snake.index = newSnakes[index+1].index;
      }else{
        snake.direction = directions[directions.length-1];
        if(directions.length>1){
          setDirections(directions=>{
            let newDirections = directions.slice(0, directions.length-1);
            return newDirections;
          })
        }
        snake.index+=movement[snake.direction];
        snake = ensureSnakePosition(snake)
      }
      return snake;
    }))
  }

  const restartGame = ()=>{
    setScore(score=>{
        score.current=0;
        return score;
    });
    setDirections(['right'])
    setBonusSnack(null);
    setNextBonusAt(10)
    makeNewSnake(boardData.boxesCount);
    cookSnack();
    setGameOver(false);
  }

  const togglePlay = ()=>{
    if(delay){
      setDelay(null)
      if(bonusSnack){
      }
    }
    else{
      if(gameOver){
        restartGame()
      }
      if(bonusSnack){
      }
      setDelay(DELAY)
    }
  }

  const growSnake = ()=>{
    setSnakes(snakes=>[{},...snakes])
  }

  const handleCrash = ()=>{
    setDelay(null);
    setGameOver(true);
    localStorage.setItem('highscore', score.high)
  }

  const handleSnackEat = () =>{
    setScore(score=>{
      let current = score.current+1;
      let high = current>score.high?current:score.high;
      return {current, high};
    });
    cookSnack();
    growSnake();
  }

  const handleBonusSnackEat = ()=>{
    setScore(score=>{
      let current = score.current+5;
      let high = current
      return {current, high}
    })
    setBonusSnack(null);
    setNextBonusAt(nextBonusAt=>nextBonusAt+5);
  }

  const checkIfAte = ()=>{
    let head = snakes[snakes.length-1];
    let crashedWith;
    for(let i=0; i<snakes.length; i++){
      if(head.index === snakes[i].index && snakes[i]!==head){
        crashedWith = snakes[i];
        break;
      }
    }

    if(crashedWith){
      handleCrash();
    }
    if(snack.index===head.index){
      handleSnackEat();
    }
    if(head.index===bonusSnack?.index){
      handleBonusSnackEat();
    }
  }

  const getRandomBoxIndex = ()=>{
    return Math.floor(Math.random()*boardData.boxesCount)
  }

  const makeNewSnake = (boxesCount)=>{
    setSnakes([{index: Math.floor(boxesCount/2) , direction: directions[directions.length-1]}])
  }

  const cookSnack = ()=>{
    const snackIndex = getRandomBoxIndex();
    setSnack({index: snackIndex})
  }

  const cookBonusSnack = ()=>{
    const bonusIndex = getRandomBoxIndex();
    setBonusSnack({index: bonusIndex, duration:5000})
    setNextBonusAt(score.current+10);
  }

  const playGame = () =>{
    let newSnakes = snakes.slice();
    updateSnakes(newSnakes)
    checkIfAte();
    if(nextBonusAt===score.current && !bonusSnack)  cookBonusSnack()
    else if(bonusSnack) setBonusSnack((bonusSnack)=>{
      let duration = bonusSnack?.duration-DELAY;
      if(duration>0)  return {...bonusSnack, duration}
      else {
        return null;
      }
    })
    setDirectionChanged(false);
  }

  const addNewDirection = (newDirection)=>{
    const directionsArr = [["up","down"],["left", "right"]].find(item=>item.includes(directions[0]));
      if(!directionsArr?.includes(newDirection) && delay){
        setDirections(directions=>{
          let newDirections;
          if(!directionChanged){
            newDirections = [newDirection];
            setDirectionChanged(true);
          }
          else{
            newDirections = [newDirection, ...directions]
          }
          return newDirections
        });
      }
  }

  const handleKeyDown = (e)=>{
    let newDirection = e.code.slice(5).toLowerCase();
    if(movement[newDirection]){
      addNewDirection(newDirection)
    }
    else if(e.code==="Space"){
      togglePlay();
    }
  }

  useInterval(playGame, delay)

  useEffect(
    ()=>{
      let {clientWidth: width, clientHeight: height} = boardRef.current;
      height = 90* height/100;
      const {columns} = boardData;
      const boxSize = width/columns;
      const rows = Math.floor(height/boxSize);
      const boxesCount = columns*rows;
      setBoardData(Object.assign({},boardData, {boxesCount, boxSize, rows}))
      makeNewSnake(boxesCount)
      let highscore = JSON.parse(localStorage.getItem('highscore'));
      if(highscore) setScore(score=>{
        score.high = highscore;
        return score;
      });
      cookSnack();
  }, []);

  useEffect(
    ()=>{
      document.addEventListener("keydown", handleKeyDown)
      return ()=> document.removeEventListener('keydown', handleKeyDown)
    },[delay, directions, snack, bonusSnack, directionChanged, gameOver, nextBonusAt]
    )
  return (
    <div ref={boardRef} className="Game">
    	<Board {...boardData} snakes={snakes} snack={snack} bonusSnack={bonusSnack} />
      <Stats score={score} delay={delay} bonusSnack={bonusSnack}/>
    </div>
  )
}

function useInterval(callback, delay) {
  const savedCallback = useRef();
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}


export default Game;