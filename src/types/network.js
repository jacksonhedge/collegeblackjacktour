// Type definitions for the fantasy network feature
// Using JSDoc comments for type safety in regular JavaScript

/**
 * @typedef {'sleeper' | 'espn'} LeaguePlatform
 */

/**
 * @typedef {Object} NetworkUser
 * @property {string} id
 * @property {string} name
 * @property {string} [email]
 * @property {string} [avatar]
 * @property {Object} platforms
 * @property {Object} [platforms.sleeper]
 * @property {string} [platforms.sleeper.userId]
 * @property {string} [platforms.sleeper.username]
 * @property {Object} [platforms.espn]
 * @property {string} [platforms.espn.userId]
 * @property {string} [platforms.espn.teamName]
 */

/**
 * @typedef {Object} League
 * @property {string} id
 * @property {string} name
 * @property {LeaguePlatform} platform
 * @property {string} platformLeagueId
 * @property {string} season
 * @property {NetworkUser[]} members
 * @property {Date} createdAt
 * @property {'nfl' | 'nba' | 'mlb'} sport
 * @property {Object} [settings]
 * @property {string} [settings.scoringType]
 * @property {number} [settings.teamCount]
 * @property {number} [settings.playoffTeams]
 */

/**
 * @typedef {Object} NetworkNode
 * @property {string} id
 * @property {string} name
 * @property {number} group - Platform group (0: sleeper, 1: espn, 2: both)
 * @property {string[]} leagues
 * @property {LeaguePlatform[]} platforms
 * @property {string} [avatar]
 * @property {number} [centralityScore]
 */

/**
 * @typedef {Object} NetworkLink
 * @property {string} source
 * @property {string} target
 * @property {number} value - Strength of connection (number of shared leagues)
 * @property {Array<{id: string, name: string, platform: LeaguePlatform}>} sharedLeagues
 */

/**
 * @typedef {Object} NetworkGraph
 * @property {NetworkNode[]} nodes
 * @property {NetworkLink[]} links
 */

/**
 * @typedef {Object} NetworkPath
 * @property {string[]} path - User IDs in order
 * @property {number} degrees
 * @property {Array<{from: string, to: string, sharedLeagues: string[]}>} connections
 */

export default {};