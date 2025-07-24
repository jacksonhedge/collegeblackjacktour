export class NetworkGraphBuilder {
  constructor(leagues) {
    this.leagues = leagues;
    this.userMap = new Map();
    this.adjacencyList = new Map();
    this.buildUserMap();
    this.buildAdjacencyList();
  }

  buildUserMap() {
    this.leagues.forEach(league => {
      league.members.forEach(member => {
        if (!this.userMap.has(member.id)) {
          this.userMap.set(member.id, member);
        }
      });
    });
  }

  buildAdjacencyList() {
    this.leagues.forEach(league => {
      const memberIds = league.members.map(m => m.id);
      
      // Connect all members in a league
      for (let i = 0; i < memberIds.length; i++) {
        for (let j = i + 1; j < memberIds.length; j++) {
          this.addConnection(memberIds[i], memberIds[j]);
        }
      }
    });
  }

  addConnection(userId1, userId2) {
    if (!this.adjacencyList.has(userId1)) {
      this.adjacencyList.set(userId1, new Set());
    }
    if (!this.adjacencyList.has(userId2)) {
      this.adjacencyList.set(userId2, new Set());
    }
    
    this.adjacencyList.get(userId1).add(userId2);
    this.adjacencyList.get(userId2).add(userId1);
  }

  buildGraph() {
    const nodes = [];
    const links = [];
    const linkMap = new Map();

    // Create nodes
    this.userMap.forEach((user, userId) => {
      const userLeagues = this.leagues.filter(l => 
        l.members.some(m => m.id === userId)
      );
      
      const platforms = [...new Set(userLeagues.map(l => l.platform))];
      const group = platforms.length === 2 ? 2 : (platforms[0] === 'sleeper' ? 0 : 1);
      
      nodes.push({
        id: userId,
        name: user.name,
        group,
        leagues: userLeagues.map(l => l.id),
        platforms,
        avatar: user.avatar,
        centralityScore: this.calculateCentrality(userId)
      });
    });

    // Create links
    this.adjacencyList.forEach((connections, userId) => {
      connections.forEach(connectedUserId => {
        const linkKey = [userId, connectedUserId].sort().join('-');
        
        if (!linkMap.has(linkKey)) {
          const sharedLeagues = this.getSharedLeagues(userId, connectedUserId);
          
          linkMap.set(linkKey, {
            source: userId,
            target: connectedUserId,
            value: sharedLeagues.length,
            sharedLeagues: sharedLeagues.map(l => ({
              id: l.id,
              name: l.name,
              platform: l.platform
            }))
          });
        }
      });
    });

    links.push(...linkMap.values());

    return { nodes, links };
  }

  getSharedLeagues(userId1, userId2) {
    return this.leagues.filter(league => {
      const hasUser1 = league.members.some(m => m.id === userId1);
      const hasUser2 = league.members.some(m => m.id === userId2);
      return hasUser1 && hasUser2;
    });
  }

  calculateCentrality(userId) {
    // Degree centrality normalized by total possible connections
    const connections = this.adjacencyList.get(userId)?.size || 0;
    const totalUsers = this.userMap.size - 1;
    return totalUsers > 0 ? connections / totalUsers : 0;
  }

  findShortestPath(startUserId, endUserId) {
    if (!this.userMap.has(startUserId) || !this.userMap.has(endUserId)) {
      return null;
    }

    if (startUserId === endUserId) {
      return { path: [startUserId], degrees: 0, connections: [] };
    }

    // BFS to find shortest path
    const queue = [
      { userId: startUserId, path: [startUserId] }
    ];
    const visited = new Set([startUserId]);

    while (queue.length > 0) {
      const { userId, path } = queue.shift();
      const connections = this.adjacencyList.get(userId) || new Set();

      for (const connectedUserId of connections) {
        if (connectedUserId === endUserId) {
          const fullPath = [...path, connectedUserId];
          return this.buildNetworkPath(fullPath);
        }

        if (!visited.has(connectedUserId)) {
          visited.add(connectedUserId);
          queue.push({
            userId: connectedUserId,
            path: [...path, connectedUserId]
          });
        }
      }
    }

    return null; // No path found
  }

  buildNetworkPath(path) {
    const connections = [];
    
    for (let i = 0; i < path.length - 1; i++) {
      const sharedLeagues = this.getSharedLeagues(path[i], path[i + 1]);
      connections.push({
        from: path[i],
        to: path[i + 1],
        sharedLeagues: sharedLeagues.map(l => l.id)
      });
    }

    return {
      path,
      degrees: path.length - 1,
      connections
    };
  }

  // Find all users within N degrees of separation
  findUsersWithinDegrees(userId, maxDegrees) {
    const distances = new Map();
    const queue = [
      { userId, distance: 0 }
    ];
    const visited = new Set([userId]);
    distances.set(userId, 0);

    while (queue.length > 0) {
      const { userId: currentUser, distance } = queue.shift();
      
      if (distance >= maxDegrees) continue;

      const connections = this.adjacencyList.get(currentUser) || new Set();
      
      for (const connectedUserId of connections) {
        if (!visited.has(connectedUserId)) {
          visited.add(connectedUserId);
          distances.set(connectedUserId, distance + 1);
          queue.push({
            userId: connectedUserId,
            distance: distance + 1
          });
        }
      }
    }

    return distances;
  }
}