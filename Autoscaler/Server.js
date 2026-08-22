import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://redis:6379"
});

redisClient.on("error", (error) => {
    console.error("Redis Error:", error);
});

await redisClient.connect();

const MIN_BACKENDS = 2;
const MAX_BACKENDS = 4;

const COMPOSE_FILE = "/project/docker-compose.prod.yml";
const PROJECT_NAME = "nexamind-ai";
const CHECK_INTERVAL = 5000;

const SCALE_2_TO_3_THRESHOLD = 20;
const SCALE_3_TO_4_THRESHOLD = 40;

const SCALE_DOWN_THRESHOLD = 10;
const SCALE_DOWN_STABLE_TIME = 30000; // 30 seconds
let lowLoadSince = null;

let scalingInProgress = false;
const scaleBackend = async (target) => {
    const { exec } = await import("node:child_process");

    await new Promise((resolve, reject) => {

        exec(
            `docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} up -d --scale backend=${target} backend`,
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "Scaling failed:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    reject(error);
                    return;
                }


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


const scaleDownBackend = async (target) => {

    const { exec } = await import("node:child_process");

    await new Promise((resolve, reject) => {

        exec(
            `docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} up -d --scale backend=${target} backend`,
            (error, stdout, stderr) => {

                if (error) {

                    console.error(
                        "Scale-down failed:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    reject(error);
                    return;
                }

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
                        "Could not get backend count:",
                        error.message
                    );

                    if (stderr) {
                        console.error(stderr);
                    }

                    resolve(null);
                    return;
                }

                const containers = stdout
                    .trim()
                    .split("\n")
                    .filter(Boolean);

                resolve(containers.length);
            }
        );
    });
};

const waitForBackendCount = async (target) => {

    for (let i = 0; i < 15; i++) {

        const count = await getBackendCount();

        if (count === target) {
            return true;
        }

        await new Promise(
            resolve => setTimeout(resolve, 2000)
        );
    }

    console.error(
        `Timed out waiting for ${target} backend replicas`
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

    const backendCount =
        await getBackendCount();


    if (backendCount === null) {
        return;
    }

    if (scalingInProgress) {
        return;
    }


    try {

        if (backendCount < MIN_BACKENDS) {

            console.log(
                `Backend count ${backendCount} is below minimum ${MIN_BACKENDS}`
            );

            scalingInProgress = true;

            await scaleBackend(MIN_BACKENDS);

            console.log(
                `Minimum backend requirement restored: ${MIN_BACKENDS} backends`
            );

            lowLoadSince = null;

            return;
        }

        if (
            backendCount === 2 &&
            rate >= SCALE_2_TO_3_THRESHOLD
        ) {

            console.log(
                `2 → 3 threshold crossed: ${rate} >= ${SCALE_2_TO_3_THRESHOLD}`
            );

            scalingInProgress = true;

            await scaleBackend(3);

            console.log(
                "2 → 3 scaling process finished"
            );

            lowLoadSince = null;

        }

        else if (
            backendCount === 3 &&
            rate >= SCALE_3_TO_4_THRESHOLD
        ) {

            console.log(
                `3 → 4 threshold crossed: ${rate} >= ${SCALE_3_TO_4_THRESHOLD}`
            );

            scalingInProgress = true;

            await scaleBackend(4);

            console.log(
                "3 → 4 scaling process finished"
            );

            lowLoadSince = null;

        }


        else if (
            backendCount > MIN_BACKENDS &&
            rate < SCALE_DOWN_THRESHOLD
        ) {

            if (lowLoadSince === null) {

                lowLoadSince = Date.now();

                console.log(
                    "Low load detected. Starting scale-down timer..."
                );

            }

            const lowLoadDuration =
                Date.now() - lowLoadSince;

            console.log(
                `Low load duration: ${Math.floor(
                    lowLoadDuration / 1000
                )}s / ${SCALE_DOWN_STABLE_TIME / 1000
                }s`
            );

            if (
                lowLoadDuration >=
                SCALE_DOWN_STABLE_TIME
            ) {

                const target =
                    backendCount - 1;

                console.log(
                    `Low load sustained. Scaling ${backendCount} → ${target}`
                );

                scalingInProgress = true;

                await scaleDownBackend(target);

                console.log(
                    `${backendCount} → ${target} scale-down finished`
                );

                lowLoadSince = null;
            }

        }

        else {
            lowLoadSince = null;

            console.log(
                "No scaling required"
            );
        }

    }

    catch (error) {
        console.error(
            "Autoscaling error:",
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