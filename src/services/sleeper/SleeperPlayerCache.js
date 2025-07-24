// Service to cache NFL player data from Sleeper API
class SleeperPlayerCache {
  constructor() {
    this.players = null;
    this.lastFetched = null;
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    this.storageKey = 'sleeper_nfl_players';
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        if (data.timestamp && Date.now() - data.timestamp < this.cacheExpiry) {
          this.players = data.players;
          this.lastFetched = data.timestamp;
        }
      }
    } catch (error) {
      console.error('Error loading player cache:', error);
    }
  }

  saveToStorage() {
    try {
      const data = {
        players: this.players,
        timestamp: this.lastFetched
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving player cache:', error);
      // Clear cache if storage is full
      localStorage.removeItem(this.storageKey);
    }
  }

  async getPlayers() {
    // Check if cache is valid
    if (this.players && this.lastFetched && Date.now() - this.lastFetched < this.cacheExpiry) {
      return this.players;
    }

    // Fetch fresh data
    try {
      const response = await fetch('https://api.sleeper.app/v1/players/nfl');
      if (!response.ok) throw new Error('Failed to fetch players');
      
      this.players = await response.json();
      this.lastFetched = Date.now();
      this.saveToStorage();
      
      return this.players;
    } catch (error) {
      console.error('Error fetching players:', error);
      // Return cached data if available, even if expired
      if (this.players) {
        return this.players;
      }
      throw error;
    }
  }

  getPlayer(playerId) {
    if (!this.players) return null;
    return this.players[playerId] || null;
  }

  searchPlayers(query, options = {}) {
    if (!this.players || !query) return [];
    
    const {
      position = null,
      team = null,
      limit = 20,
      activeOnly = true
    } = options;

    const searchTerm = query.toLowerCase();
    const results = [];

    for (const [playerId, player] of Object.entries(this.players)) {
      // Skip inactive players if activeOnly
      if (activeOnly && player.status !== 'Active') continue;
      
      // Apply filters
      if (position && player.position !== position) continue;
      if (team && player.team !== team) continue;

      // Search in name
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      if (fullName.includes(searchTerm)) {
        results.push(player);
      }

      if (results.length >= limit) break;
    }

    return results;
  }

  getPlayersByPosition(position) {
    if (!this.players) return [];
    
    return Object.values(this.players).filter(
      player => player.position === position && player.status === 'Active'
    );
  }

  getPlayersByTeam(team) {
    if (!this.players) return [];
    
    return Object.values(this.players).filter(
      player => player.team === team && player.status === 'Active'
    );
  }

  clearCache() {
    this.players = null;
    this.lastFetched = null;
    localStorage.removeItem(this.storageKey);
  }
}

// Export singleton instance
export default new SleeperPlayerCache();