// src/services/SleeperService.js

const BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperService {
  static async getUser(username) {
    try {
      const response = await fetch(`${BASE_URL}/user/${username}`);
      if (!response.ok) throw new Error('User not found');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getUserLeagues(userId, season = '2024', sport = 'nfl') {
    try {
      const response = await fetch(`${BASE_URL}/user/${userId}/leagues/${sport}/${season}`);
      if (!response.ok) throw new Error('Failed to fetch leagues');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getLeagueUsers(leagueId) {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}/users`);
      if (!response.ok) throw new Error('Failed to fetch league users');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getLeagueRosters(leagueId) {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}/rosters`);
      if (!response.ok) throw new Error('Failed to fetch league rosters');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getLeagueDetails(leagueId) {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}`);
      if (!response.ok) throw new Error('Failed to fetch league details');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getNFLPlayers(season = '2024') {
    try {
      // Fetch all NFL players for the season
      const response = await fetch(`https://api.sleeper.app/v1/players/nfl`);
      if (!response.ok) throw new Error('Failed to fetch NFL players');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getLeagueMatchups(leagueId, week) {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
      if (!response.ok) throw new Error('Failed to fetch matchups');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async getLeagueTransactions(leagueId, week) {
    try {
      const response = await fetch(`${BASE_URL}/league/${leagueId}/transactions/${week}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static getAvatarUrl(avatarId) {
    return avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : null;
  }

  static getLeagueAvatarUrl(avatarId) {
    return avatarId ? `https://sleepercdn.com/avatars/${avatarId}` : null;
  }

  static getPlayerHeadshotUrl(playerId) {
    return `https://sleepercdn.com/content/nfl/players/${playerId}.jpg`;
  }
}
