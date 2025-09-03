const API_BASE_URL = "http://localhost:8080"; // Spring Boot backend

const SuggestionService = {
  getSuggestion: async (ingredients) => {
    const response = await fetch(`${API_BASE_URL}/suggest?ingredients=${encodeURIComponent(ingredients)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch suggestion");
    }
    return response.json(); // must return { "suggestion": "..." }
  }
};

export default SuggestionService;

