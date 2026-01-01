/**
 * Test API connection and available slots endpoint
 */

const API_BASE = "https://metabot-ai-backend-production.up.railway.app";
const API_KEY =
  "c37914b47420e9bbf2c30e9f8d2f5efd435a8086b8841073972559a084c20d19";

async function testApiConnection() {
  console.log("🧪 Testing API Connection...\n");

  try {
    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    console.log("Health status:", healthResponse.status);

    if (healthResponse.ok) {
      const health = await healthResponse.json();
      console.log("✅ Health check passed:", health);
    } else {
      console.log("❌ Health check failed");
    }
    console.log("");

    // Test 2: Available slots endpoint (the failing one)
    console.log("2️⃣ Testing available slots endpoint...");
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: "30",
    });

    const slotsResponse = await fetch(
      `${API_BASE}/api/bookings/available-slots?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    console.log("Slots response status:", slotsResponse.status);
    console.log(
      "Slots response headers:",
      Object.fromEntries(slotsResponse.headers.entries())
    );

    if (slotsResponse.ok) {
      const slots = await slotsResponse.json();
      console.log("✅ Available slots:", slots);
    } else {
      const error = await slotsResponse.text();
      console.log("❌ Slots request failed:");
      console.log("Response body:", error);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testApiConnection();
