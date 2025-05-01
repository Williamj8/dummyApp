import React from 'react';
import './App.css';
import { Button } from 'antd';
import CapacityManagementButton from './components/button';
import FormComponent from './components/form';
import DropdownInputCard from './components/store config/store';

function App() {
  return (
    <div className="App">
  <Button>s</Button>
  <CapacityManagementButton/>
  <hr></hr>
  {/* <FormComponent/> */}
  <DropdownInputCard/>
    </div>
  );
}

export default App;
