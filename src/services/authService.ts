import api from "./api";

export interface SignUpData {
  name: string;
  email: string;
  password: string;
}

export const signUp = async (data: SignUpData) => {
  const response = await api.post("/auth/signup", data);
  return response.data;
};
