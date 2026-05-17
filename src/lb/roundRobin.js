const servers = [];
let counter = -1;

function addServer(target) {
    servers.push(target);
}

function getNextServer() {
    if (servers.length === 0) return null;
    counter = (counter + 1) % servers.length;
    return servers[counter];
}

module.exports = { addServer, getNextServer };