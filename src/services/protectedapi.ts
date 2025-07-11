import axios from "axios";

const token = localStorage.getItem("token");

const protectedapi = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
export default protectedapi;
