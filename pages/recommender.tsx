// ExampleComponent.js - Your client-side component
import React, { useState } from 'react';
// import { fetchOpenAI } from './api/openai'; // Adjust the import path as needed

const ExampleComponent = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [result, setResult] = useState('');

    const handleFetch = async () => {
        try {
            const ask = result;
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ask }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log('Response from OpenAI:', data);
        } catch (error) {
            console.error('Error fetching OpenAI:', error);
        }
    };

    return (
        <div>
            <input
                type="text"
                className="border border-gray-300 rounded py-2 px-4 mb-4"
                placeholder="Enter your prompt"
                onChange={(e) => setResult(e.target.value)}
            />
            <button onClick={handleFetch} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Call OpenAI API
            </button>
            {result && <p>Response: {result}</p>}
        </div>
    );
};

export default ExampleComponent;
