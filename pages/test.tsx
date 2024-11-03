// ExampleComponent.js - Your client-side component
import React, { useState } from 'react';
// import { fetchOpenAI } from './api/openai'; // Adjust the import path as needed

const ExampleComponent = () => {
    const [result, setResult] = useState('');

    const handleFetch = async () => {
        // try {
        //     const data = await fetchOpenAI('say penis 10 times lmao');
        //     setResult(data.result);
        // } catch (error) {
        //     console.error('Fetch error:', error);
        // }
        try {
            const ask = "temporary prompt"
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
            <button onClick={handleFetch}>Call OpenAI API</button>
            {result && <p>Response: {result}</p>}
        </div>
    );
};

export default ExampleComponent;
