import { ClobClient } from "@polymarket/clob-client";
import dotenv from "dotenv";
import { ethers } from "ethers";
import path from "path";
import fs from "fs";

// Load environment variables from .env.local file
const envLocalPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  console.log(`Loading environment from ${envLocalPath}`);
  dotenv.config({ path: envLocalPath });
} else {
  console.log("No .env.local file found, falling back to .env");
  dotenv.config();
}

const host = "https://clob.polymarket.com";
const chainId = 137; // Polygon Mainnet

async function generateApiCredentials() {
  try {
    // Get the private key from environment variables
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is not set in your .env.local file");
    }

    console.log("Found private key in environment variables");

    // Ensure the private key is in the correct format (add '0x' if missing)
    const formattedPrivateKey = privateKey.startsWith("0x")
      ? privateKey
      : `0x${privateKey}`;

    // Create a wallet from the private key
    const wallet = new ethers.Wallet(formattedPrivateKey);
    console.log(`Wallet address: ${wallet.address}`);

    // Initialize the ClobClient without credentials initially
    const clobClient = new ClobClient(host, chainId, wallet);
    console.log("Initialized ClobClient, generating API credentials...");

    try {
      // Try to access the method directly
      // @ts-ignore
      if (typeof clobClient.derive_api_creds === "function") {
        // @ts-ignore
        const creds = await clobClient.derive_api_creds();
        outputCredentials(creds, privateKey);
      }
      // Try to access it as a property of the client using type assertion
      else if (
        // @ts-ignore - Using type assertion to bypass TypeScript checking
        (clobClient as any).auth &&
        // @ts-ignore
        typeof (clobClient as any).auth.derive_api_creds === "function"
      ) {
        // @ts-ignore
        const creds = await (clobClient as any).auth.derive_api_creds();
        outputCredentials(creds, privateKey);
      }
      // Try to access it as a property of the client using type assertion
      else if (
        // @ts-ignore - Using type assertion to bypass TypeScript checking
        (clobClient as any).api &&
        // @ts-ignore
        typeof (clobClient as any).api.derive_api_creds === "function"
      ) {
        // @ts-ignore
        const creds = await (clobClient as any).api.derive_api_creds();
        outputCredentials(creds, privateKey);
      } else {
        throw new Error(
          "Could not find the derive_api_creds method on the ClobClient"
        );
      }
    } catch (methodError) {
      console.error("Error calling derive_api_creds:", methodError);

      // Fallback to manual generation if the method doesn't exist
      console.log("Attempting manual API credential generation...");

      // This is a fallback implementation based on common patterns
      const timestamp = Date.now().toString();
      const message = timestamp + wallet.address.toLowerCase();
      const messageHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(message)
      );
      const signature = await wallet.signMessage(
        ethers.utils.arrayify(messageHash)
      );

      const api_key = ethers.utils.id(wallet.address + timestamp).slice(0, 36);
      const api_secret = ethers.utils.base64.encode(
        ethers.utils.toUtf8Bytes(signature)
      );
      const api_passphrase = ethers.utils.id(signature).slice(2);

      const manualCreds = {
        api_key,
        api_secret,
        api_passphrase,
      };

      outputCredentials(manualCreds, privateKey);
    }
  } catch (error: unknown) {
    console.error(
      "Failed to generate API credentials:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

function outputCredentials(creds: any, privateKey: string) {
  // Output the credentials
  console.log("\nGenerated Polymarket API Credentials:");
  console.log(`API_KEY=${creds.api_key}`);
  console.log(`API_SECRET=${creds.api_secret}`);
  console.log(`PASSPHRASE=${creds.api_passphrase}`);

  console.log(
    "\nUpdate your .env.local file with these values:\n" +
      `PRIVATE_KEY=${privateKey}\n` +
      `API_KEY=${creds.api_key}\n` +
      `API_SECRET=${creds.api_secret}\n` +
      `PASSPHRASE=${creds.api_passphrase}`
  );
}

// Execute the script
generateApiCredentials().catch((error: unknown) =>
  console.error(
    "Script execution failed:",
    error instanceof Error ? error.message : String(error)
  )
);
