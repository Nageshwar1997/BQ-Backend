// // import { createClient } from "redis";

// // const client = createClient({
// //   username: "",
// //   password: "",
// //   socket: {
// //     host: "",
// //     port: 10767,
// //   },
// // });

// // client.on("error", (err) => console.log("Redis Client Error", err));

// // await client.connect();

// // await client.set("foo", "bar");
// // const result = await client.get("foo");
// // console.log(result); // >>> bar

// import { createClient } from "redis";
// import { REDIS_HOST, REDIS_PORT } from "../../envs";

// export const redisClient = createClient({
//   socket: {
//     host: REDIS_HOST,
//     port: Number(REDIS_PORT),
//   },
//   password: process.env.REDIS_PASSWORD,
// });

// redisClient.on("connect", () => {
//   console.log("Redis Cloud connected");
// });

// redisClient.on("error", (err) => {
//   console.error("Redis error:", err);
// });
