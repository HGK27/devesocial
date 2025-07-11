import api from "./api";

export interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post("/auth/signin", data);
  return response.data;
};
