import React from 'react';

type Props = {
  width: number,
  height?: number | 30,
  progress: number,
  displayPercentage?: boolean|false
};

let barHeight;

const ProgressBar = (props: Props) => {
    if (!props.height) {
      barHeight = 30;
    }
    else {
      barHeight = props.height;
    }
    return (
      <div className="progress-bar-component" style={{position: 'relative', width: props.width, height: barHeight, margin: "0 auto"}}>
        <div className="bar" style={{width: props.width, height: barHeight, backgroundColor: "gray", borderRadius: "10px"}}>
          <div className="progress-bar" style={{width: props.progress, height: barHeight, backgroundColor: "#49afad", borderRadius: "10px"}}>
          </div>
        </div>
        {
          props.displayPercentage &&
          <>
            <p className="progress-bar-0" style={{position: 'absolute', bottom: "-1.4rem", left: 0}}>0%</p>
            {
              props.progress !== 0 && props.progress !== 100 &&
              <p className="progress-bar-progress" style={{position: 'absolute', top: "-1.4rem", left: props.progress}}>{Math.round(props.progress / props.width * 100)}%</p>
            }
            <p className="progress-bar-100" style={{position: 'absolute', bottom: "-1.4rem", right: 0}}>100%</p> 
          </>
        }
      </div>
    );
};

export default ProgressBar;