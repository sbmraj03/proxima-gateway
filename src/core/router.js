const routes = [];

function registerRoute(method, path, auth, targets, rateLimit) {
    routes.push({ method, path, auth, targets, rateLimit });
}

function matchRoute(method, url) {
    return routes.find(r => r.method === method && r.path === url);
}

module.exports = { registerRoute, matchRoute };