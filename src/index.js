
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import './index.css';
//import App from './App';
import $ from 'jquery';
//import reportWebVitals from './reportWebVitals';
import marked from 'marked';
import 'bootstrap/dist/css/bootstrap.min.css';
import "bootstrap-icons/font/bootstrap-icons.css";
let mexp = require('math-expression-evaluator');

//import marked from 'https://cdnjs.cloudflare.com/ajax/libs/marked/3.0.4/marked.min.js'; //used by marked previewer
//const & variables
const INPUT = 'INPUT';
const NEWINPUT = 'NEWINPUT';
const MEMORY = 'MEMORY';
const MEMADD = 'memAdd';
const MEMDEL = 'memDel';
const MEMUP = 'memUp';
const MEMDOWN = 'memDown';

const CLEAR = 'clear';
const BACKSPACE = 'backspace';
const MEMINDEX = 'MEMINDEX';
const PADINPUT = ['one','two','three','four','five','six','seven','eight','nine','zero','decimal','add','subtract','divide','multiply','pstart','pend','mod'];
const OPERATIONS = ['add','subtract','divide','multiply','mod'];
const OPERATORS = ['/','*','+','-','Mod'];
const KEYEVENT = {
  'Escape' : 'clear',
  'Backspace' : 'backspace',
  '(' : 'pstart',
  ')' : 'pend',
  '1' : 'one',
  '2' : 'two',
  '3' : 'three',
  '4' : 'four',
  '5' : 'five',
  '6' : 'six',
  '7' : 'seven',
  '8' : 'eight',
  '9' : 'nine',
  '0' : 'zero',
  'Insert' : 'memAdd',
  'Delete' : 'memDel',
  'ArrowUp' : 'memUp',
  'ArrowDown' : 'memdown',
  '*' : 'multiply',
  '/' : 'divide',
  '-' : 'subtract',
  '+' : 'add',
  'Enter' : 'equals',
  'Mod' : 'Mod',
  '.' : 'decimal',
}

const SAMPLE = `
<h6>Math Sample</h6>

- 1 + 2
- 5 / 3 * + 2 * - 1
- (1 * 3) / ( 4 - ( 5 Mod 3 ))

multiple operators except minus takes the last operator

<h6>Buttons *(keyboard)</h6>

- **m+** (insert) is to save display to memory
- **m-** (delete) is to delete selected memory
- <i class="fas fa-chevron-up"></i> (<i class="fas fa-chevron-up"></i>) to navigate memory
- <i class="fas fa-chevron-down"></i> (<i class="fas fa-chevron-down"></i>)  to navigate memory
- **mod** (%) to perform modulo, ex. 4 Mod 2 = 0
- **=** (enter) to perform calculation
- **AC** (escape) to clear display
- <i class="fas fa-backspace"></i> (backspace) to remove end item

`;

//state

const systemState = {
  input : ['0'],
  newinput: true,
  memory: [],
  memindex: '',
}

//Redux
//action
const actionInput = (input) => {
  return {
    type: INPUT,
    input: input,
  }
}
const actionNewInput = (newInput) => {
  return {
    type: NEWINPUT, //boolean haha
    newinput: newInput,
  }
}
const actionMemory = (mem) => {
  return {
    type: MEMORY,
    memory: mem,
  }
}
const actionMemIndex = (memindex) => {
  return {
    type: MEMINDEX,
    memindex: memindex,
  }
}
//reducer
const systemReducer = (state=systemState,action) => {
  const newState = Object.assign({},state);
  switch (action.type) {
    case INPUT:
      newState.input = action.input;
      return newState;
    case NEWINPUT:
      newState.newinput = action.newinput;
      return newState;
    case MEMORY:

      newState.memory = action.memory;
      return newState;
    case MEMINDEX:
      newState.memindex = action.memindex;
      return newState;
    default:
      return state;
  }

}
//combine reducer
const rootReducer = combineReducers({
  system: systemReducer,
})



