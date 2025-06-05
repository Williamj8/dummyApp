import React from 'react';
import './App.css';
import { Card, Button } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import CapacityManagementButton from './components/button';
import FormComponent from './components/form';
import DropdownInputCard from './components/Items config/store';
import TrackerTable from './components/track/trackerTable';

const { Meta } = Card;

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/capacity-management" element={<CapacityManagementButton />} />
          <Route path="/dropdown-input" element={<DropdownInputCard />} />
          <Route path="/TrackerTable" element={<TrackerTable />} />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px' }}>
      <Link to="/capacity-management">
        <Card
          hoverable
          style={{ width: 300 }}
          cover={
            <img
              alt="Capacity Management"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          }
        >
          <Meta
            title="Cap Management"
            description="Cap modal and button"
          />
        </Card>
      </Link>

      <Link to="/dropdown-input">
        <Card
          hoverable
          style={{ width: 300 }}
          cover={
            <img
              alt="Dropdown Input"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          }
        >
          <Meta
            title="Bulk Item"
            description='Bulk'
          />
        </Card>
      </Link>

      <Link to="/TrackerTable">
        <Card
          hoverable
          style={{ width: 300 }}
          cover={
            <img
              alt="TrackerTable"
              src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
            />
          }
        >
          <Meta
            title="Track Item"
            description='Tracking changes'
          />
        </Card>
      </Link>
    </div>
  );
}

export default App;