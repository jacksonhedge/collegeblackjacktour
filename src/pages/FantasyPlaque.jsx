import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, ShoppingCart, X, Trophy, Star } from 'lucide-react';
import { SleeperService } from '../services/sleeper/SleeperService';

const FantasyPlaque = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('2024');
  const [sleeperUsername, setSleeperUsername] = useState('');
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [rosters, setRosters] = useState([]);
  const [selectedRoster, setSelectedRoster] = useState(null);
  const [players, setPlayers] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [playerCardSelections, setPlayerCardSelections] = useState({});

  const PLAQUE_PRICE = 30;
  
  // Different card tiers
  const CARD_TIERS = [
    { id: 'base', name: 'Base Card', price: 5, description: 'Standard player card' },
    { id: 'silver', name: 'Silver Card', price: 10, description: 'Holographic silver finish' },
    { id: 'gold', name: 'Gold Card', price: 15, description: 'Premium gold foil' },
    { id: 'platinum', name: 'Platinum Card', price: 25, description: 'Limited edition platinum' },
    { id: 'autograph', name: 'Autograph Card', price: 50, description: 'Replica autograph edition' }
  ];

  useEffect(() => {
    loadNFLPlayers();
  }, []);

  const loadNFLPlayers = async () => {
    const cachedPlayers = localStorage.getItem('nfl_players_2024');
    if (cachedPlayers) {
      setPlayers(JSON.parse(cachedPlayers));
    } else {
      const playersData = await SleeperService.getNFLPlayers();
      setPlayers(playersData);
      localStorage.setItem('nfl_players_2024', JSON.stringify(playersData));
    }
  };

  const loadUserLeagues = async () => {
    if (!sleeperUsername) return;
    
    setLoading(true);
    try {
      const user = await SleeperService.getUser(sleeperUsername);
      const userLeagues = await SleeperService.getUserLeagues(user.user_id, selectedSeason);
      setLeagues(userLeagues);
    } catch (error) {
      console.error('Error loading leagues:', error);
    }
    setLoading(false);
  };

  const loadLeagueRosters = async (leagueId) => {
    setLoading(true);
    try {
      const [users, rostersData] = await Promise.all([
        SleeperService.getLeagueUsers(leagueId),
        SleeperService.getLeagueRosters(leagueId)
      ]);

      const enrichedRosters = rostersData.map(roster => {
        const user = users.find(u => u.user_id === roster.owner_id);
        return {
          ...roster,
          display_name: user?.display_name || 'Unknown',
          team_name: user?.metadata?.team_name || user?.display_name || 'Unknown'
        };
      });

      setRosters(enrichedRosters);
      setSelectedLeague(leagueId);
    } catch (error) {
      console.error('Error loading rosters:', error);
    }
    setLoading(false);
  };

  const selectRoster = (roster) => {
    setSelectedRoster(roster);
    
    // Add plaque to cart if not already there
    const hasPlaque = cart.some(item => item.type === 'plaque');
    if (!hasPlaque) {
      setCart([...cart, {
        id: 'plaque',
        type: 'plaque',
        name: `Fantasy Plaque - ${roster.team_name} (${selectedSeason})`,
        price: PLAQUE_PRICE,
        quantity: 1
      }]);
    }

    // Initialize player card selections with base tier
    const selections = {};
    roster.players.forEach(playerId => {
      if (players[playerId]) {
        selections[playerId] = 'base';
      }
    });
    setPlayerCardSelections(selections);
    
    // Update cart with base cards initially
    updateCartWithSelections(selections);
  };

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateCartWithSelections = (selections) => {
    const playerCards = [];
    
    Object.entries(selections).forEach(([playerId, tierId]) => {
      if (tierId && players[playerId]) {
        const player = players[playerId];
        const tier = CARD_TIERS.find(t => t.id === tierId);
        
        playerCards.push({
          id: `card-${playerId}-${tierId}`,
          type: 'card',
          playerId,
          tierId,
          name: `${player.first_name} ${player.last_name} - ${tier.name}`,
          team: player.team,
          position: player.position,
          price: tier.price,
          quantity: 1
        });
      }
    });
    
    setCart(prev => {
      const nonCards = prev.filter(item => item.type !== 'card');
      return [...nonCards, ...playerCards];
    });
  };
  
  const updatePlayerCardTier = (playerId, tierId) => {
    const newSelections = {
      ...playerCardSelections,
      [playerId]: tierId
    };
    setPlayerCardSelections(newSelections);
    updateCartWithSelections(newSelections);
  };
  
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    // Stripe integration will go here
    alert('Stripe checkout coming soon! Total: $' + getCartTotal());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#9D8CDB] via-[#B5A7E6] to-[#7B68D8]">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Fantasy Plaque
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{getCartItemCount()}</span>
                <span className="font-bold">${getCartTotal()}</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-white/80 hover:text-white"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Memorialize Your Fantasy Team Forever
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Create a custom plaque featuring your championship fantasy football team. 
            Each plaque includes premium player cards showcasing your winning roster.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 text-white">
            <div className="text-3xl font-bold mb-2">1</div>
            <h3 className="text-xl font-semibold mb-2">Connect Sleeper</h3>
            <p className="text-white/80">Enter your Sleeper username to access your leagues</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 text-white">
            <div className="text-3xl font-bold mb-2">2</div>
            <h3 className="text-xl font-semibold mb-2">Select Your Team</h3>
            <p className="text-white/80">Choose the championship team you want to memorialize</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 text-white">
            <div className="text-3xl font-bold mb-2">3</div>
            <h3 className="text-xl font-semibold mb-2">Order Your Plaque</h3>
            <p className="text-white/80">Customize and order your plaque with player cards</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8">
          {/* Step 1: Connect Sleeper */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Step 1: Connect Your Sleeper Account</h3>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Enter your Sleeper username"
                value={sleeperUsername}
                onChange={(e) => setSleeperUsername(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30"
              />
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <button
                onClick={loadUserLeagues}
                disabled={!sleeperUsername || loading}
                className="px-6 py-2 bg-[#5B3A9B] text-white rounded-lg hover:bg-[#4A2F82] transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load Leagues'}
              </button>
            </div>
          </div>

          {/* Step 2: Select League */}
          {leagues.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Step 2: Select Your League</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leagues.map(league => (
                  <button
                    key={league.league_id}
                    onClick={() => loadLeagueRosters(league.league_id)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedLeague === league.league_id
                        ? 'bg-[#5B3A9B] border-[#5B3A9B] text-white'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <h4 className="font-semibold">{league.name}</h4>
                    <p className="text-sm opacity-80">{league.total_rosters} teams</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Team */}
          {rosters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Step 3: Select Your Team</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rosters.map(roster => (
                  <button
                    key={roster.roster_id}
                    onClick={() => selectRoster(roster)}
                    className={`p-4 rounded-lg border transition-all ${
                      selectedRoster?.roster_id === roster.roster_id
                        ? 'bg-[#5B3A9B] border-[#5B3A9B] text-white'
                        : 'bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30'
                    }`}
                  >
                    <h4 className="font-semibold">{roster.team_name}</h4>
                    <p className="text-sm opacity-80">
                      {roster.settings.wins}-{roster.settings.losses}
                      {roster.settings.ties > 0 && `-${roster.settings.ties}`}
                    </p>
                    {roster.metadata?.streak && (
                      <p className="text-xs mt-1">
                        {roster.metadata.streak > 0 ? `W${roster.metadata.streak}` : `L${Math.abs(roster.metadata.streak)}`}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Team Card Selection */}
          {selectedRoster && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Select Your Player Cards</h3>
              <p className="text-white/80 mb-6">Choose the card tier for each player on your roster. Scroll through your players and select the card type you want for each.</p>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <h4 className="text-xl font-semibold text-white mb-6">{selectedRoster.team_name}</h4>
                
                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                  {selectedRoster.players.map(playerId => {
                    const player = players[playerId];
                    if (!player) return null;
                    
                    return (
                      <div key={playerId} className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* Player Photo and Info */}
                          <div className="flex-shrink-0">
                            <img
                              src={SleeperService.getPlayerHeadshotUrl(playerId)}
                              alt={`${player.first_name} ${player.last_name}`}
                              className="w-20 h-20 rounded-full"
                              onError={(e) => {
                                e.target.src = '/placeholder-player.png';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-white">
                              {player.first_name} {player.last_name}
                            </h5>
                            <p className="text-sm text-white/80 mb-3">
                              {player.position} - {player.team}
                            </p>
                            
                            {/* Card Tier Selection */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                              {CARD_TIERS.map(tier => (
                                <button
                                  key={tier.id}
                                  onClick={() => updatePlayerCardTier(playerId, tier.id)}
                                  className={`p-2 rounded-lg border text-sm transition-all ${
                                    playerCardSelections[playerId] === tier.id
                                      ? 'bg-[#5B3A9B] border-[#5B3A9B] text-white'
                                      : 'bg-white/10 border-white/30 text-white/90 hover:bg-white/20'
                                  }`}
                                >
                                  <div className="font-semibold">{tier.name}</div>
                                  <div className="text-xs opacity-80">${tier.price}</div>
                                </button>
                              ))}
                              <button
                                onClick={() => updatePlayerCardTier(playerId, null)}
                                className={`p-2 rounded-lg border text-sm transition-all ${
                                  !playerCardSelections[playerId]
                                    ? 'bg-red-500/20 border-red-500 text-white'
                                    : 'bg-white/10 border-white/30 text-white/90 hover:bg-white/20'
                                }`}
                              >
                                <div className="font-semibold">No Card</div>
                                <div className="text-xs opacity-80">Skip</div>
                              </button>
                            </div>
                            
                            {/* Tier Description */}
                            {playerCardSelections[playerId] && (
                              <p className="text-xs text-white/60 mt-2">
                                {CARD_TIERS.find(t => t.id === playerCardSelections[playerId])?.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Info */}
        <div className="mt-12 bg-white/20 backdrop-blur-md rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Pricing</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-2">Fantasy Plaque - $30</h4>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Premium wood or acrylic plaque
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Custom engraving with team name and season
                </li>
                <li className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Display slots for all player cards
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2">Player Cards - Starting at $5</h4>
              <div className="space-y-3">
                {CARD_TIERS.map(tier => (
                  <div key={tier.id} className="border-l-4 border-white/30 pl-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{tier.name} - ${tier.price}</h5>
                        <p className="text-sm text-white/70">{tier.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/60 mt-3">All cards include protective sleeves and player stats</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-lg z-50 overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Shopping Cart</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} className="mb-4 pb-4 border-b">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        {item.team && (
                          <p className="text-sm text-gray-600">{item.team}</p>
                        )}
                      </div>
                      <span className="font-semibold">${item.price * item.quantity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total:</span>
                    <span>${getCartTotal()}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full bg-[#5B3A9B] text-white py-3 rounded-lg hover:bg-[#4A2F82] transition-colors font-semibold"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FantasyPlaque;