import React, { useState, useEffect } from 'react';

const API_BASE = '/api';  //process.env.REACT_APP_API_BASE;   // 'http://34.228.16.196:8080';

export default function SmartRecipeApp() {
  const [ingredients, setIngredients] = useState(['']);
  const [suggestion, setSuggestion] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reverse()); // show latest first
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (i) => setIngredients(ingredients.filter((_, idx) => idx !== i));
  const updateIngredient = (i, val) => {
    const copy = [...ingredients];
    copy[i] = val;
    setIngredients(copy);
  };


  const getSuggestion = async () => {
  const validIngredients = ingredients.filter(i => i.trim());
  if (!validIngredients.length) {
    setError('Add at least one ingredient.');
    return;
  }
  setError('');
  setLoading(true);
  setSuggestion('');

  try {
    // Step 1: Get suggestion
    const query = encodeURIComponent(`I have: ${validIngredients.join(', ')}. Suggest a recipe.`);
    const res = await fetch(`${API_BASE}/claude/ask?q=${query}`, {
      headers: { 'Accept': 'text/plain' } // Tell API to return plain text
    });
    const text = await res.text(); // Use text() instead of json()
    setSuggestion(text);

    // Step 2: Save to history
    await fetch(`${API_BASE}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: validIngredients.join(', '), suggestionText: text })
    });

    fetchHistory();
  } catch (err) {
    console.error(err);
    setError('Failed to get suggestion.');
  } finally {
    setLoading(false);
  }
};
	
  const deleteHistory = async (id) => {
    await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
    if (selectedHistory && selectedHistory.id === id) setSelectedHistory(null);
    fetchHistory();
  };

  const viewHistory = async (id) => {
    if (selectedHistory && selectedHistory.id === id) return setSelectedHistory(null);
    const res = await fetch(`${API_BASE}/history/${id}`);
    if (res.ok) setSelectedHistory(await res.json());
  };

  return (
    <div className="container">
      <h1>Smart Recipe</h1>
      <div className="ingredients">
        {ingredients.map((ing, i) => (
          <div key={i} className="ingredient-row">
            <input value={ing} onChange={(e) => updateIngredient(i, e.target.value)} placeholder="Enter ingredient" />
            {ingredients.length > 1 && <button onClick={() => removeIngredient(i)}>Remove</button>}
          </div>
        ))}
        <button onClick={addIngredient}>Add Ingredient</button>
      </div>

      <button onClick={getSuggestion} disabled={loading}>
        {loading ? 'Loading...' : 'Get Suggestion'}
      </button>

      {error && <div className="error">{error}</div>}
      {suggestion && <div className="suggestion"><strong>Suggestion:</strong><br />{suggestion}</div>}

      <h2>History</h2>
      <div className="history">
        {history.map(item => (
          <div key={item.id} className="history-item">
            <div>
              <strong>Ingredients:</strong> {item.ingredients}<br />
              <strong>Created:</strong> {new Date(item.createdAt).toLocaleString()}
            </div>
            <button onClick={() => viewHistory(item.id)}>View</button>
            <button onClick={() => deleteHistory(item.id)}>Delete</button>
            {selectedHistory && selectedHistory.id === item.id && (
              <div className="history-detail">{selectedHistory.suggestionText}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

