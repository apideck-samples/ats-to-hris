const concurrently = require("concurrently");
const ngrok = require("ngrok");
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.port || 7777;

ngrok
  .connect({
    proto: "http",
    addr: port,
  })
  .then((url) => {
    console.log(`Apideck Application locally accessible on: http://127.0.0.1:${port}`);
    console.log(`Apideck Application publicly accessible on: ${url}`);
    console.log("Open the ngrok dashboard at: http://localhost:4040\n");

    const { result } = concurrently(
      [
        {
          command: `npm:start`,
          name: "server",
          env: { TUNNEL_URL: url },
        },
      ],
      {
        prefix: "name",
        killOthers: ["failure", "success"],
        restartTries: 3,
        // cwd: path.resolve(__dirname, 'scripts'),
      }
    );
    result.then(
      (msg) => {
        console.info(msg);
        ngrok.kill().then(() => process.exit(0));
      },
      (msg) => {
        console.info(msg);
        ngrok.kill().then(() => process.exit(0));
      }
    );
  });
