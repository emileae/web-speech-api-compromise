import { useEffect, useState } from 'react';
import Sketch from "react-p5";
 
const P5 = () => {
  let x = 50;
  let y = 50;

  const [setup, setSetup] = useState();

  useEffect(() => {
    const setup = (p5, canvasParentRef) => {
        p5.createCanvas(500, 500).parent(canvasParentRef); // use parent to render canvas in this ref (without that p5 render this canvas outside your component)
    };
    setSetup(setup);
  }, []);
 

  const draw = (p5) => {
    p5.background(0);
    p5.ellipse(this.x, this.y, 70, 70);
    // NOTE: Do not use setState in draw function or in functions that is executed in draw function... pls use normal variables or class properties for this purposes
    this.x++;
  };
 

    return setup ? <Sketch setup={setup} draw={draw} /> : <p>P5...</p>;

}

export default P5;