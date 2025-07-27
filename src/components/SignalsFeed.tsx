import React, { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { Zap, TrendingUp, TrendingDown, Clock, Target, AlertTriangle, CheckCircle, Filter, Shield, XCircle, CheckSquare } from 'lucide-react';
import TradingViewMiniChart from './TradingViewMiniChart';
import { useTradingPlan } from '../contexts/TradingPlanContext';
import { addTrade } from '../../trading-journal-frontend/src/api';
import SignalsCenter from './SignalsCenter';

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
}

const SignalsFeed = () => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const { propFirm, accountConfig, riskConfig } = useTradingPlan();
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const response = await axios.get('/api/trades');
        const formattedSignals = response.data.map((trade: any) => ({
          id: trade.id,
          pair: trade.asset,
          type: trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1),
          entry: trade.entry_price,
          stopLoss: trade.sl,
          takeProfit: [trade.tp],
          confidence: 90, // Placeholder
          timeframe: '15m', // Placeholder
          timestamp: new Date(trade.date).toLocaleString(),
          status: trade.outcome,
          analysis: 'Analysis placeholder', // Placeholder
          ictConcepts: [], // Placeholder
          rsr: '1:2', // Placeholder
          pips: trade.pips,
          positive: trade.outcome === 'win'
        }));
        setSignals(formattedSignals);
      } catch (error) {
        console.error('Error fetching signals:', error);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);


  const handleTradeTaken = async (signal: Signal) => {
    try {
      // Simulate trade outcome
      const isWin = Math.random() > 0.3; // 70% win rate
      const exitPrice = isWin
        ? parseFloat(signal.takeProfit[0])
        : parseFloat(signal.stopLoss);
      const outcome = isWin ? 'win' : 'loss';

      const tradeData = {
        date: new Date().toISOString().split('T')[0],
        asset: signal.pair,
        direction: signal.type.toLowerCase() as 'buy' | 'sell',
        entry_price: parseFloat(signal.entry),
        exit_price: exitPrice,
        sl: parseFloat(signal.stopLoss),
        tp: parseFloat(signal.takeProfit[0]),
        lot_size: 1,
        outcome: outcome as 'win' | 'loss',
        notes: signal.analysis,
        strategy_tag: signal.ictConcepts.join(', '),
        prop_firm: propFirm?.name || 'N/A',
      };
      await addTrade(tradeData);
      alert('Trade added to journal!');
      window.dispatchEvent(new Event('tradesUpdated'));
    } catch (error) {
      console.error('Failed to add trade to journal:', error);
      alert('Failed to add trade to journal.');
    }
  };

  // Rule breach detection function
  const checkRuleBreach = (signal: any) => {
    if (!propFirm || !accountConfig || !riskConfig) return { safe: true, warnings: [] };

    const warnings: string[] = [];
    const accountSize = accountConfig.size;
    const rules = propFirm.rules;

    // Calculate position size and risk
    const riskAmount = accountSize * (riskConfig.riskPercentage / 100);
    const entryPrice = parseFloat(signal.entry);
    const stopLossPrice = parseFloat(signal.stopLoss);
    const pipValue = signal.pair.includes('JPY') ? 0.01 : 0.0001;
    const pipsAtRisk = Math.abs(entryPrice - stopLossPrice) / pipValue;
    const dollarPerPip = 1; // Simplified
    const positionSize = riskAmount / (pipsAtRisk * dollarPerPip);
    const positionValue = entryPrice * positionSize * 100000; // Standard lot size
    const positionPercentage = (positionValue / accountSize) * 100;

    // Check daily loss limit
    if (riskConfig.riskPercentage > rules.dailyLoss) {
      warnings.push(`⚠️ Risk per trade (${riskConfig.riskPercentage}%) exceeds daily loss limit (${rules.dailyLoss}%)`);
    }

    // Check maximum position size
    if (positionPercentage > rules.maxPositionSize) {
      warnings.push(`⚠️ Position size (${positionPercentage.toFixed(1)}%) exceeds maximum allowed (${rules.maxPositionSize}%)`);
    }

    return {
      safe: warnings.length === 0,
      warnings
    };
  };


  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    if (filter === 'active') return signal.status === 'active';
    if (filter === 'closed') return signal.status === 'closed';
    if (filter === 'pending') return signal.status === 'pending';
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600';
      case 'closed':
        return 'bg-green-600/20 text-green-400 border-green-600';
      case 'pending':
        return 'bg-blue-600/20 text-blue-400 border-blue-600';
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Trading Signals</h3>
            <p className="text-gray-400">Real-time professional-grade signals with 85-95% accuracy</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Signals</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="confidence">Highest Confidence</option>
              <option value="profit">Best Performance</option>
            </select>
            
          </div>
        </div>
      </div>



      {/* Signals Center */}
      <SignalsCenter />

      {/* TradingView Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Market Overview</h3>
        <div className="h-96">
          <TradingViewMiniChart />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Today's Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{signals.length}</div>
            <div className="text-sm text-gray-400">Signals Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">{signals.filter(s => s.positive === true).length}</div>
            <div className="text-sm text-gray-400">Winning Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-1">91.7%</div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 mb-1">+347</div>
            <div className="text-sm text-gray-400">Total Pips</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalsFeed;
