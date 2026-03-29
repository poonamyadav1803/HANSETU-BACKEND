import { HttpException } from "./HttpException";

export abstract class BaseService {
  protected throwNotFound(message = "Resource not found") {
    throw new HttpException(404, message);
  }

  protected throwBadRequest(message: string) {
    throw new HttpException(400, message);
  }

  protected throwUnauthorized(message = "Unauthorized") {
    throw new HttpException(401, message);
  }
}
