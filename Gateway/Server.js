import express from "express";
import axios from "axios";
import dns from "dns";
import { createClient } from "redis";

import {
    recordRequest,
    recordRequestSuccess,
    recordRequestFailure,
    recordLatency,
    getMetrics,
    recordCircuitOpen,
    recordCircuitHalfOpen,
    recordCircuitClose,
    recordHealthCheckFailure,
    recordFailover
} from "./metrics.js";

const app = express();

const PORT = 4000;

app.use(express.json());


// ===============================
// CORS
// ===============================

app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "http://localhost:5173"
    );

    res.header(
        "Access-Control-Allow-Credentials",
        "true"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

const redisClient = createClient({
    url: "redis://redis:6379"
});

redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
});

await redisClient.connect();

console.log("🟢 Gateway connected to Redis");


// ===============================
// BACKEND SERVERS
// ===============================

let BACKENDS = [];

const BACKEND_SERVICE = "backend";
const BACKEND_PORT = 5000;

const discoverBackends = async () => {
    try {
        const addresses = await dns.promises.resolve4(
            BACKEND_SERVICE
        );

        return addresses.map(
            (ip) => `http://${ip}:${BACKEND_PORT}`
        );

    } catch (error) {
        console.error(
            "❌ Backend discovery failed:",
            error.message
        );

        return [];
    }
};


let healthyBackends = [];

let currentBackend = 0;

const circuitState = {};

// BACKENDS.forEach((backend) => {
//     circuitState[backend] = {
//         state: "CLOSED",
//         failures: 0,
//         openedAt: null,
//         testInProgress: false
//     };
// });

const failureThreshold = 3;
const resetTimeout = 10000; // 10 seconds

function recordFailure(backend) {

    const circuit =
        circuitState[backend];

    circuit.testInProgress = false;

    // If the test request failed,
    // immediately reopen the circuit.
    if (
        circuit.state === "HALF_OPEN"
    ) {

        circuit.state = "OPEN";

        circuit.openedAt = Date.now();
        recordCircuitHalfOpen();

        console.log(
            `🔴 HALF-OPEN test failed. Circuit OPEN for ${backend}`
        );

        return;
    }

    circuit.failures++;

    console.log(
        `⚠️ ${backend} failure ${circuit.failures}/${failureThreshold}`
    );

    if (
        circuit.failures >=
        failureThreshold
    ) {

        circuit.state = "OPEN";

        circuit.openedAt = Date.now();
        recordCircuitOpen();

        console.log(
            `🔴 Circuit OPEN for ${backend}`
        );
    }
}

function recordSuccess(backend) {

    const circuit =
        circuitState[backend];

    circuit.failures = 0;

    if (
        circuit.state === "HALF_OPEN"
    ) {

        circuit.state = "CLOSED";

        circuit.openedAt = null;

        circuit.testInProgress = false;
        recordCircuitClose();

        console.log(
            `🟢 Circuit CLOSED for ${backend}`
        );
    }
}

function isCircuitOpen(backend) {

    const circuit = circuitState[backend];

    // Normal state
    if (circuit.state === "CLOSED") {
        return false;
    }

    // Circuit is OPEN
    if (circuit.state === "OPEN") {

        const elapsed =
            Date.now() - circuit.openedAt;

        // Still waiting for reset timeout
        if (elapsed < resetTimeout) {
            return true;
        }

        // Timeout completed
        circuit.state = "HALF_OPEN";

        circuit.testInProgress = false;

        console.log(
            `🟡 Circuit HALF-OPEN for ${backend}`
        );
    }

    // HALF_OPEN
    if (circuit.state === "HALF_OPEN") {

        // Another test request is already running
        if (circuit.testInProgress) {

            return true;
        }

        // Allow exactly ONE test request
        circuit.testInProgress = true;

        console.log(
            `🧪 Allowing test request to ${backend}`
        );

        return false;
    }

    return true;
}

app.get("/circuit-status", (req, res) => {

    res.json({
        circuits: circuitState,
        healthyBackends,
        totalBackends: BACKENDS.length,
        healthyCount: healthyBackends.length
    });

});


// ===============================
// SELECT NEXT BACKEND
// ===============================


const updateHealthyPool = async () => {
    const previousHealthyBackends = [...healthyBackends];
    const newHealthyBackends = [];

    for (const backend of BACKENDS) {

        // If circuit is OPEN, check whether
        // the reset timeout has expired.
        if (isCircuitOpen(backend)) {

            console.log(
                `🔴 Skipping health check for ${backend} - circuit OPEN`
            );

            continue;
        }

        try {

            const response =
                await axios.get(
                    `${backend}/health`,
                    {
                        timeout: 1500
                    }
                );

            if (response.status === 200) {

                // If this was a HALF_OPEN test,
                // successful health check closes it.
                if (
                    circuitState[backend].state ===
                    "HALF_OPEN"
                ) {

                    recordSuccess(backend);
                }

                newHealthyBackends.push(
                    backend
                );
            }

        } catch (error) {

            console.log(
                `❌ Backend unhealthy: ${backend}`
            );
            recordHealthCheckFailure();
            // Health check itself failed,
            // so tell the circuit breaker.
            recordFailure(backend);
        }
    }
    const failedBackend =
        previousHealthyBackends.some(
            (backend) =>
                BACKENDS.includes(backend) &&
                !newHealthyBackends.includes(backend)
        );

    const anotherBackendAvailable =
        newHealthyBackends.length > 0;

    if (
        failedBackend &&
        anotherBackendAvailable
    ) {

        recordFailover();

        console.log(
            "🔄 Failover detected. Traffic redirected to healthy backend(s)."
        );
    }

    healthyBackends =
        newHealthyBackends;

    if (
        healthyBackends.length === 0
    ) {

        currentBackend = 0;

    } else if (
        currentBackend >=
        healthyBackends.length
    ) {

        currentBackend = 0;
    }

    console.log(
        "🟢 Healthy backend pool:",
        healthyBackends
    );
};


