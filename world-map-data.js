(function (LG) {
  const nodes = [
    { id: "xia", x: 9, y: 18 },
    { id: "island", x: 8, y: 40 },
    { id: "rice", x: 9, y: 68 },
    { id: "sanctuary", x: 25, y: 25 },
    { id: "blackStreet", x: 25, y: 50 },
    { id: "paradise", x: 25, y: 75 },
    { id: "infernalRealm", x: 49, y: 46 },
    { id: "adventureGuild", x: 74, y: 22 },
    { id: "infernalClub", x: 90, y: 43 },
    { id: "casino", x: 79, y: 69 },
    { id: "goldenHorizon", x: 50, y: 78 },
  ];
  const edges = [
    ["xia", "island", 2],
    ["island", "rice", 3],
    ["xia", "sanctuary", 2],
    ["sanctuary", "blackStreet", 2],
    ["blackStreet", "paradise", 2],
    ["rice", "paradise", 3],
    ["sanctuary", "infernalRealm", 3],
    ["blackStreet", "infernalRealm", 2],
    ["paradise", "goldenHorizon", 3],
    ["infernalRealm", "goldenHorizon", 2],
    ["infernalRealm", "adventureGuild", 2],
    ["adventureGuild", "infernalClub", 2],
    ["adventureGuild", "casino", 2],
    ["infernalClub", "casino", 2],
    ["goldenHorizon", "casino", 3],
  ];
  const byId = Object.fromEntries(nodes.map((item) => [item.id, item]));
  const safeIds = new Set(["xia", "island", "rice"]);

  function weight(left, right) {
    return Number(edges.find(([a, b]) =>
      (a === left && b === right) || (a === right && b === left))?.[2]) || 1;
  }

  function route(from, to) {
    const distance = Object.fromEntries(nodes.map(({ id }) => [id, Infinity]));
    const previous = {};
    const pending = new Set(nodes.map(({ id }) => id));
    distance[from] = 0;
    while (pending.size) {
      const current = [...pending].sort((a, b) => distance[a] - distance[b])[0];
      pending.delete(current);
      if (current === to) break;
      edges.filter(([a, b]) => a === current || b === current)
        .forEach(([a, b, steps]) => {
          const next = a === current ? b : a;
          if (distance[current] + steps < distance[next]) {
            distance[next] = distance[current] + steps;
            previous[next] = current;
          }
        });
    }
    const path = [to];
    while (path[0] !== from && previous[path[0]]) path.unshift(previous[path[0]]);
    return { path, steps: distance[to] };
  }

  function position(trip, now) {
    if (!trip) return byId.xia;
    const path = Array.isArray(trip.path) ? trip.path : route(trip.from, trip.to).path;
    const total = Math.max(1, Number(trip.steps) || 1);
    const duration = Math.max(1,
      Number(trip.arrivesAt) - Number(trip.startedAt));
    let traveled = Math.max(0, Math.min(total,
      ((now - Number(trip.startedAt)) / duration) * total));
    for (let index = 0; index < path.length - 1; index += 1) {
      const from = byId[path[index]], to = byId[path[index + 1]];
      const segment = weight(from.id, to.id);
      if (traveled > segment) {
        traveled -= segment;
        continue;
      }
      const ratio = Math.max(0, Math.min(1, traveled / segment));
      return {
        x: from.x + (to.x - from.x) * ratio,
        y: from.y + (to.y - from.y) * ratio,
      };
    }
    return byId[trip.to] || byId.xia;
  }

  function customRoute(from, waypoints, to) {
    const stops = [...waypoints, to];
    const result = { path: [from], steps: 0 };
    stops.forEach((stop) => {
      const leg = route(result.path[result.path.length - 1], stop);
      result.path.push(...leg.path.slice(1));
      result.steps += leg.steps;
    });
    return result;
  }

  LG.worldMapData = {
    nodes, edges, byId, route, customRoute, weight, position,
    visibleNodes() {
      return LG.contentMode?.strictTeen?.()
        ? nodes.filter((item) => safeIds.has(item.id)) : nodes;
    },
    visibleEdges() {
      return LG.contentMode?.strictTeen?.()
        ? edges.filter(([a, b]) => safeIds.has(a) && safeIds.has(b)) : edges;
    },
    safeArea: (id) => safeIds.has(id),
    area(id) { return LG.worldAreas.get(id); },
    name(id) { return LG.worldAreas.get(id)?.name || "未知区域"; },
  };
})(window.LifeGame);
