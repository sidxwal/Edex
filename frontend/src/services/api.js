const API_URL = "http://localhost:5000/ask";

export async function sendMessageToBackend(message) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout after 10 seconds

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: message }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId); // Clear timeout if the request completes

        const data = await response.json();
        console.log("Response from server:", data);

        return data.answer || "No response received from AI.";
    } catch (error) {
        console.error("Error sending message:", error);
        return "Sorry, the AI is taking too long to respond. Please try again.";
    }
}