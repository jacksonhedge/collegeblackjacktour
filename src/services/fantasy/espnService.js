import axios from 'axios';

// ESPN Fantasy API requires authentication and has CORS restrictions
// This would typically be handled through a backend proxy
const ESPN_BASE_URL = 'https://fantasy.espn.com/apis/v3/games/ffl';

export class ESPNService {
  static cookies = '';

  static setCookies(espnS2, swid) {
    this.cookies = `espn_s2=${espnS2}; SWID=${swid}`;
  }

  static async getLeague(leagueId, season = '2024') {
    try {
      const response = await axios.get(
        `${ESPN_BASE_URL}/seasons/${season}/segments/0/leagues/${leagueId}`,
        {
          headers: {
            Cookie: this.cookies
          },
          params: {
            view: ['mTeam', 'mRoster', 'mSettings', 'mStandings']
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching ESPN league:', error);
      throw error;
    }
  }

  static async getLeagueMembers(leagueId, season = '2024') {
    try {
      const response = await axios.get(
        `${ESPN_BASE_URL}/seasons/${season}/segments/0/leagues/${leagueId}`,
        {
          headers: {
            Cookie: this.cookies
          },
          params: {
            view: 'mTeam'
          }
        }
      );
      return response.data.teams || [];
    } catch (error) {
      console.error('Error fetching ESPN league members:', error);
      throw error;
    }
  }

  static async importLeague(leagueId, season = '2024') {
    try {
      const leagueData = await this.getLeague(leagueId, season);
      const teams = leagueData.teams || [];

      const members = teams.map((team, index) => {
        const owner = team.owners?.[0] || {};
        return {
          id: `espn_${owner.id || `team_${index}`}`,
          name: team.name || `Team ${index + 1}`,
          platforms: {
            espn: {
              userId: owner.id || `team_${index}`,
              teamName: team.name
            }
          }
        };
      });

      return {
        id: `espn_${leagueId}`,
        name: leagueData.settings.name,
        platform: 'espn',
        platformLeagueId: leagueId,
        season,
        members,
        createdAt: new Date(),
        sport: 'nfl',
        settings: {
          scoringType: leagueData.settings.scoringType,
          teamCount: leagueData.settings.size,
          playoffTeams: leagueData.settings.playoffTeamCount
        }
      };
    } catch (error) {
      console.error('Error importing ESPN league:', error);
      throw error;
    }
  }

  // Note: ESPN API doesn't easily allow finding all leagues for a user
  // This would typically require web scraping or user manually providing league IDs
  static async getUserLeagues(userId) {
    // This is a placeholder - ESPN doesn't provide easy API access to user's leagues
    console.warn('ESPN API does not provide direct access to user leagues. Users must provide league IDs.');
    return [];
  }
}