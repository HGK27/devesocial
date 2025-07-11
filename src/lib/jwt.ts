import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export const generateToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "30d" }
  );
};

export const verifyToken = (token: string): UserPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
};
