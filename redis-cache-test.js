import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 100,
    duration: '3m',
    summaryTrendStats: [
        'avg',
        'min',
        'med',
        'max',
        'p(90)',
        'p(95)',
        'p(99)',
    ],
};

export default function () {

    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMDc1Njg1MzU0YzQ0NjI1YWUxMWI0NSIsImVtYWlsIjoiaGFyc2hqb3NoaTAxMDZAZ21haWwuY29tIiwiaWF0IjoxNzg2ODg0NjM0LCJleHAiOjE3ODc0ODk0MzR9.nWw8cKSAvtxrUOJRFwpRWCUArkt6EzizlJhXTJTFgjY";

    const response = http.get(
        'http://localhost:4000/api/thread',
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    check(response, {
        'status is 200': (r) => r.status === 200,
    });

    sleep(1);
}