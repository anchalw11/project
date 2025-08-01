import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, Clock, Target, AlertTriangle, CheckCircle, Filter, Shield, XCircle, CheckSquare } from 'lucide-react';
import { io } from 'socket.io-client';

interface Signal {
  id: number;
  pair: string;
  type: 'Buy' | 'Sell';
  entry: string;
  stopLoss: string;
  takeProfit: string[];
  confidence: number;
  timeframe: string;
  timestamp: string;
  status: 'active' | 'closed' | 'pending';
  analysis: string;
  ictConcepts: string[];
  rsr: string;
  pips: string;
  positive: boolean | null;
  taken?: boolean;
}

const SignalsCenter = () => {
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const loadSignalsFromStorage = () => {
      // Load signals from localStorage (demo mode)
      const storedMessages = JSON.parse(localStorage.getItem('telegram_messages') || '[]');
      const storedTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      
      const formattedSignals = storedMessages.map(parseSignal).filter(Boolean) as Signal[];
      const takenTradeIds = new Set(storedTrades.map((trade: any) => trade.signal_id || trade.id));

      const updatedSignals = formattedSignals.map(signal => ({
        ...signal,
        taken: takenTradeIds.has(signal.id)
      }));

      setSignals(updatedSignals);
    };

    // Initial load
    loadSignalsFromStorage();
    
    // Listen for new signals from admin dashboard
    const handleNewSignal = (event: any) => {
      loadSignalsFromStorage();
    };
    
    window.addEventListener('newSignalSent', handleNewSignal);
    
    // Refresh every 5 seconds to check for updates
    const interval = setInterval(loadSignalsFromStorage, 5000);

    return () => {
      window.removeEventListener('newSignalSent', handleNewSignal);
      clearInterval(interval);
    };
  }, []);

  const parseSignal = (message: any): Signal | null => {
    try {
      const lines = message.text.split('\n');
      const pair = lines[0];
      const type = lines[1].includes('BUY') ? 'Buy' : 'Sell';
      const entry = lines[2].split(' ')[1];
      const stopLoss = lines[3].split(' ')[2];
      const takeProfit = lines[4].split(' ')[2].split(', ');
      const confidence = parseInt(lines[5].split(' ')[1].replace('%', ''));
      const analysis = lines[7];
      
      return {
        id: message.id,
        pair,
        type,
        entry,
        stopLoss,
        takeProfit,
        confidence,
        timeframe: 'N/A',
        timestamp: new Date(message.timestamp).toLocaleString(),
        status: 'active',
        analysis,
        ictConcepts: [],
        rsr: 'N/A',
        pips: 'N/A',
        positive: null,
        taken: false
      };
    } catch (error) {
      console.error('Error parsing signal:', error);
      return null;
    }
  };

  const handleCopyTrade = (signal: Signal) => {
    const tradeDetails = `Pair: ${signal.pair}\nType: ${signal.type}\nEntry: ${signal.entry}\nStop Loss: ${signal.stopLoss}\nTake Profit: ${signal.takeProfit.join(', ')}`;
    navigator.clipboard.writeText(tradeDetails);
    alert('Trade details copied to clipboard!');
  };

  const handleMarkAsTaken = async (signalId: number) => {
    const takenSignal = signals.find(s => s.id === signalId);
    if (!takenSignal) return;

    try {
      // Store taken trade in localStorage
      const existingTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      const tradeData = {
        signal_id: signalId,
        id: signalId,
        pair: takenSignal.pair,
        type: takenSignal.type,
        entry: takenSignal.entry,
        stopLoss: takenSignal.stopLoss,
        takeProfit: takenSignal.takeProfit,
        timestamp: new Date().toISOString(),
        taken: true
      };
      
      existingTrades.push(tradeData);
      localStorage.setItem('taken_trades', JSON.stringify(existingTrades));
      
      setSignals(prevSignals =>
        prevSignals.map(signal =>
          signal.id === signalId ? { ...signal, taken: true } : signal
        )
      );
      
      window.dispatchEvent(new CustomEvent('tradesUpdated'));
      console.log('Trade marked as taken:', takenSignal);
    } catch (error) {
      console.error('Error marking trade as taken:', error);
    }
  };

  const handleCancelTrade = async (signalId: number) => {
    try {
      // Remove from localStorage
      const existingTrades = JSON.parse(localStorage.getItem('taken_trades') || '[]');
      const updatedTrades = existingTrades.filter((trade: any) => 
        trade.signal_id !== signalId && trade.id !== signalId
      );
      localStorage.setItem('taken_trades', JSON.stringify(updatedTrades));
      
      setSignals(prevSignals =>
        prevSignals.map(signal =>
          signal.id === signalId ? { ...signal, taken: false } : signal
        )
      );
      
      window.dispatchEvent(new CustomEvent('tradesUpdated'));
      console.log('Trade canceled');
    } catch (error) {
      console.error('Error canceling trade:', error);
    }
  };

  if (signals.length === 0) {
    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 text-center">
            <div className="text-white text-lg font-semibold mb-2">No Active Signals</div>
            <div className="text-gray-400">Check back later for new trading signals.</div>
        </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Signals Center</h3>
            <div className="flex items-center space-x-4">
                <select className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>All Signals</option>
                    <option>Active</option>
                    <option>Closed</option>
                </select>
                <select className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Newest First</option>
                    <option>Highest Confidence</option>
                </select>
            </div>
        </div>
      <div className="bg-gray-800 border border-yellow-500/50 rounded-lg p-4 mb-4">
        <p className="text-yellow-300 text-sm">
          <strong>Note:</strong> Your performance analytics are based on the trades you mark as taken. Please click "Mark as Taken" for any trade you execute to ensure accurate tracking.
        </p>
      </div>
      <div className="space-y-4">
        {signals.map((signal) => (
            <div key={signal.id} className={`bg-gray-900 rounded-lg p-6 ${signal.taken ? 'border-2 border-green-500' : ''}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-white">{signal.pair}</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${ signal.type === 'Buy' ? 'bg-green-500 text-white' : 'bg-red-500 text-white' }`}>
                    {signal.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">{signal.status}</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-400">Entry</p>
                    <p className="text-lg font-semibold text-white">{signal.entry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Stop Loss</p>
                    <p className="text-lg font-semibold text-red-500">{signal.stopLoss}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Take Profit</p>
                    <p className="text-lg font-semibold text-green-500">{signal.takeProfit[0]}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">RSR</p>
                    <p className="text-lg font-semibold text-white">{signal.rsr}</p>
                  </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm text-gray-400">Analysis</p>
                    <p className="text-white">{signal.analysis}</p>
                </div>
                <div className="mt-2 flex space-x-2">
                    {signal.ictConcepts.map(concept => (
                        <span key={concept} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">{concept}</span>
                    ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">{signal.timestamp}</p>
                <p className="text-sm text-gray-400">Confidence: <span className="text-lg font-bold text-green-400">{signal.confidence}%</span></p>
                <div className="mt-4">
                    <p className="text-sm text-gray-400">Current P&L</p>
                    <p className="text-2xl font-bold text-green-400">{signal.pips} pips</p>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => handleCopyTrade(signal)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Copy Trade
                  </button>
                  {signal.taken ? (
                    <button 
                      onClick={() => handleCancelTrade(signal.id)}
                      className="px-4 py-2 font-semibold rounded-lg flex items-center bg-red-600 text-white hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Trade
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleMarkAsTaken(signal.id)}
                      className="px-4 py-2 font-semibold rounded-lg flex items-center bg-green-600 text-white hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Taken
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SignalsCenter;
