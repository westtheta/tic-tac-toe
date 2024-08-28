/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              connect-src 'self' http://localhost:4000 ws://localhost:4000/ https://tic-tac-toe-28r3.onrender.com https://tic-tac-toe-28r3.onrender.com wss://tic-tac-toe-28r3.onrender.com/;
            `
              .replace(/\s{2,}/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};
// Hellow orld
export default nextConfig;
