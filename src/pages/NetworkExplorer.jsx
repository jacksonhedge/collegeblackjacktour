import React, { useState, useCallback } from 'react';
import NetworkVisualization from '../components/network/NetworkVisualization';
import { SleeperService } from '../services/fantasy/sleeperService';
import { NetworkGraphBuilder } from '../utils/networkGraph';
import { motion } from 'framer-motion';

const NetworkExplorer = () => {
  const [username, setUsername] = useState('');
  const [targetUsername, setTargetUsername] = useState('');
  const [graph, setGraph] = useState(null);
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserNetwork = useCallback(async () => {
    if (!username) {
      setError('Please enter a Sleeper username');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Import user's leagues from Sleeper
      const leagues = await SleeperService.importUserLeagues(username);
      
      if (leagues.length === 0) {
        setError('No leagues found for this user');
        setLoading(false);
        return;
      }

      // Build network graph
      const graphBuilder = new NetworkGraphBuilder(leagues);
      const networkGraph = graphBuilder.buildGraph();
      setGraph(networkGraph);

      // If target username is provided, find path
      if (targetUsername) {
        const targetUserData = await SleeperService.getUser(targetUsername);
        if (targetUserData) {
          const targetId = `sleeper_${targetUserData.user_id}`;
          const sourceId = networkGraph.nodes.find(n => 
            n.name.toLowerCase() === username.toLowerCase()
          )?.id;

          if (sourceId && targetId) {
            const networkPath = graphBuilder.findShortestPath(sourceId, targetId);
            setPath(networkPath);
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load network');
    } finally {
      setLoading(false);
    }
  }, [username, targetUsername]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
            Fantasy League Network Explorer
          </h1>
          <p className="text-xl text-gray-300">
            Discover how you're connected to other fantasy players through your leagues
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-8 mb-8"
        >
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Sleeper Username
              </label>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Find Connection To (Optional)
              </label>
              <input
                type="text"
                placeholder="Target username"
                value={targetUsername}
                onChange={(e) => setTargetUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-white"
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={loadUserNetwork}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Explore Network'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </motion.div>

        {path && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/50 rounded-2xl p-8 mb-8"
          >
            <h3 className="text-2xl font-bold mb-4 text-green-400">Connection Found!</h3>
            <p className="text-lg mb-6">
              You are <span className="text-3xl font-bold text-yellow-400">{path.degrees}</span> degree{path.degrees !== 1 ? 's' : ''} away from {targetUsername}
            </p>
            <div className="flex items-center justify-center flex-wrap gap-4">
              {path.path.map((userId, index) => (
                <React.Fragment key={userId}>
                  <div className="bg-gray-800 px-6 py-3 rounded-full border border-yellow-500/50">
                    <span className="font-semibold">
                      {graph?.nodes.find(n => n.id === userId)?.name || userId}
                    </span>
                  </div>
                  {index < path.path.length - 1 && (
                    <span className="text-3xl text-gray-500">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}

        {graph && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-900 rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6">Your Network Visualization</h2>
            <NetworkVisualization
              graph={graph}
              highlightUser={username}
              width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 100, 1200) : 1200}
              height={600}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NetworkExplorer;