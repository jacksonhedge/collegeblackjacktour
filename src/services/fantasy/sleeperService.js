import axios from 'axios';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

export class SleeperService {
  static async getUser(username) {
    const response = await axios.get(`${SLEEPER_BASE_URL}/user/${username}`);
    return response.data;
  }

  static async getUserLeagues(userId, season) {
    const response = await axios.get(
      `${SLEEPER_BASE_URL}/user/${userId}/leagues/nfl/${season}`
    );
    return response.data;
  }

  static async getLeague(leagueId) {
    const response = await axios.get(`${SLEEPER_BASE_URL}/league/${leagueId}`);
    return response.data;
  }

  static async getLeagueUsers(leagueId) {
    const response = await axios.get(`${SLEEPER_BASE_URL}/league/${leagueId}/users`);
    return response.data;
  }

  static async getLeagueRosters(leagueId) {
    const response = await axios.get(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`);
    return response.data;
  }

  static async importUserLeagues(username, season = '2024') {
    try {
      // Get user data
      const userData = await this.getUser(username);
      if (!userData) throw new Error('User not found');

      // Get user's leagues
      const leagues = await this.getUserLeagues(userData.user_id, season);
      
      // Convert to our League format
      const formattedLeagues = await Promise.all(
        leagues.map(async (sleeperLeague) => {
          const leagueUsers = await this.getLeagueUsers(sleeperLeague.league_id);
          
          const members = leagueUsers.map((user) => ({
            id: `sleeper_${user.user_id}`,
            name: user.display_name,
            platforms: {
              sleeper: {
                userId: user.user_id,
                username: user.username
              }
            },
            avatar: user.avatar ? `https://sleepercdn.com/avatars/${user.avatar}` : undefined
          }));

          return {
            id: `sleeper_${sleeperLeague.league_id}`,
            name: sleeperLeague.name,
            platform: 'sleeper',
            platformLeagueId: sleeperLeague.league_id,
            season: sleeperLeague.season,
            members,
            createdAt: new Date(),
            sport: 'nfl',
            settings: {
              scoringType: sleeperLeague.scoring_settings?.scoring_type,
              teamCount: sleeperLeague.total_rosters,
              playoffTeams: sleeperLeague.playoff_teams
            }
          };
        })
      );

      return formattedLeagues;
    } catch (error) {
      console.error('Error importing Sleeper leagues:', error);
      throw error;
    }
  }

  static async findConnectionsBetweenUsers(username1, username2, season = '2024') {
    const user1Data = await this.getUser(username1);
    const user2Data = await this.getUser(username2);

    const user1Leagues = await this.getUserLeagues(user1Data.user_id, season);
    const user2Leagues = await this.getUserLeagues(user2Data.user_id, season);

    const user1LeagueIds = new Set(user1Leagues.map((l) => l.league_id));
    const sharedLeagues = user2Leagues.filter((l) => user1LeagueIds.has(l.league_id));

    return sharedLeagues;
  }
}