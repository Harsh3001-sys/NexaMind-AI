const metrics = {
    requests: {
        total: 0,
        successful: 0,
        failed: 0
    },

    backends: {},

    failures: {
        request: 0,
        server: 0,
        healthCheck: 0
    },

    circuitBreaker: {
        opens: 0,
        halfOpens: 0,
        closes: 0
    },

    failovers: 0,

    latency: []
};


// ===============================
// REQUEST METRICS
// ===============================

const recordRequest = (backend) => {

    metrics.requests.total++;

    if (!metrics.backends[backend]) {

        metrics.backends[backend] = {
            requests: 0,
            successful: 0,
            failed: 0
        };
    }

    metrics.backends[backend].requests++;
};


const recordRequestSuccess = (backend) => {

    metrics.requests.successful++;

    metrics.backends[backend].successful++;
};


const recordRequestFailure = (backend) => {

    metrics.requests.failed++;

    metrics.backends[backend].failed++;
};


// ===============================
// FAILURE METRICS
// ===============================

const recordRequestError = () => {

    metrics.failures.request++;
};


const recordServerFailure = () => {

    metrics.failures.server++;
};


const recordHealthCheckFailure = () => {

    metrics.failures.healthCheck++;
};


// ===============================
// CIRCUIT BREAKER METRICS
// ===============================

const recordCircuitOpen = () => {

    metrics.circuitBreaker.opens++;
};


const recordCircuitHalfOpen = () => {

    metrics.circuitBreaker.halfOpens++;
};


const recordCircuitClose = () => {

    metrics.circuitBreaker.closes++;
};


// ===============================
// FAILOVER
// ===============================

const recordFailover = () => {

    metrics.failovers++;
};


// ===============================
// LATENCY
// ===============================

const recordLatency = (latency) => {

    metrics.latency.push(latency);

    // Keep only the latest 10,000
    // latency measurements.

    if (metrics.latency.length > 10000) {

        metrics.latency.shift();

    }
};


// ===============================
// CALCULATE LATENCY
// ===============================

const calculatePercentile = (percentile) => {

    if (metrics.latency.length === 0) {
        return 0;
    }

    const sorted = [...metrics.latency]
        .sort((a, b) => a - b);

    const index =
        Math.ceil(
            (percentile / 100) *
            sorted.length
        ) - 1;

    return sorted[index];
};


const getAverageLatency = () => {

    if (metrics.latency.length === 0) {
        return 0;
    }

    const total =
        metrics.latency.reduce(
            (sum, value) => sum + value,
            0
        );

    return total / metrics.latency.length;
};


// ===============================
// GET METRICS
// ===============================

const getMetrics = () => {

    return {

        requests: {
            total: metrics.requests.total,

            successful:
                metrics.requests.successful,

            failed:
                metrics.requests.failed,

            successRate:
                metrics.requests.total === 0
                    ? 0
                    :
                    (
                        metrics.requests.successful /
                        metrics.requests.total
                    ) * 100
        },

        backends:
            metrics.backends,

        failures:
            metrics.failures,

        circuitBreaker:
            metrics.circuitBreaker,

        failovers:
            metrics.failovers,

        latency: {

            average:
                getAverageLatency(),

            p50:
                calculatePercentile(50),

            p95:
                calculatePercentile(95),

            p99:
                calculatePercentile(99),

            samples:
                metrics.latency.length
        }
    };
};


export {
    recordRequest,
    recordRequestSuccess,
    recordRequestFailure,

    recordRequestError,
    recordServerFailure,
    recordHealthCheckFailure,

    recordCircuitOpen,
    recordCircuitHalfOpen,
    recordCircuitClose,

    recordFailover,

    recordLatency,

    getMetrics
};