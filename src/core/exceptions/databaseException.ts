import { HttpStatus } from '../constants/httpStatus';
import { ErrorCodes } from '../constants/errorCodes';
import { HttpException } from './httpException';

export class DatabaseException extends HttpException {
  constructor(message = 'Database operation failed') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.DATABASE_ERROR);
  }
}
