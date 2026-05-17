const logger = require('../core/logger');

const FAILURE_THRESHOLD = 3;
const SUCCESS_THRESHOLD = 2;
const TIMEOUT = 10000;

const state = {};

function getState(target) {
    if (!state[target]) {
        state[target] = {
            status: 'closed',
            failures: 0,
            successes: 0,
            lastFailureTime: null
        };
    }
    return state[target];
}

function recordSuccess(target) {
    const s = getState(target);

    if (s.status === 'half-open') {
        s.successes += 1;
        if (s.successes >= SUCCESS_THRESHOLD) {
            s.status = 'closed';
            s.failures = 0;
            s.successes = 0;
            logger.info(`Circuit CLOSED for ${target}`);
        }
    } else {
        s.failures = 0;
    }
}

function recordFailure(target) {
    const s = getState(target);

    s.failures += 1;
    s.lastFailureTime = Date.now();

    if (s.failures >= FAILURE_THRESHOLD) {
        s.status = 'open';
        logger.info(`Circuit OPEN for ${target}`);
    }
}

function isAllowed(target) {
    const s = getState(target);

    if (s.status === 'closed') {
        return true;
    }

    if (s.status === 'open') {
        const now = Date.now();
        if (now - s.lastFailureTime >= TIMEOUT) {
            s.status = 'half-open';
            s.successes = 0;
            logger.info(`Circuit HALF-OPEN for ${target}`);
            return true;
        }
        return false;
    }

    if (s.status === 'half-open') {
        return true;
    }
}

function getAllStates() {
    return state;
}

module.exports = { isAllowed, recordSuccess, recordFailure, getAllStates };
