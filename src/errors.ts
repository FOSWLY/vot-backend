import { TranslatedService } from "./types/translation";

export class UnAuthorizedError extends Error {
  constructor(unknownToken = false) {
    super(unknownToken ? "Unknown token type" : "Not authenticated");
  }
}

export class InternalServerError extends Error {
  constructor() {
    super("Internal server error (see logs)");
  }
}

export class MissingRawVideoField extends Error {
  constructor(service: TranslatedService) {
    super(`To translate videos from ${service}, you must specify the "rawVideo" field`);
  }
}

export class UnSupportedVideoLink extends Error {
  constructor() {
    super("You are trying to translate a video using an unsupported link");
  }
}

export class FailedExtractVideo extends Error {
  constructor() {
    super("The video couldn't be extracted. Let us know about it.");
  }
}
