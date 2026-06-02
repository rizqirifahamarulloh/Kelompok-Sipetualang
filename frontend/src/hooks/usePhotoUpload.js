import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook untuk mengelola upload foto ulasan (create & edit).
 * Menghindari duplikasi handler di review & edit review modal.
 */
export function usePhotoUpload(maxPhotos = 5) {
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) {
      toast.error(`Maksimal ${maxPhotos} foto`);
      return;
    }
    const newFiles = files.slice(0, remaining);
    setPhotos(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const remove = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const reset = (initialPreviews = []) => {
    setPhotos([]);
    setPreviews(initialPreviews);
  };

  return { photos, previews, handleChange, remove, reset };
}
