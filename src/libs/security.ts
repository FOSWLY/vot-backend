import { UnAuthorizedError } from "../errors";

export function validateAuthToken(authorization: string | undefined) {
  const token = authorization?.split("Basic")?.[1];
  if (!token) {
    throw new UnAuthorizedError(!!authorization);
  }

  if (token.trim() !== Bun.env.SERVICE_TOKEN) {
    throw new UnAuthorizedError();
  }

  return true;
}
