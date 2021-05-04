import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import axios from "axios";
import { List, Map } from "immutable";

function DrawingLine({ line }) {
  const pathData = "M " +
    line.map(p => p.get('x') + ' ' + p.get('y')).join(" L ");
  
  return <path className="path" d={pathData} />;
}

function Drawing({ lines }) {
  return (
    <svg className="drawing">
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} />
      ))}
    </svg>
  );
}

class DrawCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDrawing: false,
      lines: new List(),
      callback: props.callback,
    };

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

  }

  componentDidMount() {
    document.addEventListener("mouseup", this.handleMouseUp);
  }
  componentWillUnmount() {
    document.removeEventListener("mouseup", this.handleMouseUp);
  }
  
  handleMouseUp() {
    
    if (this.state.lines.size === 0) {
      return;
    }

    var start_point = this.state.lines.last().first();
    var end_point = this.state.lines.last().last();
    var mid_point = this.state.lines.last().get(Math.floor(this.state.lines.last().size/2));
    
    this.setState({
      isDrawing: false,
      lines: new List(),
    });

    console.log(start_point.get("y"));
    console.log(mid_point.get("y"));
    console.log(end_point.get("y"));


    if (mid_point.get("y") - start_point.get("y") > 20 && mid_point.get("y") - end_point.get("y") > 20) {
      
      if (Math.abs(start_point.get("x") - end_point.get("x")) < 15 && Math.abs(start_point.get("x") - mid_point.get("x")) > 20) {
        console.log("detected circle!")
        this.state.callback("😮");
      } else {
        console.log("detected smiley!");
        this.state.callback("🙂");
      }
    } else if (start_point.get("y") - mid_point.get("y") > 20 && end_point.get("y") - mid_point.get("y") > 20) {
      console.log("detected sad face!");
      this.state.callback("🙁");
    } else if (Math.abs(start_point.get("y") - mid_point.get("y")) < 10 && Math.abs(end_point.get("y") - mid_point.get("y")) < 10) {
      
      if (start_point.get("x") - end_point.get("x") > 20) {
        console.log("pointing left!");
        this.state.callback("👈");
      } else if (end_point.get("x") - start_point.get("x") > 20) {
        console.log("pointing right!");
        this.state.callback("👉");
      } else if (Math.abs(start_point.get("x")-end_point.get("x")) < 20) {
        console.log("poker face!");
        this.state.callback("😐");
      }

    }

  }

  handleMouseDown(mouseEvent) {
    if (mouseEvent.button !== 0) {
      return;
    }

    const point = this.relativeCoordinatesForEvent(mouseEvent);

    this.setState(prevState => ({
      lines: prevState.lines.push(new List([point])),
      isDrawing: true
    }));

  }

  handleMouseMove(mouseEvent) {
    if (!this.state.isDrawing) {
      return;
    }
    const point = this.relativeCoordinatesForEvent(mouseEvent);

    this.setState(prevState =>  ({
      lines: prevState.lines.updateIn([prevState.lines.size - 1], line => line.push(point))
    }));

  }

  relativeCoordinatesForEvent(mouseEvent) {
    const boundingRect = this.refs.drawCanvas.getBoundingClientRect();
    return new Map({
      x: mouseEvent.clientX - boundingRect.left,
      y: mouseEvent.clientY - boundingRect.top,
    });
  }

  render() {
    return (
      <div className="drawCanvas" ref="drawCanvas" onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove}>
        <Drawing lines={this.state.lines} />
      </div>
    );
  }
}

function Cell(props) {
  return (
    <button onClick={() => props.onClick()}>{props.value}</button>
  );
}

function MainGrid(props) {
  return (
    <div className="grid">
      <Cell
        value={'qwe'}
        onClick={() => props.handleClick(0)}
      />
      <Cell
        value={'rtyu'}
        onClick={() => props.handleClick(1)}
      />
      <Cell
        value={'iop'}
        onClick={() => props.handleClick(2)}
      />
      <Cell
        value={'asd'}
        onClick={() => props.handleClick(3)}
      />
      <Cell
        value={'fgh'}
        onClick={() => props.handleClick(4)}
      />
      <Cell
        value={'jkl'}
        onClick={() => props.handleClick(5)}
      />
      <Cell
        value={'zxc'}
        onClick={() => props.handleClick(6)}
      />
      <Cell
        value={'vb'}
        onClick={() => props.handleClick(7)}
      />
      <Cell
        value={'nm'}
        onClick={() => props.handleClick(8)}
      />
    </div>
  );
}

function renderCharCells(letters, eventListener) {
  var num_chars = 4;
  if (letters[2] === '0')
    num_chars = 2;
  else if (letters[3] === '0')
    num_chars = 3;

  var cells = [];
  for (let i = 0; i < num_chars; i++) {
    if (i === 3) {
      // push phantom button for spacing
      cells.push(
        <button id="phantom_button"></button>
      );
    }
    cells.push(
      <Cell
        value={letters[i]}
        onClick={() => eventListener(i)}
      />
    );
  }
  return cells;
}

function renderSuggestionCells(words, eventListener) {
  var num_suggestions = 0;
  if (words.length > 6)
    num_suggestions = 6
  else
    num_suggestions = words.length

  var cells = [];
  for (let i = 0; i < num_suggestions; i++) {
    cells.push(
      <Cell
        value={words[i]}
        onClick={() => eventListener(i)}
      />
    );
  }
  return cells;
}

