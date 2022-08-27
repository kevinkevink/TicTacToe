import React, { Component } from 'react';
const axios = require('axios');

//socket.emit('message-from-client-to-server', 'Hello World!');
const io = require("socket.io-client");
const socket = io("http://localhost:3001");
        
socket.on('connection', function(msg) {
    //document.getElementById('message').innerHTML = msg;
    console.log("connected to server");
});

document.body.style.font = "14px \"Century Gothic\", Futura, sans-serif";
document.body.style.margin = "20px";
document.body.style.height = "100%";
document.body.style.width = "100%";

function Square(props){
    return(
        <button className="square" style={{
            background: "#fff",
            border: "2px solid #999",
            float: "left",
            fontSize: "24px",
            fontWeight: "bold",
            lineHeight: "100px",
            height: "100px",
            marginRight: "-1px",
            marginTop: "-1px",
            padding: "0",
            textAlign: "center",
            width: "100px"
        }}
        onClick={()=> props.onClick()}>
            {props.value}
        </button>
    );
}

class Board extends React.Component{
    
    constructor(props) {
        super(props);
        var square = Array(9).fill(null);
        
        this.state = {
            initialized: 0,
            squares: square,
            xIsNext: true,
            Team: false
          };
      }

    
      async initialize(self){
        let square = Array(9).fill(null);
        let XVar = 0;
        let OVar = 0;
        let OTeam = false;

        await axios.get('/api/getTeam')
        .then((response) => {
            OTeam = response.data;
        });
        await axios.get('/api/getSquares').then((response) => {
            for(var i = 0; i < response.data.length; i++){
                if(response.data[i] != null){
                    if(response.data[i] === 'X'){
                        XVar++;
                    }else{
                        OVar++;
                    }
                    square[i] = response.data[i];
                }
            }
        });

        self.setState({
            initialized: 1,
            squares: square,
            xIsNext: XVar - OVar === 0 ? true : false,
            Team: OTeam
        });
    }

    componentWillMount(){
        var self = this;
        if(self.state.initialized === 0){
            self.initialize(self);
        }
        socket.on("newSquares", function(newSquares) {
            let square = Array(9).fill(null);
            let XVar = 0;
            let OVar = 0;

            for(var i = 0; i < newSquares.length; i++){
                if(newSquares[i] != null){
                    if(newSquares[i] === 'X'){
                        XVar++;
                    }else{
                        OVar++;
                    }
                    square[i] = newSquares[i];
                }
            }
            self.setState({
                initialized: 1,
                squares: square,
                xIsNext: XVar - OVar === 0 ? true : false,
                Team: self.state.Team
            });
         });
    }

    renderSquare(i) {
        return(
            <Square 
                value={this.state.squares[i]}
                onClick={() => this.handleClick(i)}
            />
        );
      }

    handleClick(i) {
        const squares = this.state.squares.slice();
        if(calculateWinner(squares) || squares[i]){
            return;
        }
        //X is not current and You are Team X OR O is next and You are Team O
        //Team = F and xIsNext = TRUE
        if((!this.state.xIsNext && !this.state.Team) || 
        (this.state.xIsNext && this.state.Team)){
            return;
        }
        squares[i] = this.state.xIsNext? 'X' : 'O';
        this.setState({
            squares: squares,
            xIsNext: !this.state.xIsNext,
            Team: this.state.Team,
            initialized: 1
        });

        socket.emit("updateSquares", squares);
      }
    
    render() {
        let status;
        const winner = calculateWinner(this.state.squares);
        if(winner){
            status = 'Winner: ' +  (this.state.xIsNext ? 'O' : 'X');
        }else{
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }
        var assignment = 'You are Team ' + (this.state.Team ? 'O' : 'X');
        return(
            <div>
                <div id="status" style={{marginBottom: "10px",
                                        textAlign: "center"
            }}>
                    {status}
                </div>
                <div id="assignment" style={{marginBottom: "10px",
                                        textAlign: "center"
            }}>
                    {assignment}
                </div>
                <div className="board-row" style={{
                    margin: "auto",
                    paddingLeft: "20px"
                }}>
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row" style={{
                    margin: "auto",
                    paddingLeft: "20px"
                }}>
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row" style={{
                    margin: "auto",
                    paddingLeft: "20px"
                }}>
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

const checkThree = (a, b, c) => {
    // If any of the values are null, return false
    if (!a || !b || !c) return false
    return a === b && b === c
}

function calculateWinner(squares) {
    return checkThree(squares[0], squares[1], squares[2]) || 
           checkThree(squares[3], squares[4], squares[5]) || 
           checkThree(squares[6], squares[7], squares[8]) || 
           checkThree(squares[0], squares[3], squares[6]) || 
           checkThree(squares[1], squares[4], squares[7]) || 
           checkThree(squares[2], squares[5], squares[8]) || 
           checkThree(squares[0], squares[4], squares[8]) || 
           checkThree(squares[2], squares[4], squares[6])
}

class Tick extends Component{
   render(){
      return(
        <div style={{
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "50%",
            margin: "auto",
            paddingTop: "50px"
        }}>
            <h1 id="title" style={{color: "red",
        textAlign: "center"
        }}>Tic Tac Toe</h1>
                <div id="game" style={{
                    maxWidth: "100%",
                    display: "block",
                    marginLeft: "auto",
                    marginRight: "auto",
                    width: "50%"
                }}>
                <div id="game-board">
                    <Board />
                </div>
            </div>
         </div>
      );
   }
}
export default Tick;