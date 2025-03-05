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
    const [enhancedImages, setEnhancedImages] = useState({ gfpgan: '', ddcolor: '' });
    const [loading, setLoading] = useState({ gfpgan: false, ddcolor: false });
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

            if (response.data.image_id) {
                setImageId(response.data.image_id);
                console.log(response.data.image_id);
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

        setLoading(prev => ({ ...prev, [apiType]: true }));
        setError(null);

        try {
            const response = await axios.post('/enhance', { image_id: imageId, api_type: apiType });
            if (response.data.prediction_id) {
                checkStatus(response.data.prediction_id, apiType);
            } else {
                setError('Hiba történt!');
                setLoading(prev => ({ ...prev, [apiType]: false }));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Hiba történt a kérés során.');
            setLoading(prev => ({ ...prev, [apiType]: false }));
        }
    };

    const checkStatus = async (predictionId, apiType) => {
        try {
            const response = await axios.post('/check-status', { prediction_id: predictionId });

            console.log(`API válasz (${apiType}):`, response.data);

            if (response.data.status === "processing") {
                setTimeout(() => checkStatus(predictionId, apiType), 3000);
            } else if (response.data.image_url) {
                setEnhancedImages(prev => ({ ...prev, [apiType]: response.data.image_url }));
                setLoading(prev => ({ ...prev, [apiType]: false }));
            } else {
                setError('Nem sikerült a feldolgozás.');
                setLoading(prev => ({ ...prev, [apiType]: false }));
            }
        } catch (error) {
            console.error(`Hiba (${apiType}):`, error);
            setError(`Hiba: ${error.response?.data?.error || error.message}`);
            setLoading(prev => ({ ...prev, [apiType]: false }));
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Kép feltöltése</h2>
            <input type="file" onChange={handleFileChange} className="border p-2 w-full mb-2" />
            <button onClick={uploadImage} className="bg-green-500 text-white px-4 py-2 rounded w-full">Feltöltés</button>

            <h2 className="text-xl font-bold mt-6">Képjavító API-k</h2>
            
            <button onClick={() => enhanceImage('gfpgan')} className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2">
                Képjavítás (GFPGAN)
            </button>

            <button onClick={() => enhanceImage('ddcolor')} className="bg-purple-500 text-white px-4 py-2 rounded w-full mt-2">
                Színezés (DDColor)
            </button>

            {loading.gfpgan && <p className="mt-4 text-gray-600">GFPGAN feldolgozás...</p>}
            {loading.ddcolor && <p className="mt-4 text-gray-600">DDColor feldolgozás...</p>}

            {enhancedImages.gfpgan && (
                <div className="mt-4">
                    <h3 className="font-semibold">GFPGAN Eredmény:</h3>
                    <img src={enhancedImages.gfpgan} alt="GFPGAN eredmény" className="w-full rounded" />
                </div>
            )}

            {enhancedImages.ddcolor && (
                <div className="mt-4">
                    <h3 className="font-semibold">DDColor Eredmény:</h3>
                    <img src={enhancedImages.ddcolor} alt="DDColor eredmény" className="w-full rounded" />
                </div>
            )}

            {error && <div className="mt-4 text-red-500"><p>{error}</p></div>}
        </div>
    );
};

export default ImageEnhance;
