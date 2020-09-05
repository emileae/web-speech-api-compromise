import { useEffect, useState } from 'react';
import nlp from 'compromise';
import {v4 as uuidv4} from "uuid";

const two_line = /\n\n/g;
const one_line = /\n/g;
const linebreak = (s) => {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

const first_char = /\S/;
const capitalize = (s) => {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

const nameCloud = (names) => {
    return Object.keys(names).map((n, i) => {
        let maxSize = 50;
        let size = 2*names[n];
        size = size > maxSize ? maxSize : size;
        return <span style={{fontSize: `${8 + (size)}px`, marginLeft: "0.5rem"}} key={uuidv4()}>{n}</span>
    })
}

function HomePage() {
    // let recognition = null;
    const [delay, setDelay] = useState(0);
    const [recognition, setRecognition] = useState(null);
    const [recognizing, setRecognizing] = useState(false);
    // parsed text
    const [interimTranscript, setInterimTranscript] = useState("");
    const [finalTranscript, setFinalTranscript] = useState("");
    // display text
    const [interimTranscriptDisp, setInterimTranscriptDisp] = useState("");
    const [finalTranscriptDisp, setFinalTranscriptDisp] = useState("");
    const [info, setInfo] = useState(false);
    const [names, setNames] = useState({});

    const [bgColor, setBgColor] = useState('white');

    const toggleRecognizing = () => {
        console.log("toggle recog.")
        if (!recognizing){
            console.log("start voice recognition...");
            setRecognizing(true);
            setInfo("Start talking");
            // recognition.start();
            restart();
        }else{
            console.log("stop voice recognition...");
            setRecognizing(false);
            recognition.stop();
            setInfo("Ready to Start talking");
        }
    }

    const startRecognizing = () => {
        console.log("start voice recognition...");
        // if (!recognizing){
        //     console.log("start voice recognition...");
        //     setRecognizing(true);
        //     setInfo("Start talking");
        //     recognition.start();
        // }else{
        //     console.log("stop voice recognition...");
        //     setRecognizing(false);
        //     recognition.stop();
        //     setInfo("Ready to Start talking");
        // }
    }

    const onResult = (event) => {
        let interimTranscriptTemp = interimTranscript;
        let finalTranscriptTemp = finalTranscript;
        if (typeof(event.results) == 'undefined') {
            recognition.onend = null;
            recognition.stop();
            setInfo("Upgrade");
            return;
        }
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscriptTemp += event.results[i][0].transcript;
            } else {
                interimTranscriptTemp += event.results[i][0].transcript;
            }
        }

        finalTranscriptTemp = capitalize(finalTranscriptTemp);
        setFinalTranscriptDisp( linebreak(finalTranscriptTemp) );
        setInterimTranscriptDisp( linebreak(interimTranscriptTemp) );
    }

    const onEnd = () => {
        console.log("ended listening...");
        setRecognizing(false);
        setInfo("Stopped Listening");
    }

    const onError = (err) => {
        console.log("error listening...", err);
        setRecognizing(false);
        setInfo("Stopped Listening");
        restart();
    }

    const restart = () => {
        console.log("restarting");
        if (!recognition){
            recognition = null;
            recognition = new webkitSpeechRecognition();
            setRecognition(recognition);
        }
        recognition.stop();
        recognition.start();
    }

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Upgrade!");
          } else {
            let recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = startRecognizing
            recognition.onresult = onResult
            recognition.onerror = onError;
            recognition.onend = onEnd;
            recognition.addEventListener('end', () => {
                console.log("restarting...");
                recognition.start();
            });
            setRecognition(recognition);
            setInfo("Speech supported");
          }
    }, []);

    useEffect(() => {
        let doc = nlp(interimTranscriptDisp);
        let updatedNames = {...names};
        doc.people().list.forEach((p, i)=>{
            if (p){
                let name = p.start.split("-")[0];
                if (names[name]){
                    updatedNames[name] += 1;
                }else{
                    updatedNames[name] = 1;
                }
            }
        });
        setNames(updatedNames);  
    }, [interimTranscriptDisp]);

    return (
    <div style={{backgroundColor: bgColor}}>
        <section className="hero is-medium is-bold">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <div>
                        <button className="button is-large" onClick={() => toggleRecognizing()}>
                            <span className="icon is-medium">
                                {recognizing ? <i className="fas fa-microphone-slash"></i> : <i className="fas fa-microphone"></i>}
                            </span>
                            <span>{recognizing ? "Stop" : "Start"}</span>
                        </button>
                    </div>
                    <div>
                        {info}<br/>
                        pending: {recognition && recognition.pending} - speaking: {recognition && recognition.speaking} - paused: {recognition && recognition.paused}
                    </div>
                </div>
            </div>
        </section>
        <section className="section">
            <div className="container">
                <span>{finalTranscriptDisp}</span> 
                <span style={{color: "#a3a3a3"}}>{interimTranscriptDisp}</span>
            </div>
            <div className="container">
                {nameCloud(names)}
            </div>
        </section>
    </div>
    )
}
  
export default HomePage