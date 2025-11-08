import bcrypt from "bcrypt";

const ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, ROUNDS);
};

export const comparePassword = async (
  password: string,
  password_hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, password_hash);
};
