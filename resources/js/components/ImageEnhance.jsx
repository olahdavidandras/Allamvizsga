import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

const ImageEnhance = () => {
    const [enhanceImageUrl, setEnhanceImageUrl] = useState('');
    const [colorizeImageUrl, setColorizeImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const sendRequest = async (imageUrl, apiType) => {
        if (!imageUrl) {
            alert('Adj meg egy kép URL-t!');
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await axios.post('/enhance', {
                image_url: imageUrl,
                api_type: apiType
            }, {
                withCredentials: true
            });
            

            if (response.data.prediction_id) {
                checkStatus(response.data.prediction_id);
            } else {
                setError('Hiba történt!');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Hiba történt a kérés során.');
            setLoading(false);
        }
        
    };

    const checkStatus = async (predictionId) => {
        try {
            const response = await axios.post('/check-status', { prediction_id: predictionId });
            if (response.data.status === 'succeeded' && response.data.output) {
                const outputImage = Array.isArray(response.data.output) ? response.data.output[0] : response.data.output;
                setResult(outputImage);
                setLoading(false);
            } else if (response.data.status === 'processing') {
                setTimeout(() => checkStatus(predictionId), 3000);
            } else {
                setError('Nem sikerült a feldolgozás.');
                setLoading(false);
            }
        } catch (error) {
            console.error(error);
            setError(`Hiba történt: ${error.response?.data?.error || error.message}`);
            setLoading(false);
        }
    };

    return (
        
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Képjavító API (GFPGAN)</h2>
            <input
                type="text"
                className="border p-2 w-full mb-2"
                placeholder="Illeszd be a kép URL-t"
                value={enhanceImageUrl}
                onChange={(e) => setEnhanceImageUrl(e.target.value)}
            />
            <button
                onClick={() => sendRequest(enhanceImageUrl, 'gfpgan')}
                className="bg-blue-500 text-black px-4 py-2 rounded w-full"
            >
                Képjavítás
            </button>

            <h2 className="text-xl font-bold mt-6 mb-4">Fekete-fehér színező API (DDColor)</h2>
            <input
                type="text"
                className="border p-2 w-full mb-2"
                placeholder="Illeszd be a fekete-fehér kép URL-t"
                value={colorizeImageUrl}
                onChange={(e) => setColorizeImageUrl(e.target.value)}
            />
            <button
                onClick={() => sendRequest(colorizeImageUrl, 'ddcolor')}
                className="bg-green-500 text-black px-4 py-2 rounded w-full"
            >
                Színezés
            </button>

            {loading && <p className="mt-4 text-gray-600">Feldolgozás...</p>}

            {result && (
                <div className="mt-4">
                    <h3 className="font-semibold">Eredmény:</h3>
                    <img src={result} alt="Eredmény" className="w-full rounded" />
                </div>
            )}

            {error && (
                <div className="mt-4 text-red-500">
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};

export default ImageEnhance;
