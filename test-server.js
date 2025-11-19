const http = require("http");

// Test if server is running
const options = {
  hostname: "localhost",
  port: 3000,
  path: "/users",
  method: "GET",
};

const req = http.request(options, (res) => {
  console.log(`Server is running! Status: ${res.statusCode}`);
  console.log("Headers:", res.headers);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response body:", data);
  });
});

req.on("error", (e) => {
  console.error(`Server test failed: ${e.message}`);
});

req.end();
