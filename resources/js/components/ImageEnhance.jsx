import React, { useState } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
if (csrfToken) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken;
}

const ImageEnhance = () => {
    const [imageFile, setImageFile] = useState(null);
    const [imageId, setImageId] = useState(null);
    const [enhancedImageUrl, setEnhancedImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);


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

            if (response.data.image_id) {
                setImageId(response.data.image_id);
                alert('Kép feltöltve!');
            } else {
                throw new Error('Hibás válasz a szervertől.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Hiba a feltöltés során.');
        }
    };

    const enhanceImage = async (apiType) => {
        if (!imageId) {
            alert('Először tölts fel egy képet!');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/enhance', { image_id: imageId, api_type: apiType });
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
    
            console.log('API válasz:', response.data);
    
            if (response.data.status === "processing") {
                setTimeout(() => checkStatus(predictionId), 3000);
            } else if (response.data.image_url) {
                setEnhancedImageUrl(response.data.image_url);
                setLoading(false);
            } else {
                setError('Nem sikerült a feldolgozás.');
                setLoading(false);
            }
        } catch (error) {
            console.error("Hiba történt:", error);
            setError(`Hiba: ${error.response?.data?.error || error.message}`);
            setLoading(false);
        }
    };
    
    
    
    

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Kép feltöltése</h2>
            <input type="file" onChange={handleFileChange} className="border p-2 w-full mb-2" />
            <button onClick={uploadImage} className="bg-green-500 text-white px-4 py-2 rounded w-full">Feltöltés</button>

            <h2 className="text-xl font-bold mt-6">Képjavító API (GFPGAN)</h2>
            <button onClick={() => enhanceImage('gfpgan')} className="bg-blue-500 text-white px-4 py-2 rounded w-full">Képjavítás</button>

            {loading && <p className="mt-4 text-gray-600">Feldolgozás...</p>}
            {enhancedImageUrl && <div className="mt-4"><h3 className="font-semibold">Eredmény:</h3><img src={enhancedImageUrl} alt="Eredmény" className="w-full rounded" /></div>}
            {error && <div className="mt-4 text-red-500"><p>{error}</p></div>}
        </div>
    );
};

export default ImageEnhance;
