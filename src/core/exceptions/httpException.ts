import { BaseException } from './baseException';

export class HttpException extends BaseException {
  readonly statusCode: number;
  readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}
