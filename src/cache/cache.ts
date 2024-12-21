import { Redis } from "ioredis";

import config from "@/config";

const { host, port, username, password } = config.redis;
export const cache = new Redis({
  host,
  port,
  username,
  password,
});
