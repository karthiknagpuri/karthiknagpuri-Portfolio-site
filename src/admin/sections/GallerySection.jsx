import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';

// Run this SQL in Supabase to add the additional_images column:
// ALTER TABLE gallery_images ADD COLUMN IF NOT EXISTS additional_images JSONB DEFAULT '[]'::jsonb;

const GallerySection = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]); // For multiple image preview
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    category: 'General',
    is_visible: true,
  });

  const theme = {
    bg: '#0a0a0a',
    surface: '#141414',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textMuted: '#888888',
    accent: '#C4785A',
    teal: '#4ECDC4',
    danger: '#FF6B6B',
  };

  const categories = [
    'Speaking', 'Journey', 'Team', 'Events',
    'Awards', 'Community', 'Partners', 'General',
  ];

  const sampleGalleryItems = [
    { title: 'TEDx CMRIT Hyderabad', caption: 'Speaking at TEDx CMRIT', category: 'Speaking', display_order: 0 },
    { title: 'Jagriti Yatra 2023', caption: 'Train journey across India', category: 'Journey', display_order: 1 },
    { title: 'EvolveX Demo Day', caption: 'Startup demo day event', category: 'Events', display_order: 2 },
    { title: 'Founder Circle Meetup', caption: 'Community gathering', category: 'Community', display_order: 3 },
    { title: 'Draper Startup House', caption: 'Partner collaboration', category: 'Partners', display_order: 4 },
    { title: 'Rural India Expedition', caption: 'Exploring rural India', category: 'Journey', display_order: 5 },
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const seedSampleData = async () => {
    try {
      for (const item of sampleGalleryItems) {
        // Try with additional_images first
        const result = await supabase.from('gallery_images').insert([{
          ...item,
          image_url: '',
          additional_images: [],
          is_visible: true,
        }]);

        // If column doesn't exist, try without it
        if (result.error?.message?.includes('additional_images')) {
          await supabase.from('gallery_images').insert([{
            ...item,
            image_url: '',
            is_visible: true,
          }]);
        }
      }
      fetchImages();
    } catch (error) {
      console.error('Error seeding data:', error);
      alert('Error seeding data. Please try again.');
    }
  };

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.log('Error fetching gallery images:', error);
      setImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(Array.from(e.target.files));
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle multiple file uploads
  const handleMultipleFiles = async (files) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert('Please upload image files');
      return;
    }

    const oversizedFiles = imageFiles.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files are larger than 5MB and will be skipped');
    }

    const validFiles = imageFiles.filter(f => f.size <= 5 * 1024 * 1024);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const newImages = [];
      for (let i = 0; i < validFiles.length; i++) {
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
        const base64 = await fileToBase64(validFiles[i]);
        newImages.push(base64);
      }

      // Add to existing uploaded images
      setUploadedImages(prev => [...prev, ...newImages]);
      setUploadProgress(100);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove an uploaded image from preview
  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Save gallery item with all images
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      alert('Please enter a title');
      return;
    }

    try {
      if (isEditing) {
        // Get existing images
        const existingItem = images.find(img => img.id === isEditing);
        const existingImages = existingItem?.additional_images || [];

        // Combine existing + new uploaded images
        const allAdditionalImages = [...existingImages, ...uploadedImages.slice(1)];
        const primaryImage = uploadedImages[0] || existingItem?.image_url || '';

        // Try with additional_images first, fallback without it
        let error;
        const updateData = {
          title: formData.title,
          caption: formData.caption,
          category: formData.category,
          is_visible: formData.is_visible,
          image_url: primaryImage,
          updated_at: new Date().toISOString(),
        };

        // Try with additional_images column
        const result1 = await supabase
          .from('gallery_images')
          .update({
            ...updateData,
            additional_images: uploadedImages.length > 1 ? uploadedImages.slice(1) : allAdditionalImages,
          })
          .eq('id', isEditing);

        if (result1.error?.message?.includes('additional_images')) {
          // Column doesn't exist, try without it
          const result2 = await supabase
            .from('gallery_images')
            .update(updateData)
            .eq('id', isEditing);
          error = result2.error;
        } else {
          error = result1.error;
        }

        if (error) throw error;
      } else {
        // Create new gallery item - try with additional_images first
        const insertData = {
          title: formData.title,
          caption: formData.caption,
          category: formData.category,
          is_visible: formData.is_visible,
          image_url: uploadedImages[0] || '',
          display_order: images.length,
        };

        const result1 = await supabase
          .from('gallery_images')
          .insert([{
            ...insertData,
            additional_images: uploadedImages.slice(1),
          }]);

        let error;
        if (result1.error?.message?.includes('additional_images')) {
          // Column doesn't exist, try without it
          const result2 = await supabase
            .from('gallery_images')
            .insert([insertData]);
          error = result2.error;
          if (!error && uploadedImages.length > 1) {
            alert('Saved with primary image only. Run this SQL in Supabase to enable multiple images:\n\nALTER TABLE gallery_images ADD COLUMN additional_images JSONB DEFAULT \'[]\'::jsonb;');
          }
        } else {
          error = result1.error;
        }

        if (error) throw error;
      }

      fetchImages();
      resetForm();
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Error saving: ' + error.message);
    }
  };

  // Add more images to existing gallery item (reserved for future use)
  const _addImagesToItem = async (itemId, newImages) => {
    try {
      const item = images.find(img => img.id === itemId);
      if (!item) return;

      const existingAdditional = item.additional_images || [];
      const updatedAdditional = [...existingAdditional, ...newImages];

      const { error } = await supabase
        .from('gallery_images')
        .update({
          additional_images: updatedAdditional,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error adding images:', error);
    }
  };

  // Remove a specific image from gallery item (reserved for future use)
  const _removeImageFromItem = async (itemId, imageIndex) => {
    try {
      const item = images.find(img => img.id === itemId);
      if (!item) return;

      if (imageIndex === 0) {
        // Removing primary image - promote first additional to primary
        const additional = item.additional_images || [];
        const newPrimary = additional[0] || '';
        const newAdditional = additional.slice(1);

        const { error } = await supabase
          .from('gallery_images')
          .update({
            image_url: newPrimary,
            additional_images: newAdditional,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId);

        if (error) throw error;
      } else {
        // Removing additional image
        const additional = item.additional_images || [];
        const newAdditional = additional.filter((_, i) => i !== imageIndex - 1);

        const { error } = await supabase
          .from('gallery_images')
          .update({
            additional_images: newAdditional,
            updated_at: new Date().toISOString(),
          })
          .eq('id', itemId);

        if (error) throw error;
      }

      fetchImages();
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const deleteGalleryItem = async (item) => {
    if (!confirm('Delete this entire gallery item?')) return;
    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', item.id);
      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const editImage = (image) => {
    setIsEditing(image.id);
    setFormData({
      title: image.title,
      caption: image.caption || '',
      category: image.category,
      is_visible: image.is_visible,
    });
    // Load existing images into preview
    const allImages = [image.image_url, ...(image.additional_images || [])].filter(Boolean);
    setUploadedImages(allImages);
  };

  const resetForm = () => {
    setIsEditing(null);
    setFormData({ title: '', caption: '', category: 'General', is_visible: true });
    setUploadedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleVisibility = async (image) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ is_visible: !image.is_visible })
        .eq('id', image.id);
      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  // Get all images for a gallery item
  const getAllImages = (item) => {
    const imgs = [item.image_url, ...(item.additional_images || [])].filter(Boolean);
    return imgs;
  };

  const _formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: '24px',
          fontStyle: 'italic',
          color: theme.text,
          margin: '0 0 4px 0',
        }}>
          Gallery
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: theme.textMuted,
          margin: 0,
        }}>
          Manage gallery items with multiple images (auto-slides on landing page)
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Form */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: theme.textMuted,
            letterSpacing: '2px',
            margin: '0 0 20px 0',
          }}>
            {isEditing ? 'EDIT GALLERY ITEM' : 'ADD NEW GALLERY ITEM'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Multi-image Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                border: `2px dashed ${dragActive ? theme.accent : theme.border}`,
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                marginBottom: '16px',
                cursor: 'pointer',
                background: dragActive ? 'rgba(196, 120, 90, 0.1)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                onClick={(e) => e.stopPropagation()}
                style={{ display: 'none' }}
              />
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: theme.textMuted,
              }}>
                {isUploading ? (
                  <div>
                    <div style={{ marginBottom: '8px' }}>Processing... {uploadProgress}%</div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: theme.bg,
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${uploadProgress}%`,
                        height: '100%',
                        background: theme.accent,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                    <div>Drop multiple images or click to upload</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
                      Select multiple files for auto-sliding gallery
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Image Preview Grid */}
            {uploadedImages.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '11px',
                  color: theme.textMuted,
                  marginBottom: '8px',
                }}>
                  {uploadedImages.length} IMAGE{uploadedImages.length > 1 ? 'S' : ''} SELECTED
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}>
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} style={{
                      position: 'relative',
                      aspectRatio: '1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: idx === 0 ? `2px solid ${theme.teal}` : `1px solid ${theme.border}`,
                    }}>
                      <img src={img} alt="" style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }} />
                      {idx === 0 && (
                        <div style={{
                          position: 'absolute',
                          top: '4px',
                          left: '4px',
                          background: theme.teal,
                          color: theme.bg,
                          padding: '2px 4px',
                          borderRadius: '3px',
                          fontSize: '8px',
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          MAIN
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeUploadedImage(idx);
                        }}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: theme.danger,
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                TITLE *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
                placeholder="e.g., TEDx Talk"
              />
            </div>

            {/* Caption */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                CAPTION
              </label>
              <textarea
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
                placeholder="Brief description"
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontFamily: "'Space Mono', monospace",
                fontSize: '11px',
                color: theme.textMuted,
                marginBottom: '8px',
              }}>
                CATEGORY
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  background: theme.bg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '12px',
                  color: theme.text,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '13px',
                  boxSizing: 'border-box',
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              marginBottom: '20px',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.is_visible}
                onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
              />
              Visible on site
            </label>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: theme.accent,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {isEditing ? 'UPDATE' : 'CREATE'} GALLERY ITEM
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '6px',
                    padding: '12px 20px',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '12px',
                    color: theme.textMuted,
                    cursor: 'pointer',
                  }}
                >
                  CANCEL
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Gallery Items List */}
        <div style={{
          background: theme.surface,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${theme.border}`,
          }}>
            <h2 style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '12px',
              color: theme.textMuted,
              letterSpacing: '2px',
              margin: 0,
            }}>
              GALLERY ITEMS ({images.length})
            </h2>
          </div>

          {isLoading ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              fontFamily: "'Space Mono', monospace",
              fontSize: '13px',
              color: theme.textMuted,
            }}>
              Loading...
            </div>
          ) : images.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '13px',
                color: theme.textMuted,
                marginBottom: '16px',
              }}>
                No gallery items yet.
              </div>
              <button
                onClick={seedSampleData}
                style={{
                  background: theme.teal,
                  color: theme.bg,
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                SEED SAMPLE DATA
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
              padding: '16px',
            }}>
              {images.map((item) => {
                const allImgs = getAllImages(item);
                return (
                  <div
                    key={item.id}
                    style={{
                      background: theme.bg,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `1px solid ${theme.border}`,
                      opacity: item.is_visible ? 1 : 0.5,
                    }}
                  >
                    {/* Image carousel preview */}
                    <div style={{
                      position: 'relative',
                      aspectRatio: '16/10',
                      background: '#1a1a1a',
                    }}>
                      {allImgs.length > 0 ? (
                        <>
                          <img
                            src={allImgs[0]}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          {allImgs.length > 1 && (
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: theme.teal,
                              color: theme.bg,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontFamily: "'Space Mono', monospace",
                            }}>
                              {allImgs.length} IMAGES
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: theme.textMuted,
                          fontSize: '24px',
                        }}>
                          📷
                        </div>
                      )}
                      {!item.is_visible && (
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: theme.textMuted,
                          color: theme.bg,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontFamily: "'Space Mono', monospace",
                        }}>
                          HIDDEN
                        </div>
                      )}
                    </div>

                    {/* Item info */}
                    <div style={{ padding: '12px' }}>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px',
                        color: theme.text,
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        color: theme.accent,
                        marginBottom: '8px',
                      }}>
                        {item.category}
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => toggleVisibility(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.teal,
                            cursor: 'pointer',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            padding: '4px',
                          }}
                        >
                          {item.is_visible ? 'HIDE' : 'SHOW'}
                        </button>
                        <button
                          onClick={() => editImage(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.accent,
                            cursor: 'pointer',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            padding: '4px',
                          }}
                        >
                          EDIT
                        </button>
                        <button
                          onClick={() => deleteGalleryItem(item)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: theme.danger,
                            cursor: 'pointer',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            padding: '4px',
                          }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GallerySection;
