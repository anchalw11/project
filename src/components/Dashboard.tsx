import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  DollarSign,
  Building,
  ChevronDown
} from 'lucide-react';
import TradingJournalEntry from './TradingJournalEntry';
import { useUser } from '../contexts/UserContext';

interface JournalEntry {
  id: string;
  dateTime: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  direction: 'long' | 'short';
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  rMultiple: number;
  preMarketConditions: string;
  keyLevels: string;
  marketSentiment: string;
  relevantNews: string;
  technicalSetup: string;
  strategyUsed: string;
  timeFrame: string;
  tradeManagement: string;
  emotionalState: string;
  planDeviations: string;
  entryTiming: 'excellent' | 'good' | 'average' | 'poor';
  exitTiming: 'excellent' | 'good' | 'average' | 'poor';
  profitLoss: number;
  profitLossPercentage: number;
  winRate: number;
  riskManagementScore: number;
  ruleAdherence: number;
  whatWentWell: string;
  mistakesMade: string;
  improvementAreas: string;
  actionItems: string;
  tradingStrategy: string;
  marketConditions: string;
  emotionalTags: string[];
  setupQuality: 'A' | 'B' | 'C';
  createdAt: string;
  updatedAt: string;
}

const TradingJournalDashboard: React.FC = () => {
  const { user } = useUser();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [filterTimeFrame, setFilterTimeFrame] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('account1');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  // Mock accounts data - in real app this would come from MultiAccountTracker
  const mockAccounts = [
    {
      id: 'account1',
      propFirm: 'FTMO',
      accountSize: 100000,
      phase: 'Challenge',
      status: 'active'
    },
    {
      id: 'account2',
      propFirm: 'MyForexFunds',
      accountSize: 200000,
      phase: 'Funded',
      status: 'passed'
    },
    {
      id: 'account3',
      propFirm: 'The5%ers',
      accountSize: 50000,
      phase: 'Verification',
      status: 'active'
    }
  ];

  // Check if user has access to multi-account tracker
  const hasMultiAccountAccess = user?.membershipTier === 'professional' || 
                                user?.membershipTier === 'elite' || 
                                user?.membershipTier === 'enterprise';

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem(`trading_journal_entries_${selectedAccount}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    } else {
      setEntries([]);
    }
  }, [selectedAccount]);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem(`trading_journal_entries_${selectedAccount}`, JSON.stringify(entries));
  }, [entries, selectedAccount]);

  const handleSaveEntry = (entry: JournalEntry) => {
    if (editingEntry) {
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } else {
      setEntries(prev => [entry, ...prev]);
    }
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setShowEntryModal(true);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tradingStrategy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStrategy = !filterStrategy || entry.tradingStrategy === filterStrategy;
    const matchesTimeFrame = !filterTimeFrame || entry.timeFrame === filterTimeFrame;
    
    return matchesSearch && matchesStrategy && matchesTimeFrame;
  });

  // Calculate statistics
  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => e.profitLoss > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = entries.reduce((sum, e) => sum + e.profitLoss, 0);
  const avgRMultiple = totalTrades > 0 ? entries.reduce((sum, e) => sum + e.rMultiple, 0) / totalTrades : 0;

  const stats = [
    {
      label: 'Total Trades',
      value: totalTrades.toString(),
      icon: <BookOpen className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      label: 'Win Rate',
      value: `${winRate.toFixed(1)}%`,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      label: 'Total P&L',
      value: `$${totalPnL.toFixed(2)}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: totalPnL >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      label: 'Avg R-Multiple',
      value: `${avgRMultiple.toFixed(2)}R`,
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'A': return 'text-green-400 bg-green-600/20';
      case 'B': return 'text-yellow-400 bg-yellow-600/20';
      case 'C': return 'text-red-400 bg-red-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const getTimingColor = (timing: string) => {
    switch (timing) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'average': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Switcher - Only for users with multi-account access */}
      {hasMultiAccountAccess && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Account Selection</h3>
              <p className="text-gray-400 text-sm">Choose which prop firm account to view journal entries for</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center space-x-3 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg transition-colors border border-gray-600"
              >
                <Building className="w-5 h-5 text-blue-400" />
                <div className="text-left">
                  <div className="text-white font-medium">
                    {mockAccounts.find(acc => acc.id === selectedAccount)?.propFirm}
                  </div>
                  <div className="text-xs text-gray-400">
                    ${mockAccounts.find(acc => acc.id === selectedAccount)?.accountSize.toLocaleString()} • 
                    {mockAccounts.find(acc => acc.id === selectedAccount)?.phase}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
                  <div className="p-2">
                    {mockAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account.id);
                          setShowAccountDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          selectedAccount === account.id 
                            ? 'bg-blue-600/20 border border-blue-600' 
                            : 'hover:bg-gray-700'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{account.propFirm}</div>
                          <div className="text-xs text-gray-400">
                            ${account.accountSize.toLocaleString()} • {account.phase}
                          </div>
                        </div>
                              setShowAccountDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                              selectedAccount === account.id 
                                ? 'bg-blue-600/20 border border-blue-600' 
                                : 'hover:bg-gray-700'
                            }`}
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Building className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-medium">{account.propFirm}</div>
                              <div className="text-xs text-gray-400">
                                ${account.accountSize.toLocaleString()} • {account.phase}
                              </div>
                              <div className="text-xs text-blue-400">
                                ${account.currentBalance.toLocaleString()} current balance
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              account.status === 'active' ? 'bg-blue-600/20 text-blue-400' :
                              account.status === 'passed' ? 'bg-green-600/20 text-green-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {account.status}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-700 p-3">
                        <button
                          onClick={() => {
                            setActiveTab('accounts');
                            setShowAccountDropdown(false);
                          }}
                          className="w-full text-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                        >
                          Manage All Accounts →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Trading Journal</h2>
          <p className="text-gray-400">Detailed analysis and tracking of your trading performance</p>
        </div>
        <button
          onClick={() => {
            setEditingEntry(null);
            setShowEntryModal(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={stat.color}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by symbol or strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStrategy}
            onChange={(e) => setFilterStrategy(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Strategies</option>
            <option value="Breakout">Breakout</option>
            <option value="Reversal">Reversal</option>
            <option value="Trend Following">Trend Following</option>
            <option value="Scalping">Scalping</option>
            <option value="ICT/SMC">ICT/SMC</option>
          </select>
          <select
            value={filterTimeFrame}
            onChange={(e) => setFilterTimeFrame(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Timeframes</option>
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterStrategy('');
              setFilterTimeFrame('');
            }}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Journal Entries ({filteredEntries.length})
        </h3>
        
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-400 text-lg font-medium mb-2">No journal entries yet</div>
            <div className="text-sm text-gray-500 mb-4">Start documenting your trades for better performance analysis</div>
            <button
              onClick={() => setShowEntryModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div key={entry.id} className="bg-gray-700/50 rounded-lg p-6 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {entry.direction === 'long' ? 
                        <TrendingUp className="w-5 h-5 text-green-400" /> : 
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      }
                      <span className="text-xl font-bold text-white">{entry.symbol}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQualityColor(entry.setupQuality)}`}>
                      Grade {entry.setupQuality}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(entry.dateTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedEntry(entry)}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                  <div>
                    <div className="text-gray-400 text-xs">Entry</div>
                    <div className="text-white font-semibold">{entry.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Exit</div>
                    <div className="text-white font-semibold">{entry.exitPrice}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">P&L</div>
                    <div className={`font-semibold ${entry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${entry.profitLoss.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">R-Multiple</div>
                    <div className={`font-semibold ${entry.rMultiple >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {entry.rMultiple.toFixed(2)}R
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Strategy</div>
                    <div className="text-white text-sm">{entry.tradingStrategy || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Timeframe</div>
                    <div className="text-white text-sm">{entry.timeFrame}</div>
                  </div>
                </div>

                {entry.emotionalTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.emotionalTags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entry Modal */}
      <TradingJournalEntry
        isOpen={showEntryModal}
        onClose={() => {
          setShowEntryModal(false);
          setEditingEntry(null);
        }}
        onSave={handleSaveEntry}
        editEntry={editingEntry}
      />

      {/* View Entry Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {selectedEntry.symbol} - {new Date(selectedEntry.dateTime).toLocaleDateString()}
              </h2>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Trade Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Direction</div>
                  <div className={`font-semibold ${selectedEntry.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedEntry.direction.toUpperCase()}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">P&L</div>
                  <div className={`font-semibold ${selectedEntry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${selectedEntry.profitLoss.toFixed(2)}
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">R-Multiple</div>
                  <div className={`font-semibold ${selectedEntry.rMultiple >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedEntry.rMultiple.toFixed(2)}R
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-sm">Setup Quality</div>
                  <div className={`font-semibold ${getQualityColor(selectedEntry.setupQuality).split(' ')[0]}`}>
                    Grade {selectedEntry.setupQuality}
                  </div>
                </div>
              </div>

              {/* Analysis */}
              {selectedEntry.technicalSetup && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Technical Setup</h4>
                  <p className="text-gray-300">{selectedEntry.technicalSetup}</p>
                </div>
              )}

              {/* Learning */}
              {selectedEntry.whatWentWell && (
                <div>
                  <h4 className="text-green-400 font-semibold mb-2">What Went Well</h4>
                  <p className="text-gray-300">{selectedEntry.whatWentWell}</p>
                </div>
              )}

              {selectedEntry.mistakesMade && (
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">Mistakes & Lessons</h4>
                  <p className="text-gray-300">{selectedEntry.mistakesMade}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingJournalDashboard;