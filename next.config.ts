import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "10.34.6.112:3000",
    "192.168.1.33:3000", // IP da sua máquina na rede
  ],
};

export default nextConfig;
