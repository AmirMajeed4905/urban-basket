// Custom error class — status code aur message ke saath
// Isse errorHandler middleware properly handle karta hai

export class ApiError extends Error {
  statusCode: number;
  errors: string[];
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    errors: string[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Expected errors (not bugs)

    // Proper stack trace maintain karne ke liye
    Error.captureStackTrace(this, this.constructor);
  }
}