const getNextHealthyBackend = () => {

    if (healthyBackends.length === 0) {
        throw new Error(
            "No healthy backend available"
        );
    }

    for (
        let i = 0;
        i < healthyBackends.length;
        i++
    ) {

        const backend =
            healthyBackends[currentBackend];

        currentBackend =
            (currentBackend + 1) %
            healthyBackends.length;

        if (!isCircuitOpen(backend)) {
            return backend;
        }
    }

    throw new Error(
        "No backend available due to open circuits"
    );
};

// ===============================
// GENERIC PROXY
// ===============================

const proxyRequest = async (req, res) => {

    let backend;
    const startTime = Date.now();



    try {
        backend = getNextHealthyBackend();
        recordRequest(backend);
        const metrics = getMetrics();

await redisClient.set(
    "autoscale:requestRate",
    metrics.requests.requestRate,
    {
        EX: 15
    }
);
        console.log(
            `Routing ${req.method} ${req.originalUrl} → ${backend}`
        );
        const response = await axios({
            method: req.method,

            url:
                `${backend}${req.originalUrl}`,

            data: req.body,

            headers: {
                authorization:
                    req.headers.authorization,

                cookie:
                    req.headers.cookie,

                "content-type":
                    req.headers["content-type"]
            },

            maxRedirects: 0,

            validateStatus:
                () => true
        });
        const latency =
            Date.now() - startTime;

        recordLatency(latency);

        if (response.status >= 500) {

            recordFailure(backend);
            recordRequestFailure(backend);

        } else {

            recordSuccess(backend);
            recordRequestSuccess(backend);
        }


        // ===============================
        // FORWARD REDIRECTS
        // ===============================

        if (response.headers.location) {

            res.redirect(
                response.status,
                response.headers.location
            );

            return;
        }


        // ===============================
        // FORWARD COOKIES
        // ===============================

        if (
            response.headers["set-cookie"]
        ) {

            res.setHeader(
                "set-cookie",
                response.headers["set-cookie"]
            );
        }


        // ===============================
        // SEND RESPONSE
        // ===============================

        res.status(
            response.status
        ).send(response.data);

    } catch (error) {

        console.error(
            "Proxy error:",
            error.message
        );

        // Backend connection/network failure
        if (backend) {
            recordFailure(backend);
            recordRequestFailure(backend);
        }

        res.status(502).json({
            success: false,
            message:
                "Backend server unavailable"
        });
    }
};


// ===============================
// HEALTH CHECK
// ===============================

app.get("/health", async (req, res) => {
    res.json({
        gateway: "healthy",
        healthyBackends,
        totalBackends: BACKENDS.length,
        healthyCount: healthyBackends.length
    });
});


// ===============================
// TEST ROUTING
// ===============================
// IMPORTANT:
// This MUST come BEFORE app.use("/api")
// because /api/test-routing would otherwise
// be caught by the generic proxy.

app.get(
    "/api/test-routing",
    async (req, res) => {

        try {

            const backend =
                getNextHealthyBackend();

            console.log(
                `Routing test request to ${backend}`
            );

            const response =
                await axios.get(
                    `${backend}/health`
                );

            res.json({

                gateway: "NexaFlow",

                routedTo:
                    backend,

                healthyPool:
                    healthyBackends,

                backendResponse:
                    response.data

            });

        } catch (error) {

            res.status(503).json({

                success: false,

                message:
                    "No healthy backend available"

            });
        }
    }
);

app.get("/metrics", async (req, res) => {

    const metrics = getMetrics();

    await redisClient.set(
        "autoscale:requestRate",
        metrics.requests.requestRate,
        {
            EX: 15
        }
    );

    res.json(metrics);

});


// ===============================
// API PROXY
// ===============================

app.use(
    "/api",
    async (req, res) => {

        await proxyRequest(
            req,
            res
        );
    }
);


// ===============================
// AUTH PROXY
// ===============================

app.use(
    "/auth",
    async (req, res) => {

        await proxyRequest(
            req,
            res
        );
    }
);


// ===============================
// START SERVER
// ===============================

// ===============================
// START SERVER
// ===============================

const startGateway = async () => {

    BACKENDS = await discoverBackends();

    console.log(
        "🔍 Initial backend discovery:",
        BACKENDS
    );

    BACKENDS.forEach((backend) => {

        circuitState[backend] = {
            state: "CLOSED",
            failures: 0,
            openedAt: null,
            testInProgress: false
        };

    });

    await updateHealthyPool();

    app.listen(PORT, () => {
        console.log(
            `🔥 NexaFlow Gateway running on port ${PORT}`
        );
    });

    setInterval(async () => {

        const discoveredBackends =
            await discoverBackends();

        if (discoveredBackends.length > 0) {
            BACKENDS = discoveredBackends;
            BACKENDS.forEach((backend) => {

                if (!circuitState[backend]) {

                    circuitState[backend] = {
                        state: "CLOSED",
                        failures: 0,
                        openedAt: null,
                        testInProgress: false
                    };

                    console.log(
                        `🆕 Circuit initialized for ${backend}`
                    );
                }

            });
        }

        await updateHealthyPool();

    }, 5000);
};

startGateway();