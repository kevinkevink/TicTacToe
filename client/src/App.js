import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Home from './Home';
import Tick from './Tick';

class App extends Component {
  render() {
    const App = () => (
      <Router>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/list' element={<Tick/>}/>
        </Routes>
      </Router>
    )
    return (
        <App/>
    );
  }
}

export default App;