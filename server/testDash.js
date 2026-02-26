const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        const json = JSON.parse(data);
        const token = json.token;

        const reqStats = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/dashboard/stats',
            headers: { 'Authorization': `Bearer ${token}` }
        }, statsRes => {
            let statsData = '';
            statsRes.on('data', chunk => { statsData += chunk; });
            statsRes.on('end', () => {
                console.log("Dashboard Payload:", JSON.parse(statsData));
            });
        });
        reqStats.end();
    });
});

req.write(JSON.stringify({ email: 'superadmin@root.com', password: 'password123' }));
req.end();
