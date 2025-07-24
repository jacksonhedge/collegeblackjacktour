import React from 'react';
import MechanicalStockTicker from './MechanicalStockTicker';
import './MechanicalTickerDemo.css';

const MechanicalTickerDemo = () => {
  return (
    <div className="ticker-demo-container">
      <header className="demo-header">
        <h1>Mechanical Stock Ticker</h1>
        <p>A retro-inspired stock ticker with split-flap display animations</p>
      </header>

      <div className="ticker-wrapper">
        <MechanicalStockTicker />
      </div>

      <div className="demo-info">
        <div className="info-section">
          <h2>Features</h2>
          <ul>
            <li>Mechanical digit rolling animation inspired by split-flap displays</li>
            <li>Smooth horizontal scrolling ticker tape</li>
            <li>Color-coded price changes (green for gains, red for losses)</li>
            <li>Automatic price updates every 5 seconds</li>
            <li>Responsive design for mobile and desktop</li>
            <li>Pause on hover for better readability</li>
          </ul>
        </div>

        <div className="info-section">
          <h2>Animation Details</h2>
          <ul>
            <li>Each digit animates independently with a slight delay</li>
            <li>3D flip effect simulates mechanical rotation</li>
            <li>Subtle blur effect during transitions</li>
            <li>LED-style glow on hover</li>
            <li>Retro monospace font for authenticity</li>
          </ul>
        </div>

        <div className="controls-section">
          <h2>Usage</h2>
          <pre className="code-block">
{`import MechanicalStockTicker from './components/ticker/MechanicalStockTicker';

function App() {
  return (
    <div>
      <MechanicalStockTicker />
    </div>
  );
}`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default MechanicalTickerDemo;