function CharGroupGrid(props) {
  return (
    <div>
      <div className="grid">
        {renderCharCells(props.chars, props.handleClick)}
      </div>
      <p id="grid_header">Auto Suggestions:</p>
      <div className="grid">
        {renderSuggestionCells(props.words, props.handleWordClick)}
      </div>
    </div>

  );
}

class Keyboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      word: '',
      letter_group: null,
      all_char_groups: ['qwe', 'rtyu', 'iop', 'asd', 'fgh', 'jkl', 'zxc', 'vb', 'nm'],
      suggestions: [],
      emoji_mode: false
    };
  }
  
  handleMainGridClick(i) {

    var words = this.state.word.split(" ");
    var current_word = words[words.length-1];

    axios.get("http://localhost:8081/" + current_word + "," + this.state.all_char_groups[i]).then(res => {
      if (res.data) {
        console.log(res.data)

        this.setState({
          word: this.state.word,
          letter_group: i,
          all_char_groups:  this.state.all_char_groups,
          suggestions: res.data,
          emoji_mode: false
        });

      } else {
        this.setState({
          word: this.state.word,
          letter_group: i,
          all_char_groups:  this.state.all_char_groups,
          suggestions: [],
          emoji_mode: false
        });
      }
    });
  }

  handleCharGridClick(i) {
    this.setState({
      word: this.state.word + this.state.all_char_groups[this.state.letter_group][i],
      letter_group: null,
      all_char_groups: this.state.all_char_groups,
      suggestions: this.state.suggestions,
      emoji_mode: false
    });
  }

  handleWordClick(i) {

    var iter = this.state.word.length - 1;
    var new_phrase = this.state.word;
    
    while (iter >= 0 && new_phrase[iter] !== " ") {
      new_phrase = new_phrase.substr(0, new_phrase.length - 1);
      iter -= 1;
    }

    new_phrase += this.state.suggestions[i] + " ";
    
    this.setState({
      word: new_phrase,
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: [],
      emoji_mode: false
    });
  }

  emojiCallback(char) {
    this.setState({
      word: this.state.word + char,
      letter_group: null,
      all_char_groups: this.state.all_char_groups,
      suggestions: [],
      emoji_mode: false
    });
  }

  resetCharGroup() {
    this.setState({
      word: this.state.word,
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: this.state.suggestions,
      emoji_mode: false
    });
  }

  activateEmojiMode() {
    this.setState({
      word: this.state.word,
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: [],
      emoji_mode: true
    })
  }

  resetEmojiMode() {
    this.setState({
      word: this.state.word,
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: [],
      emoji_mode: false
    })
  }

  delChar() {
    this.setState({
      word: this.state.word.length > 0 ? this.state.word.slice(0, -1) : '',
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: [],
      emoji_mode: false
    });
  }

  addSpace() {
    this.setState({
      word: this.state.word + ' ',
      letter_group: null,
      all_char_groups:  this.state.all_char_groups,
      suggestions: [],
      emoji_mode: false
    });
  }

  renderCharGroup() {
    var letters = Array(4).fill('0');

    switch (this.state.letter_group) {
      case 1:
        letters[0] = this.state.all_char_groups[1][0];
        letters[1] = this.state.all_char_groups[1][1];
        letters[2] = this.state.all_char_groups[1][2];
        letters[3] = this.state.all_char_groups[1][3];
        break;
      case 7:
      case 8:
        letters[0] = this.state.all_char_groups[this.state.letter_group][0];
        letters[1] = this.state.all_char_groups[this.state.letter_group][1];
        break;
      default:
        letters[0] = this.state.all_char_groups[this.state.letter_group][0];
        letters[1] = this.state.all_char_groups[this.state.letter_group][1];
        letters[2] = this.state.all_char_groups[this.state.letter_group][2];
    }

    return (
      <CharGroupGrid chars={letters} words={this.state.suggestions} handleClick={this.handleCharGridClick.bind(this)} handleWordClick={this.handleWordClick.bind(this)}/>
    );
  }

  render() {
    console.log(this.state.word);
    if (this.state.emoji_mode) {
      document.body.style.overflow = "hidden";
      return (
        <center>
          < br/><br />< br/>< br/>< br/><br />< br/>< br/>
          <div className="keyboard">
            <button
              id="top_button"
              onClick={() => this.resetEmojiMode()}
            >
              &larr;
            </button>
            <DrawCanvas callback={this.emojiCallback.bind(this)}/>
          </div>
          <br /><p id="current_word">{this.state.word}</p>
        </center>
      );
    }    
    else if (this.state.letter_group != null) {
      return (
        <center>
            < br/><br />< br/>< br/>< br/><br />< br/>< br/>
            <div className="keyboard">
              <button
                id="top_button"
                onClick={() => this.resetCharGroup()}
              >
                &larr;
              </button>
              {this.renderCharGroup()}
            </div>
            <br /><p id="current_word">{this.state.word}</p>
        </center>
      );
    } else {
      return (
        <center>
            < br/><br />< br/>< br/>< br/><br />< br/>< br/>
            <div className="keyboard">
              <button
                id="top_buttons"
                onClick={() => this.activateEmojiMode()}
              >
                emoji
              </button>
              <button
                id="top_buttons"
                onClick={() => this.delChar()}
              >
                del
              </button>
              <MainGrid handleClick={this.handleMainGridClick.bind(this)} />
              <button
                id="space_button"
                onClick={() => this.addSpace()}
              >
                space
              </button>
            </div>
            <br /><p id="current_word">{this.state.word}</p>
        </center>
      );
    }
  }
}

ReactDOM.render(
  <Keyboard />,
  document.getElementById('root')
);
