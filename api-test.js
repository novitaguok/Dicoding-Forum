const http = require("http");

const testData = JSON.stringify({
  username: "testuser",
  password: "password",
  fullname: "Test User",
});

const options = {
  hostname: "localhost",
  port: 3000,
  path: "/users",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(testData),
  },
};

console.log("Testing API...");

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = "";
  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log("Response body:", data);
    try {
      const json = JSON.parse(data);
      console.log("Parsed JSON:", json);
    } catch (e) {
      console.log("Response is not valid JSON");
    }
  });
});

req.on("error", (e) => {
  console.error(`API test failed: ${e.message}`);
});

req.write(testData);
req.end();
