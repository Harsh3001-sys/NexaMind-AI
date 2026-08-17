import { createClient } from "redis";

const redisClient = createClient({
    url: "redis://redis:6379"
});

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

await redisClient.connect();

console.log("🟢 Autoscaler connected to Redis");

const MIN_BACKENDS = 2;
const MAX_BACKENDS = 4;

const COMPOSE_FILE = "/project/docker-compose.yml";
const PROJECT_NAME = "nexamind-ai";
const CHECK_INTERVAL = 5000;

const SCALE_2_TO_3_THRESHOLD = 20;
const SCALE_3_TO_4_THRESHOLD = 40;

const SCALE_DOWN_THRESHOLD = 10;
const SCALE_DOWN_STABLE_TIME = 30000; // 30 seconds
let lowLoadSince = null;

let scalingInProgress = false;
const scaleBackend = async (target) => {

    console.log(
        `🚀 Scaling backend to ${target} replicas...`
    );

    const { exec } = await import("node:child_process");

    await new Promise((resolve, reject) => {

        exec(
            `docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} up -d --scale backend=${target} backend`,
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "❌ Scaling failed:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    reject(error);
                    return;
                }

                console.log(
                    "✅ Docker Compose scaling command completed"
                );

                console.log(stdout);

                if (stderr) {
                    console.error(stderr);
                }

                resolve();
            }
        );

    });

    // IMPORTANT:
    // Do not immediately assume scaling succeeded.
    await waitForBackendCount(target);
};


const scaleDownBackend = async (target) => {

    console.log(
        `📉 Scaling backend down to ${target} replicas...`
    );

    const { exec } = await import("node:child_process");

    await new Promise((resolve, reject) => {

        exec(
            `docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} up -d --scale backend=${target} backend`,
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "❌ Scale-down failed:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    reject(error);
                    return;
                }

                console.log(
                    "✅ Docker Compose scale-down completed"
                );

                console.log(stdout);

                if (stderr) {
                    console.error(stderr);
                }

                resolve();
            }
        );
    });

    await waitForBackendCount(target);
};

const getBackendCount = async () => {

    const { exec } = await import("node:child_process");

    return new Promise((resolve) => {

        exec(
            `docker ps --filter "name=${PROJECT_NAME}-backend-" --format "{{.Names}}"`,
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "❌ Could not get backend count:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    // Do NOT treat an error as 0 backends
                    resolve(null);
                    return;
                }

                const containers = stdout
                    .trim()
                    .split("\n")
                    .filter(Boolean);

                console.log(
                    "🔎 Running backend containers:",
                    containers
                );

                resolve(containers.length);
            }
        );
    });
};

const waitForBackendCount = async (target) => {

    console.log(
        `⏳ Waiting for ${target} backend replicas...`
    );

    for (let i = 0; i < 15; i++) {

        const count = await getBackendCount();

        console.log(
            `🔍 Backend check: ${count}/${target}`
        );

        if (count === target) {

            console.log(
                `✅ ${target} backend replicas are running`
            );

            return true;
        }

        await new Promise(
            resolve => setTimeout(resolve, 2000)
        );
    }

    console.error(
        `❌ Timed out waiting for ${target} backend replicas`
    );

    return false;
};

const checkLoad = async () => {

    const requestRate =
        await redisClient.get(
            "autoscale:requestRate"
        );

    const rate =
        Number(requestRate) || 0;

    console.log(
        `📊 Current request rate: ${rate} req/sec`
    );

    const backendCount =
        await getBackendCount();

    console.log(
        `📦 Current backend count: ${backendCount}`
    );

    if (backendCount === null) {

        console.log(
            "⚠️ Could not determine backend count. Skipping scaling decision."
        );

        return;
    }

    if (scalingInProgress) {

        console.log(
            "⏳ Scaling already in progress..."
        );

        return;
    }

    try {

        // =========================
        // SCALE UP
        // =========================

        if (
            backendCount === 2 &&
            rate >= SCALE_2_TO_3_THRESHOLD
        ) {

            console.log(
                `🔥 2 → 3 threshold crossed: ${rate} >= ${SCALE_2_TO_3_THRESHOLD}`
            );

            scalingInProgress = true;

            await scaleBackend(3);

            console.log(
                "✅ 2 → 3 scaling process finished"
            );

            lowLoadSince = null;

        }

        else if (
            backendCount === 3 &&
            rate >= SCALE_3_TO_4_THRESHOLD
        ) {

            console.log(
                `🔥 3 → 4 threshold crossed: ${rate} >= ${SCALE_3_TO_4_THRESHOLD}`
            );

            scalingInProgress = true;

            await scaleBackend(4);

            console.log(
                "✅ 3 → 4 scaling process finished"
            );

            lowLoadSince = null;

        }

        // =========================
        // SCALE DOWN
        // =========================

        else if (
            backendCount > MIN_BACKENDS &&
            rate < SCALE_DOWN_THRESHOLD
        ) {

            if (lowLoadSince === null) {

                lowLoadSince = Date.now();

                console.log(
                    "🕐 Low load detected. Starting scale-down timer..."
                );

            }

            const lowLoadDuration =
                Date.now() - lowLoadSince;

            console.log(
                `⏳ Low load duration: ${Math.floor(
                    lowLoadDuration / 1000
                )}s / ${
                    SCALE_DOWN_STABLE_TIME / 1000
                }s`
            );

            if (
                lowLoadDuration >=
                SCALE_DOWN_STABLE_TIME
            ) {

                const target =
                    backendCount - 1;

                console.log(
                    `📉 Low load sustained. Scaling ${backendCount} → ${target}`
                );

                scalingInProgress = true;

                await scaleDownBackend(target);

                console.log(
                    `✅ ${backendCount} → ${target} scale-down finished`
                );

                lowLoadSince = null;
            }

        }

        else {

            // Load is no longer low
            lowLoadSince = null;

            console.log(
                "🟢 No scaling required"
            );
        }

    }

    catch (error) {

        console.error(
            "❌ Autoscaling error:",
            error
        );

    }

    finally {

        scalingInProgress = false;
    }
};

setInterval(
    checkLoad,
    CHECK_INTERVAL
);

checkLoad();