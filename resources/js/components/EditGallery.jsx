import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../axios';

const EditGallery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [selectedImageIds, setSelectedImageIds] = useState([]);
  const [editFields, setEditFields] = useState({});
  const [loading, setLoading] = useState({});
  const [enhancingImage, setEnhancingImage] = useState(null);
  const token = localStorage.getItem('token');

  /**
   * Funcția care obține imaginea originală și versiunile AI pentru editare
   */
  const fetchPostWithVariants = async () => {
    try {
      const res = await axios.get(`/post/${id}/edit`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const post = res.data.post || {};
      const variants = Array.isArray(res.data.ai_versions) ? res.data.ai_versions : [];
      const allImages = [post, ...variants];

      setImages(allImages);

      const initiallyVisible = allImages
        .filter((img) => img?.visible_in_gallery)
        .map((img) => img.id);

      setSelectedImageIds(initiallyVisible);

      const fieldMap = {};
      allImages.forEach((img) => {
        fieldMap[img.id] = {
          title: img.title || '',
          content: img.content || '',
          is_public: !!img.is_public,
        };
      });
      setEditFields(fieldMap);
    } catch (err) {
      console.error('Hiba a képek lekérésekor:', err);
    }
  };

  useEffect(() => {
    fetchPostWithVariants();
  }, [id]);

  /**
   * Actualizează selecția imaginilor vizibile în galerie
   */
  const handleCheckboxChange = (imgId) => {
    setSelectedImageIds((prev) =>
      prev.includes(imgId) ? prev.filter((id) => id !== imgId) : [...prev, imgId]
    );
  };

  /**
   * Actualizează titlul, descrierea și starea publică a unei imagini
   */
  const handleFieldChange = (imgId, field, value) => {
    setEditFields((prev) => ({
      ...prev,
      [imgId]: {
        ...prev[imgId],
        [field]: value,
      },
    }));
  };

  /**
   * Trimite modificările unei imagini individuale către server
   */
  const handleUpdateImage = async (imgId) => {
    try {
      await axios.put(`/post/${imgId}`, editFields[imgId], {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
    } catch (err) {
      console.error('Hiba mentéskor:', err);
    }
  };

  /**
   * Schimbă vizibilitatea publică a imaginii
   */
  const handleTogglePublic = async (imgId) => {
    try {
      await axios.post('/toggle-public', { post_id: imgId }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setEditFields((prev) => ({
        ...prev,
        [imgId]: {
          ...prev[imgId],
          is_public: !prev[imgId].is_public,
        },
      }));
    } catch (err) {
      console.error('Hiba a publikus módosításnál:', err);
    }
  };

  /**
   * Șterge o imagine din galerie. Dacă nu mai există imagini, redirecționează
   */
  const handleDelete = async (imgId) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a képet?')) return;
    try {
      await axios.delete(`/post/${imgId}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      setImages((prev) => {
        const updated = prev.filter((img) => img.id !== imgId);
        if (updated.length === 0) {
          navigate('/gallery');
        }
        return updated;
      });
    } catch (err) {
      console.error('Hiba a törlés során:', err);
    }
  };

  /**
   * Salvează vizibilitatea imaginilor selectate în galerie
   */
  const handleSave = async () => {
    try {
      await axios.put(
        '/update-visibility',
        {
          post_id: parseInt(id),
          visible_ids: selectedImageIds,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      navigate('/gallery');
    } catch (err) {
      console.error('Hiba mentés közben:', err);
    }
  };

  /**
   * Inițiază procesul AI de înfrumusețare sau colorare
   */
  const triggerEnhancement = async (imgId, apiType) => {
    setLoading((prev) => ({ ...prev, [imgId]: apiType }));
    setEnhancingImage(imgId);
    try {
      const res = await axios.post('/enhance', { image_id: imgId, api_type: apiType }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      setTimeout(() => {
        checkStatus(res.data.prediction_id, imgId, apiType);
      }, 5000);
    } catch (err) {
      console.error('Hiba AI feldolgozás során:', err);
      setEnhancingImage(null);
    }
  };

  /**
   * Verifică starea procesării AI și reîncarcă imaginile la final
   */
  const checkStatus = async (predictionId, postId, apiType) => {
    try {
      const res = await axios.post('/check-status', {
        prediction_id: predictionId,
        parent_id: postId,
        ai_type: apiType,
      }, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });

      if (res.data.status === 'processing') {
        setTimeout(() => checkStatus(predictionId, postId, apiType), 5000);
      } else if (res.data.image_url) {
        setEnhancingImage(null);
        fetchPostWithVariants();
      }
    } catch (err) {
      console.error('Hiba a státusz lekérdezésnél:', err);
      setEnhancingImage(null);
    }
  };

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">Szerkesztés és Galériába való megjelenítés</h2>
      <div className="edit-grid">
        {Array.isArray(images) && images.map((img, idx) => (
          <div key={img?.id ?? `image-${idx}`} className="edit-card">
            {img?.image ? (
              <img
                src={img.image}
                alt={img.title || 'Kép'}
                className="post-image edit-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/placeholder.jpg';
                }}
              />
            ) : (
              <p className="no-image">Nincs kép ({img.id})</p>
            )}
            <input
              type="text"
              className="edit-input"
              placeholder="Cím"
              value={editFields[img.id]?.title || ''}
              onChange={(e) => handleFieldChange(img.id, 'title', e.target.value)}
            />
            <textarea
              className="edit-textarea"
              placeholder="Leírás"
              value={editFields[img.id]?.content || ''}
              onChange={(e) => handleFieldChange(img.id, 'content', e.target.value)}
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedImageIds.includes(img.id)}
                onChange={() => handleCheckboxChange(img.id)}
              />{' '}
              Megjelenítés a galériában
            </label>
            {!img.ai_generated && (() => {
              const hasGfpgan = images.some((i) => i.parent_id === img.id && i.ai_type === 'gfpgan');
              const hasDdcolor = images.some((i) => i.parent_id === img.id && i.ai_type === 'ddcolor');

              return (
                <div className="enhance-buttons">
                  <button
                    onClick={() => triggerEnhancement(img.id, 'gfpgan')}
                    className="btn btn-enhance"
                    disabled={loading[img.id] === 'gfpgan' || hasGfpgan || enhancingImage !== null}
                  >
                    {enhancingImage === img.id && loading[img.id] === 'gfpgan' ? (
                      <span className="spinner">⏳</span>
                    ) : hasGfpgan ? (
                      'Már van javított kép'
                    ) : (
                      'GFPGAN javítás'
                    )}
                  </button>

                  <button
                    onClick={() => triggerEnhancement(img.id, 'ddcolor')}
                    className="btn btn-enhance"
                    disabled={loading[img.id] === 'ddcolor' || hasDdcolor || enhancingImage !== null}
                  >
                    {enhancingImage === img.id && loading[img.id] === 'ddcolor' ? (
                      <span className="spinner">⏳</span>
                    ) : hasDdcolor ? (
                      'Már van színezett kép'
                    ) : (
                      'DDColor színezés'
                    )}
                  </button>
                </div>
              );
            })()}
            <div className="post-actions">
              <button className="btn btn-save" onClick={() => handleUpdateImage(img.id)}>Mentés</button>
              <button className="btn btn-toggle" onClick={() => handleTogglePublic(img.id)}>
                {editFields[img.id]?.is_public ? 'Publikus visszavonása' : 'Publikussá tétel'}
              </button>
              <button className="btn btn-delete" onClick={() => handleDelete(img.id)}>Törlés</button>
            </div>
          </div>
        ))}
      </div>
      <div className="gallery-save-container">
        <button onClick={handleSave} className="btn btn-save">Galéria mentése</button>
      </div>
    </div>
  );
};

export default EditGallery;
