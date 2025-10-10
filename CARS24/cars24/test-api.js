// Simple API test to check if backend is running
const BASE_URL = "http://localhost:5092/api/Car";

async function testAPI() {
  console.log("🧪 Testing API connection...");
  console.log("🧪 URL:", BASE_URL);
  
  try {
    // Test summaries endpoint
    console.log("🧪 Testing /summaries endpoint...");
    const response = await fetch(`${BASE_URL}/summaries`);
    console.log("🧪 Response status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("🧪 Success! Found", data.length, "cars");
      console.log("🧪 Sample car:", data[0]);
    } else {
      console.log("🧪 Error:", response.status, response.statusText);
    }
  } catch (error) {
    console.log("🧪 Connection failed:", error.message);
    console.log("🧪 Make sure the backend is running on port 5092");
  }
}

testAPI();