//create store
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
)

//React
class Panel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      output: 0,
    }
  }

  dispatchInput = (result) => {
    this.props.dispatchInput([result]);
  }




  componentDidMount() {

  }

  render() {
    return (
    <div id="calcpanel" className="d-flex align-items-center justify-content-center">
        <div id="calcpanelout">
          <div id="display" className='text-end'>
            <p>{`${this.props.state.system.input.join('')}`}</p>
          </div>
          <div id='memindex' className="d-flex justify-self-start align-self-center">
            <p>{`${this.props.state.system.memindex}`}</p>
          </div>
        </div>
    </div>
    )
  }
}

//React
class Pad extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      input : [],
      pstart: [],
      canperiod: true,
    }
  }
  buttonclicked = (event) => {
    const input = event.target.id;
    let memory = this.props.state.system.memory.slice();
    let memlen = memory.length;
    let memindex = this.props.state.system.memindex;
    let index = memlen - 1;
    let memdata = null;

    switch (input){
      case MEMADD:
        const display = $('#display').text()
        if (display==='0') return;
        const mem = {
          display: this.props.state.system.input,
          input: this.state.input,
          pstart: this.state.pstart,
          canperiod: this.state.canperiod,
        }
        memory.push(mem);
        this.props.dispatchMemory(memory);
        this.props.dispatchMemIndex(memory.length-1);
        return;
      case MEMDEL:
      console.log(memindex);
        if (this.props.state.system.memory.length === 0 | memindex==='')return;
        memory.splice(memindex,1);
        this.props.dispatchMemory(memory);
        this.setState({input:[],pstart:[],canperiod:true});
        this.props.dispatchInput(['0']);
        this.props.dispatchMemIndex('');
        return;
      case MEMUP:
        if (memlen === 0)return;
        if (memindex==='') {
          index = 0;
          this.props.dispatchMemIndex(index);
        }
        else {

          index = `${parseInt(memindex) - 1}`;
          if (index < 0) index = `${memlen-1}`;
          this.props.dispatchMemIndex(index);
        }
        memdata = memory[index];
        this.props.dispatchInput(memdata.display);
        this.setState({
          input: memdata.input,
          pstart: memdata.pstart,
          canperiod: memdata.canperiod,
        })
        return;
      case MEMDOWN:
        if (memlen === 0)return;
        if (memindex==='') {
          index = memlen-1;
          this.props.dispatchMemIndex(index);
        }
        else {
          index = `${(parseInt(memindex)+1)%memlen}`;
          this.props.dispatchMemIndex(index);
        }
        memdata = memory[index];
        this.props.dispatchInput(memdata.display);
        this.setState({
          input: memdata.input,
          pstart: memdata.pstart,
          canperiod: memdata.canperiod,
        })
        return;
      case CLEAR:
        this.setState({input:[],pstart:[],canperiod:true});
        this.props.dispatchInput(['0']);
        this.props.dispatchMemIndex('');
        return;
      case BACKSPACE:
        //make a copy of our inputs
        const globalinput = this.props.state.system.input.slice();
        const copylocalinput = this.state.input.slice();
        const copypstart = this.state.pstart.slice();
        //look for special intructions we applied in the code
        //remove them before we remove the actual item
        if (globalinput[globalinput.length-1]===' ')globalinput.pop();
        if (globalinput[globalinput.length-1]==='('){
          copypstart.pop();
          this.setState({pstart: copypstart});
        }
        //if last item is operator
        if (OPERATORS.indexOf(globalinput[globalinput.length-1])>-1) {
          //get lastindex for + - * /
          const operatorsindex = [globalinput.lastIndexOf('+'),globalinput.lastIndexOf('-'),globalinput.lastIndexOf('/'),globalinput.lastIndexOf('*')].sort((a, b)=>b-a);
          //get last index for period .
          const periodindex = globalinput.lastIndexOf('.');
          //determine if period is between or equal the lastindex of operator and second from last index
          //then we are not allowed to put a period, else we are allowed to put a period
          if (periodindex <= operatorsindex[0] && periodindex >= operatorsindex[1] && operatorsindex[0]>-1) this.setState({canperiod:false})
          else this.setState({canperiod:true});
        }
        //check if our last item is a period and were going to pop it, therefore we can period
        if (globalinput[globalinput.length-1]==='.')this.setState({canperiod:true});
        globalinput.pop();
        if (globalinput.length===0) globalinput.push('0');
        this.props.dispatchInput(globalinput);
        copylocalinput.pop();
        this.setState({input: copylocalinput});
        return;
      default:
        break;
    }

    //see if button in an input and not special buttons like AC, C, up,down, m+,m-, =
    if (PADINPUT.indexOf(input)>-1){
      const localinputlength = this.state.input.length - 1;
      const localinputlastitem = this.state.input[localinputlength];
      let localinput = $('#'+input).text();
      const copypstart = this.state.pstart.slice();
      //if we get an error, once we click any number or open parenthesis
      //should remove the error remarks
      if(this.props.state.system.newinput){
        this.props.dispatchInput(['0']);
        this.setState({input:[],pstart:[]});
        this.props.dispatchNewInput(false);
      }
      //check if new input, then change 0 to number or decimal or (
      //no operations should be input at the beginning
      if (this.props.state.system.input[0] === '0') {
        //do not input close parenthesis or an operation in the beginning of our equation
        if (event.target.id === "pend" | OPERATIONS.indexOf(input)>-1)return;
        //global
        this.props.dispatchInput([localinput]);
        //local
        this.setState({input: [localinput]});
        if (localinput==='('){
          copypstart.push('(');
          this.setState({pstart: copypstart});
        }
        return;
      }
      //everytime an operator is click, local input will be an empty array
      //this will help the app to determine if local input have decimal

      //check if last input is a number and if were adding an operation then we can reset the local input
        if (!isNaN(localinputlastitem)  && OPERATIONS.indexOf(input)>-1) this.setState({input:[]});
        //see if last input is an operation and the next input is an open parenthesis
        //if so don't do anything
        if (OPERATORS.indexOf(localinputlastitem)>-1 && localinput===')')return;

        //check if last input is an open parenthesis and next input is a close parenthesis or an operation

        if (localinputlastitem==='(' &  (OPERATIONS.indexOf(input)>-1 | localinput===')'))return;

      //do not add another decimal if it exist in the local input
        if (input === "decimal" && !this.state.canperiod)return;
        else if(input==="decimal" && this.state.canperiod)this.setState({canperiod:false});

        // we set an array that will store(push) an open parenthesis, whenever we include in the equation
        // then pop whenever we put a close parenthesis
        // this will help us to determine if we are allowed to put a close parenthesis

        if (localinput===')' && copypstart.length===0)return;
        else if(localinput===')' && copypstart.length>0){
          copypstart.pop();
          this.setState({pstart:copypstart});
        }
        //check if we are including a '(' in the equation
        //then push that to our pstart
        if (localinput==='('){
          copypstart.push('(');
          this.setState({pstart: copypstart});
        }
        //copy our global input - react-redux
        //manipulate the copy and send back to global input
        const globalinput = this.props.state.system.input.slice();
        const copylocalinput = this.state.input.slice();

        if (OPERATIONS.indexOf(input)>-1|OPERATORS.indexOf(localinputlastitem)>-1) {
          globalinput.push(' ');
          if(OPERATORS.indexOf(localinputlastitem)>-1)copylocalinput.push(' ');
          this.setState({canperiod:true});
        }
        if (localinput === 'mod')localinput = 'Mod';
        globalinput.push(localinput);
        this.props.dispatchInput(globalinput);
        //copy our local input - local-state
        //manipulate the copy and update the local state

        copylocalinput.push(localinput);
        this.setState({input: copylocalinput});
    }
  }
  keydown = (event) => {
    //https:stackoverflow.com/questions/2381572/how-can-i-trigger-a-javascript-event-click
    if(Object.keys(KEYEVENT).indexOf(event.key)>-1) $('#'+KEYEVENT[event.key])[0].click();
  }
  mathpost = () => {
    this.setState({input:[],pstart:[]});
    this.props.dispatchMemIndex('');
    if (this.props.state.system.input.join('').indexOf('.')>-1)this.setState({canperiod:false});
    const input = this.props.state.system.input.slice().join(''); //using for mathjs
    let inputnospace = input.slice().split(' ').join(''); //using for eval
    if(input===null||input===''||input==='0') return 0;
    //we need to fix the condition
    //test 13. If 2 or more operators are entered consecutively, the operation performed should be the last operator entered (excluding the negative (-) sign.
    //find operators with [*/+]+-*[*/+]+
    //we use exec to find every instances and remove the excess operators
    //sample: 2+-*3 => 2*3
    //sample: 2+*-3 => 2*-3
    //sample: 2+*3 => 2*3
    //sample: 2*-3 => 2*-3
    let regexp = new RegExp('[\\*\\+\\/]+-*[\\*\\+\\/]+','g');
    let matchh = null;
     do  {
       matchh = regexp.exec(inputnospace);

       if (matchh!= null){
         //console.log(regexp.lastIndex, matchh.index, matchh.length,matchh);
         inputnospace = `${inputnospace.slice(0,matchh.index)+matchh[0][matchh[0].length-1]+ inputnospace.slice(regexp.lastIndex)}`;
         regexp.lastIndex = matchh.index+1;
       }
     } while(matchh)

     //check fpr error input
     let result = null;
     try {result = mexp.eval(inputnospace)}
     catch (e) {


      this.props.dispatchInput(['error']);
      this.props.dispatchNewInput(true);

       return this.props.state.system.input[0];
     }
    return this.props.dispatchInput([result]);
    //is not going to continue here because of return.
    /*
    //using mathjs api
    //not good with the project cause of asynchronous
    const expr = `"${input}"`;
    const data = `{
        "expr": [${expr}],
        "precision": 4
        }`;
    //console.log(data)

    const dispatch = this.dispatchInput;
    const url="https://api.mathjs.org/v4/";
    //https://reqbin.com/req/javascript/yxgi232e/get-request-with-cors-headers
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        //console.log(xhr.status);
        if(xhr.status === 200){
        const obj = JSON.parse(xhr.responseText);
        dispatch(obj.result);
        }
      }};
    xhr.send(data);

    /*
    const data = `{
          "expr": [
          "a = 1.2 * (2 + 4.5)",
          "a / 2",
          "5.08 cm in inch",
          "sin(45 deg) ^ 2",
          "9 / 3 + 2i",
          "b = [-1, 2; 3, 1]",
          "det(b)"
          ],
          "precision": 14
          }`;

    return input;
    */
  }
  componentDidMount() {
    $('#calcpadbody  .row  p')
      .prop('className','calcbtn col d-flex align-items-center justify-content-center')
      .on('click',this.buttonclicked);
      $('#equals').on('click',this.mathpost);
    $(document).on('keydown', this.keydown);
  }


  render() {
    return (
    <div id="calcpad" className="d-flex align-items-center justify-content-center">
        <div id="calcpadbody" className="container align-items-center justify-content-center">
          <div className="row">
            <p id="clear">AC</p>
            <p id="backspace"><i className="bi bi-backspace-fill"></i></p>
            <p id="pstart">(</p>
            <p id="pend">)</p>
            <p id="memAdd">m+</p>
          </div>
          <div className="row">
            <p id="seven">7</p>
            <p id="eight">8</p>
            <p id="nine">9</p>
            <p id="divide">/</p>
            <p id="memDel">m-</p>
          </div>
          <div className="row">
            <p id="four">4</p>
            <p id="five">5</p>
            <p id="six">6</p>
            <p id="multiply">*</p>
            <p id="memUp"><i className="bi bi-chevron-up"></i></p>
          </div>
          <div id="" className="row">
            <p id="one">1</p>
            <p id="two">2</p>
            <p id="three">3</p>
            <p id="subtract">-</p>
            <p id="memDown"><i className="bi bi-chevron-down"></i></p>
          </div>
          <div className="row">
            <p id="zero">0</p>
            <p id="decimal">.</p>
            <p id="equals">=</p>
            <p id="add">+</p>
            <p id="mod">Mod</p>
          </div>
        </div>
    </div>
    )
  }
}

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inwidth : '400px',
      inheight : '450px',
      hidden : true,
    }
  }


  documentChange = (event) => {
    //set the width and height of our manual base on the width of our window
    //breakpoint 992, 576  (pre,between,post)
    //see css when window reached 992 and beyond
    if ($(window).width() <= 312) {
      this.setState({
          inwidth: $('#calcpanel').width()+12,
          inheight: $('#calcpad').height()+$('#calcpanel').height()+100,
      });

    }
    else if ($(window).width() <= 576) {
      this.setState({
          inwidth: $('#calcpanel').width()+12,
          inheight: $('#calcpad').height()+$('#calcpanel').height()+12,
      });
    }
    else {
      this.setState({
        inwidth : 400,
        inheight : $('#calcpad').height()+$('#calcpanel').height()+12,
      });
   }
  }

  componentDidMount() {
    //attach event to clicks for infoicon and closeicon
    $('#infoicon').on('click',()=>{
      this.setState({hidden:false})});
    $('#closeicon').on('click',()=>this.setState({hidden:true}));
    $(window).resize(this.documentChange);
  }

  //parse input to html using marked (this is imported on //React tag)
  seepreview(input){
      marked.use({breaks:true});
      $('#preview').html(marked(input)===null?'<h1>error</h1>':marked(input));
   }

  render (){
    return (
      <div id="manual">
        <div id='instruction' className="container" style={{width:this.state.inwidth, height:this.state.inheight, opacity:this.state.hidden?0:1, pointerEvents:this.state.hidden?'none':'fill',}}>
          <div className="row inhead">
            <div className="col d-flex align-items-center justify-content-end">
              <div id="closeicon" className="text-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z"/>
                <path fillRule="evenodd" d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z"/>
              </svg></div>
            </div>
          </div>
          <div id="preview" className="row"></div>
            {/*call see preview which will interpret SAMPLE input into HTML
              sample is declared as a constant input with special formatting
              sample is the instruction
            */}
            {this.seepreview(SAMPLE)}
        </div>
        <div  id="infoicon" style={{opacity:this.state.hidden?1:0}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-info-square" viewBox="0 0 16 16">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
        </svg></div>
      </div>
    )
  }
}


//Dispatch
//mapStatetoProps & mapDispatchToProps
const mapStateToProps = (state) => {
  return {state:state,}
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatchInput : (input) => {
      dispatch(actionInput(input));
    },

    dispatchNewInput : (newInput) => {
      dispatch(actionNewInput(newInput))
    },
    dispatchMemory : (memory) => {
      dispatch(actionMemory(memory))
    },
    dispatchMemIndex : (memindex) => {
      dispatch(actionMemIndex(memindex))
    },
  }
}

//connect state and dispatch
const CalcPanel = connect(mapStateToProps,mapDispatchToProps)(Panel);
const CalcPad = connect(mapStateToProps,mapDispatchToProps)(Pad);

//AppWrapper
class AppWrapper extends React.Component {
  render(){
    return (
      <Provider store={store}>
        <Info/>
        <div id="calcbody">
          <CalcPanel/>
          <CalcPad/>
        </div>
        <div id='developedby' className='text-center'>Calculator by Brill Jasper Amisola Rayel</div>
      </Provider>
    )
  }
}

ReactDOM.render(<AppWrapper/>,document.getElementById('root'));


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
