import axios from "axios";

export const api = axios.create({
    baseURL: "http://192.168.1.112:6001",
    timeout: 0,
    headers: { "Content-Type": "application/json" },
});

export const api2 = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 120000, // adb chậm → tăng timeout
    headers: { "Content-Type": "application/json" },
});