import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<1000'],
    },
};

export default function () {

    const response = http.get(
        'http://localhost:4000/api/load-test'
    );

    check(response, {
        'status is 200': (r) => r.status === 200,
        'gateway responded': (r) =>
            r.body.includes('NexaMind'),
    });
}