import React, {useRef, useState, useEffect} from 'react';
import './Board.css'
const Board = (props) => {
  const [style, setStyle] = useState({})
  useEffect(()=>{
      setStyle({
        gridTemplateRows: `repeat(${props.rows}, ${props.boxSize}px)`,
        gridTemplateColumns: `repeat(${props.columns}, ${props.boxSize}px)`
      })
  }, [props])

  const makeBox = (i, idx)=>{
        const snakeData = props.snakes.find(obj=>obj.index==idx);
        let className = `${snakeData?"snake":""} ${snakeData?.direction?snakeData.direction:""} ${props.snack?.index===idx?"snack":""} ${props.bonusSnack?.index===idx?"bonus":""}`
        return (
          <div key={idx} className="box">
            <div className={className}></div>
          </div>
          )
      }


  return (
    <div className="Board" style={style} >
    	{Array(props.boxesCount).fill(null).map(makeBox)}
    </div>
  )
}

export default Board;