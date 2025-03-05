// Define the interface for environment variables
export interface Env {
  PRIVATE_KEY: string;
  API_KEY: string;
  API_SECRET: string;
  PASSPHRASE: string;
}

// Define fallback values for environment variables
export const fallbackEnv: Env = {
  PRIVATE_KEY:
    "0x0000000000000000000000000000000000000000000000000000000000000000",
  API_KEY: "dummy-key",
  API_SECRET: "dummy-secret",
  PASSPHRASE: "dummy-passphrase",
};

// Use environment variables with fallbacks
const env: Env = {
  PRIVATE_KEY: process.env.PRIVATE_KEY || fallbackEnv.PRIVATE_KEY,
  API_KEY: process.env.API_KEY || fallbackEnv.API_KEY,
  API_SECRET: process.env.API_SECRET || fallbackEnv.API_SECRET,
  PASSPHRASE: process.env.PASSPHRASE || fallbackEnv.PASSPHRASE,
};

export default env;
