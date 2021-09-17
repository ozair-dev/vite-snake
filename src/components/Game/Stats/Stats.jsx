import React from 'react';
import './Stats.css';
const Stats = (props) => {
  let className=`${props.bonusSnack?"animate":""} ${props.delay?"":"paused"}`
  return (
    <div className="stats">
      <div className="duration">
        <div className={className}></div>
      </div>
    	<p>Highscore: {props.score.high}</p>
    	<p>Score: {props.score.current}</p>
    </div>
  )
}

export default Stats;