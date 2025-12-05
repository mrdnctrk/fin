import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

const MarginChart = () => {
  // Input parameters
  const [inputMarketValue, setInputMarketValue] = useState(20000);
  const [inputLoan, setInputLoan] = useState(5000);
  const [inputMarginRate, setInputMarginRate] = useState(30);

  // Calculated values
  const initialMarketValue = Math.max(0, inputMarketValue);
  const loan = Math.max(0, inputLoan);
  const marginRate = inputMarginRate / 100;
  const initialEquity = initialMarketValue - loan;
  
  // Validation warning
  const isInvalid = initialEquity < 0 || loan > initialMarketValue;

  // Generate data points as market value drops
  const data = [];
  for (let mv = initialMarketValue; mv >= 0; mv -= Math.max(100, initialMarketValue / 40)) {
    const equity = mv - loan;
    const maintenanceMargin = mv * marginRate;
    const excessLiquidity = Math.max(0, equity - maintenanceMargin);
    // Buying power is typically Excess Liquidity * leverage (4x for stocks with 25% margin)
    const buyingPower = excessLiquidity * 4;
    // Leverage = Total Market Value / Net Liquidation Value
    const leverage = equity > 0 ? mv / equity : 0;
    
    data.push({
      marketValue: mv,
      equity: equity,
      maintenanceMargin: maintenanceMargin,
      excessLiquidity: excessLiquidity,
      buyingPower: buyingPower,
      leverage: leverage,
      marginCall: equity < maintenanceMargin
    });
  }

  // Find margin call point
  const marginCallPoint = data.find(d => d.marginCall);
  const marginCallValue = marginCallPoint ? marginCallPoint.marketValue : 0;
  const dropPercentage = ((initialMarketValue - marginCallValue) / initialMarketValue * 100).toFixed(2);

        const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const mv = payload[0].payload.marketValue;
      const equity = payload[0].payload.equity;
      const mm = payload[0].payload.maintenanceMargin;
      const excess = payload[0].payload.excessLiquidity;
      const bp = payload[0].payload.buyingPower;
      const isMarginCall = equity < mm;
      
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">Market Value: ${mv.toLocaleString()}</p>
          <p className="text-xs text-gray-500">(IBKR: Equity with Loan Value)</p>
          <p className="text-blue-600 mt-1">Account Equity: ${equity.toLocaleString()}</p>
          <p className="text-xs text-gray-500">(IBKR: Net Liquidation Value)</p>
          <p className="text-orange-600 mt-1">Maint. Margin: ${mm.toLocaleString()}</p>
          {excess > 0 && <p className="text-green-600 mt-1">Excess Liquidity: ${excess.toLocaleString()}</p>}
          {bp > 0 && <p className="text-purple-600 mt-1">Buying Power: ${bp.toLocaleString()}</p>}
          {isMarginCall && <p className="text-red-600 font-bold mt-1">⚠ MARGIN CALL</p>}
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ x, y, index }) => {
    // Only show label at a specific point (middle of chart)
    if (index === 15) {
      return (
        <text 
          x={x} 
          y={y - 40} 
          fill="#10b981" 
          fontSize="14" 
          fontWeight="600"
          textAnchor="middle"
        >
          Excess Liquidity
        </text>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Margin Account Analysis</h2>
        
        {/* Input Controls */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-3 text-gray-700">Input Parameters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Market Value (Equity with Loan Value)
              </label>
              <input
                type="number"
                value={inputMarketValue}
                onChange={(e) => setInputMarketValue(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Amount
              </label>
              <input
                type="number"
                value={inputLoan}
                onChange={(e) => setInputLoan(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maintenance Margin Rate (%)
              </label>
              <input
                type="number"
                value={inputMarginRate}
                onChange={(e) => setInputMarginRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="5"
              />
            </div>
          </div>
        </div>
        
        {/* Validation Warning */}
        {isInvalid && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
            <p className="text-sm font-semibold text-yellow-800">
              ⚠ Warning: Loan Amount (${inputLoan.toLocaleString()}) cannot exceed Total Market Value (${inputMarketValue.toLocaleString()})
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-600">Account Equity</p>
            <p className="text-xs text-gray-500">(Net Liquidation Value)</p>
            <p className="text-lg font-bold text-blue-600">${initialEquity.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-sm text-gray-600">Loan Amount</p>
            <p className="text-lg font-bold text-gray-600">${Number(inputLoan).toLocaleString()}</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="text-sm text-gray-600">Total Market Value</p>
            <p className="text-xs text-gray-500">(Equity with Loan Value)</p>
            <p className="text-lg font-bold text-green-600">${initialMarketValue.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <p className="text-sm text-gray-600">Margin Rate</p>
            <p className="text-lg font-bold text-orange-600">{inputMarginRate}%</p>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <p className="text-sm text-gray-600">Current Buying Power</p>
            <p className="text-lg font-bold text-purple-600">${(Math.max(0, initialEquity - initialMarketValue * marginRate) * 4).toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm font-semibold text-red-800">
            Margin Call Triggered at Market Value: ${marginCallValue.toLocaleString()}
          </p>
          <p className="text-sm font-semibold text-red-800 mt-1">
            Market Value Drop Required: {dropPercentage}% (${(initialMarketValue - marginCallValue).toLocaleString()} decline)
          </p>
          <p className="text-xs text-red-600 mt-1">
            (When Account Equity drops below Maintenance Margin)
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="marketValue" 
              label={{ value: 'Total Market Value - (IBKR: Equity with Loan Value) ($)', position: 'insideBottom', offset: -5 }}
              reversed
            />
            <YAxis 
              label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <defs>
              <linearGradient id="excessGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="excessLiquidity"
              stroke="none"
              fill="url(#excessGradient)"
              name="Excess Liquidity"
              stackId="1"
              baseValue={0}
            />
            <ReferenceLine 
              x={marginCallValue} 
              stroke="red" 
              strokeDasharray="3 3" 
              label={{ value: 'Margin Call', fill: 'red', fontSize: 12, angle: -90, position: 'center' }}
            />
            <ReferenceLine 
              x={loan} 
              stroke="purple" 
              strokeDasharray="5 5" 
              label={{ value: 'Loan Amount', fill: 'purple', fontSize: 12, angle: -90, position: 'center' }}
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Account Equity (IBKR: Net Liquidation Value)" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="buyingPower" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Buying Power (IBKR)" 
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="maintenanceMargin" 
              stroke="#f97316" 
              strokeWidth={2}
              name="Maintenance Margin Requirement" 
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Key Formulas:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Total Market Value (IBKR: Equity with Loan Value) = Market value of your positions</li>
            <li>Account Equity (IBKR: Net Liquidation Value) = Market Value - Loan ($5,000)</li>
            <li>Maintenance Margin = Market Value × 30%</li>
            <li>Excess Liquidity = Account Equity - Maintenance Margin</li>
            <li>Buying Power (IBKR) = Excess Liquidity × 4 (assumes 25% initial margin requirement)</li>
            <li>Margin Call occurs when Account Equity &lt; Maintenance Margin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarginChart;