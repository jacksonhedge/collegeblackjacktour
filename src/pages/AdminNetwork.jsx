import React, { useState, useEffect } from 'react';
import NetworkVisualization from '../components/network/NetworkVisualization';
import { SleeperService } from '../services/fantasy/sleeperService';
import { ESPNService } from '../services/fantasy/espnService';
import { NetworkGraphBuilder } from '../utils/networkGraph';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Navigate } from 'react-router-dom';

const AdminNetwork = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const [leagues, setLeagues] = useState([]);
  const [graph, setGraph] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [importUsername, setImportUsername] = useState('');
  const [espnLeagueId, setEspnLeagueId] = useState('');
  const [espnCookies, setEspnCookies] = useState({ espnS2: '', swid: '' });

  // Redirect if not authenticated
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    if (leagues.length > 0) {
      updateGraph();
    }
  }, [leagues]);

  const updateGraph = () => {
    const graphBuilder = new NetworkGraphBuilder(leagues);
    const networkGraph = graphBuilder.buildGraph();
    setGraph(networkGraph);
    calculateStats(networkGraph, leagues);
  };

  const calculateStats = (graph, leagues) => {
    const sleeperUsers = graph.nodes.filter(n => n.platforms.includes('sleeper')).length;
    const espnUsers = graph.nodes.filter(n => n.platforms.includes('espn')).length;
    const crossPlatformUsers = graph.nodes.filter(n => n.platforms.length > 1).length;
    
    const connectionCounts = graph.nodes.map(node => ({
      user: { id: node.id, name: node.name },
      connections: graph.links.filter(l => l.source === node.id || l.target === node.id).length
    }));

    const avgConnections = connectionCounts.reduce((sum, item) => sum + item.connections, 0) / graph.nodes.length;
    const topConnected = connectionCounts.sort((a, b) => b.connections - a.connections).slice(0, 5);

    setStats({
      totalUsers: graph.nodes.length,
      totalLeagues: leagues.length,
      sleeperUsers,
      espnUsers,
      crossPlatformUsers,
      avgConnectionsPerUser: avgConnections,
      mostConnectedUsers: topConnected
    });
  };

  const importSleeperLeagues = async () => {
    if (!importUsername) return;
    
    setLoading(true);
    try {
      const sleeperLeagues = await SleeperService.importUserLeagues(importUsername);
      setLeagues([...leagues, ...sleeperLeagues]);
      setImportUsername('');
    } catch (error) {
      console.error('Failed to import Sleeper leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const importESPNLeague = async () => {
    if (!espnLeagueId || !espnCookies.espnS2 || !espnCookies.swid) return;
    
    setLoading(true);
    try {
      ESPNService.setCookies(espnCookies.espnS2, espnCookies.swid);
      const espnLeague = await ESPNService.importLeague(espnLeagueId);
      setLeagues([...leagues, espnLeague]);
      setEspnLeagueId('');
    } catch (error) {
      console.error('Failed to import ESPN league:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Fantasy Network Admin Dashboard</h1>
        
        {/* Import Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Import Leagues</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sleeper Import */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Sleeper Import</h3>
              <input
                type="text"
                placeholder="Sleeper username"
                value={importUsername}
                onChange={(e) => setImportUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button 
                onClick={importSleeperLeagues} 
                disabled={loading}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:bg-gray-400"
              >
                Import Sleeper Leagues
              </button>
            </div>

            {/* ESPN Import */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">ESPN Import</h3>
              <input
                type="text"
                placeholder="ESPN League ID"
                value={espnLeagueId}
                onChange={(e) => setEspnLeagueId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <input
                type="text"
                placeholder="espn_s2 cookie"
                value={espnCookies.espnS2}
                onChange={(e) => setEspnCookies({ ...espnCookies, espnS2: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2"
              />
              <input
                type="text"
                placeholder="SWID cookie"
                value={espnCookies.swid}
                onChange={(e) => setEspnCookies({ ...espnCookies, swid: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button 
                onClick={importESPNLeague} 
                disabled={loading}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
              >
                Import ESPN League
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Network Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600">{stats.totalLeagues}</div>
                <div className="text-sm text-gray-600">Total Leagues</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-yellow-600">{stats.sleeperUsers}</div>
                <div className="text-sm text-gray-600">Sleeper Users</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-600">{stats.espnUsers}</div>
                <div className="text-sm text-gray-600">ESPN Users</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.crossPlatformUsers}</div>
                <div className="text-sm text-gray-600">Cross-Platform</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-gray-600">{stats.avgConnectionsPerUser.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Connections</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Most Connected Users</h3>
              <div className="space-y-2">
                {stats.mostConnectedUsers.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium">{item.user.name}</span>
                    <span className="text-sm text-gray-600">{item.connections} connections</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Network Visualization */}
        {graph && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-6">Network Visualization</h2>
            <NetworkVisualization
              graph={graph}
              onNodeClick={(node) => setSelectedUser(node.id)}
              width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 100, 1200) : 1200}
              height={600}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNetwork;