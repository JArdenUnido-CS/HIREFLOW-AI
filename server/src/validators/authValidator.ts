export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const emailPattern =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignUp(
  firstName: unknown,
  lastName: unknown,
  email: unknown,
  password: unknown
): ValidationResult {
  if (
    typeof firstName !== "string" ||
    firstName.trim().length === 0
  ) {
    return {
      valid: false,
      message:
        "First name is required."
    };
  }

  if (
    typeof lastName !== "string" ||
    lastName.trim().length === 0
  ) {
    return {
      valid: false,
      message:
        "Last name is required."
    };
  }

  if (
    typeof email !== "string" ||
    email.trim().length === 0
  ) {
    return {
      valid: false,
      message:
        "Email is required."
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  if (
    !emailPattern.test(
      normalizedEmail
    )
  ) {
    return {
      valid: false,
      message:
        "Invalid email address."
    };
  }

  if (
    typeof password !== "string" ||
    password.length === 0
  ) {
    return {
      valid: false,
      message:
        "Password is required."
    };
  }

  if (password.length < 8) {
    return {
      valid: false,
      message:
        "Password must be at least 8 characters."
    };
  }

  return {
    valid: true
  };
}

export function validateLogin(
  email: unknown,
  password: unknown
): ValidationResult {
  if (
    typeof email !== "string" ||
    email.trim().length === 0
  ) {
    return {
      valid: false,
      message:
        "Email is required."
    };
  }

  const normalizedEmail =
    email.trim().toLowerCase();

  if (
    !emailPattern.test(
      normalizedEmail
    )
  ) {
    return {
      valid: false,
      message:
        "Invalid email address."
    };
  }

  if (
    typeof password !== "string" ||
    password.length === 0
  ) {
    return {
      valid: false,
      message:
        "Password is required."
    };
  }

  return {
    valid: true
  };
}