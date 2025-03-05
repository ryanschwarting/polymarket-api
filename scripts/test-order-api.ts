/**
 * Test script for the Polymarket order API
 *
 * This script sends a sample order request to the API endpoint
 * to verify that it's working correctly.
 */

async function testOrderAPI() {
  try {
    console.log("Testing Polymarket Order API...");

    // Sample order data
    const orderData = {
      tokenID: "7132107...", // Replace with a real token ID in production
      price: 0.5,
      side: "BUY",
      size: 10,
      orderType: "GTC",
      feeRateBps: 100,
    };

    console.log("Sending order request:", JSON.stringify(orderData, null, 2));

    // Send the request to the API
    const response = await fetch("http://localhost:3000/api/place-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    // Parse the response
    const data = await response.json();

    if (response.ok) {
      console.log("Order placed successfully!");
      console.log("Response:", JSON.stringify(data, null, 2));
    } else {
      console.error("Failed to place order:", data.error);
      if (data.details) {
        console.error(
          "Validation errors:",
          JSON.stringify(data.details, null, 2)
        );
      }
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

// Run the test
testOrderAPI();

/**
 * To run this script:
 * 1. Make sure your Next.js development server is running
 * 2. Execute: npx ts-node scripts/test-order-api.ts
 *
 * Note: You'll need to have the ts-node package installed:
 * npm install --save-dev ts-node
 */
