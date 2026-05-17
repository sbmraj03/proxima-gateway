import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],
};

export default function () {
    const res = http.get('http://3.109.56.77/api/public');

    if (res.status !== 200) {
        console.log(`FAILED STATUS = ${res.status}`);
        console.log(`BODY = ${res.body}`);
    }

    sleep(1);
}