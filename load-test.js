import http from 'k6/http';
import { check } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 10 },
        { duration: '20s', target: 30 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 },
    ],
};

export default function () {
    const res = http.get('http://localhost:4000/api/load-test');

    check(res, {
        'status is 200': (r) => r.status === 200,
    });
}