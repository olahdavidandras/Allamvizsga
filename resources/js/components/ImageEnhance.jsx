import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const ImageEnhance = () => {
    const [imageFile, setImageFile] = useState(null);
    const [enhanceImageUrl, setEnhanceImageUrl] = useState('');
    const [colorizeImageUrl, setColorizeImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const uploadImage = async () => {
        if (!imageFile) {
            alert('Válassz egy képet!');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await axios.post('/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const imageUrl = response.data.url;
            setEnhanceImageUrl(imageUrl);
            setColorizeImageUrl(imageUrl);
            alert('Kép feltöltve!');
        } catch (err) {
            setError('Hiba a feltöltés során.');
        }
    };

    const sendRequest = async (imageUrl, apiType) => {
        if (!imageUrl) {
            alert('Adj meg egy kép URL-t!');
            return;
        }

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await axios.post('/enhance', { image_url: imageUrl, api_type: apiType });
            if (response.data.prediction_id) {
                checkStatus(response.data.prediction_id);
            } else {
                setError('Hiba történt!');
                setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Hiba történt a kérés során.');
            setLoading(false);
        }
    };

    const checkStatus = async (predictionId) => {
        try {
            const response = await axios.post('/check-status', { prediction_id: predictionId });
            if (response.data.status === 'succeeded' && response.data.output) {
                setResult(Array.isArray(response.data.output) ? response.data.output[0] : response.data.output);
                setLoading(false);
            } else if (response.data.status === 'processing') {
                setTimeout(() => checkStatus(predictionId), 3000);
            } else {
                setError('Nem sikerült a feldolgozás.');
                setLoading(false);
            }
        } catch (error) {
            setError(`Hiba történt: ${error.response?.data?.error || error.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Kép feltöltése</h2>
            <input type="file" onChange={handleFileChange} className="border p-2 w-full mb-2" />
            <button onClick={uploadImage} className="bg-green-500 text-white px-4 py-2 rounded w-full">Feltöltés</button>

            <h2 className="text-xl font-bold mt-6">Képjavító API (GFPGAN)</h2>
            <input type="text" className="border p-2 w-full mb-2" placeholder="Illeszd be a kép URL-t" value={enhanceImageUrl} onChange={(e) => setEnhanceImageUrl(e.target.value)} />
            <button onClick={() => sendRequest(enhanceImageUrl, 'gfpgan')} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Képjavítás</button>

            <h2 className="text-xl font-bold mt-6">Fekete-fehér színező API (DDColor)</h2>
            <input type="text" className="border p-2 w-full mb-2" placeholder="Illeszd be a fekete-fehér kép URL-t" value={colorizeImageUrl} onChange={(e) => setColorizeImageUrl(e.target.value)} />
            <button onClick={() => sendRequest(colorizeImageUrl, 'ddcolor')} className="bg-purple-500 text-white px-4 py-2 rounded w-full">Színezés</button>

            {loading && <p className="mt-4 text-gray-600">Feldolgozás...</p>}
            {result && <div className="mt-4"><h3 className="font-semibold">Eredmény:</h3><img src={result} alt="Eredmény" className="w-full rounded" /></div>}
            {error && <div className="mt-4 text-red-500"><p>{error}</p></div>}
        </div>
    );
};

export default ImageEnhance;