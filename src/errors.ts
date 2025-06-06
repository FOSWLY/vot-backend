import { TranslatedService } from "@/types/translation";

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
    super(`To translate videos from ${service}, you must specify the "raw_video" field`);
  }
}

export class UnSupportedVideoLink extends Error {
  constructor() {
    super("You are trying to translate a video using an unsupported link");
  }
}

export class FailedExtractVideo extends Error {
  constructor(message: string | null = null) {
    super(`The video couldn't be extracted. Possible error: ${message}`);
  }
}

export class TranslationNotFound extends Error {
  constructor() {
    super(`The requested translation wasn't found!`);
  }
}

export class SubtitleNotFound extends Error {
  constructor() {
    super(`The requested subtitle wasn't found!`);
  }
}
