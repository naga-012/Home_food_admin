import React, { useState, useEffect } from 'react';
import { X, UtensilsCrossed, Plus, Loader2, Sparkles, Image as ImageIcon, Clock } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PRESET_IMAGES = [
  {
    name: 'Biryani',
    url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
    type: 'NON_VEG',
    category: 'Biryani'
  },
  {
    name: 'Veg Biryani',
    url: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Biryani'
  },
  {
    name: 'Curry / Masala',
    url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Lunch'
  },
  {
    name: 'South Indian Dosa',
    url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Breakfast'
  },
  {
    name: 'Chicken Roast',
    url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&auto=format&fit=crop&q=60',
    type: 'NON_VEG',
    category: 'Dinner'
  },
  {
    name: 'Indian Desserts',
    url: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Desserts'
  },
  {
    name: 'Healthy Bowl / Salad',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Healthy Food'
  },
  {
    name: 'Snacks / Samosa',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60',
    type: 'VEG',
    category: 'Snacks'
  },
];

const DEFAULT_CATEGORIES = [
  'Biryani',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snacks',
  'Desserts',
  'Healthy Food',
  'South Indian',
];

const AddFoodModal = ({ isOpen, onClose, onFoodAdded, defaultCategory = 'Biryani' }) => {
  const { showSuccess, showError } = useToast();

  const [cooks, setCooks] = useState([]);
  const [loadingCooks, setLoadingCooks] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cookId, setCookId] = useState('');
  const [category, setCategory] = useState(defaultCategory !== 'ALL' ? defaultCategory : 'Biryani');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [foodType, setFoodType] = useState('VEG'); // 'VEG' | 'NON_VEG'
  const [preparationTime, setPreparationTime] = useState('30 mins');
  const [quantity, setQuantity] = useState('15');
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isTodayMenu, setIsTodayMenu] = useState(true);
  const [isEveningOffer, setIsEveningOffer] = useState(false);

  // Load verified cooks for dropdown
  useEffect(() => {
    if (!isOpen) return;

    const fetchCooks = async () => {
      setLoadingCooks(true);
      try {
        const res = await adminApi.getCooks();
        const activeCooks = res.data || [];
        setCooks(activeCooks);
        if (activeCooks.length > 0 && !cookId) {
          setCookId(activeCooks[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load cooks', err);
      } finally {
        setLoadingCooks(false);
      }
    };

    fetchCooks();

    // Set initial category if specified
    if (defaultCategory && defaultCategory !== 'ALL') {
      setCategory(defaultCategory);
    }
  }, [isOpen, defaultCategory]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setImageUrl(preset.url);
    setFoodType(preset.type);
    if (!category || category === 'ALL') {
      setCategory(preset.category);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showError('Please enter the dish name');
      return;
    }
    if (!cookId) {
      showError('Please select a home kitchen / chef');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      showError('Please specify a category');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        cook_id: parseInt(cookId, 10),
        category: finalCategory,
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        food_type: foodType,
        preparation_time: preparationTime.trim() || '30 mins',
        quantity: parseInt(quantity, 10) || 10,
        image_url: imageUrl.trim() || null,
        description: description.trim() || null,
        is_available: isAvailable,
        is_today_menu: isTodayMenu,
        is_evening_offer: isEveningOffer,
      };

      await adminApi.createFood(payload);
      showSuccess(`Dish "${payload.name}" successfully added to the menu!`);

      // Reset form
      setName('');
      setPrice('');
      setDiscountPrice('');
      setDescription('');

      if (onFoodAdded) {
        onFoodAdded();
      }
      onClose();
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.detail || 'Failed to create food item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#fafafa',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
            }}>
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Add New Food Item
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                List a fresh meal under a home kitchen catalog
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Dish Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Dish Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Special Hyderabadi Mutton Dum Biryani"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              style={{ width: '100%', fontSize: '0.95rem' }}
              required
            />
          </div>

          {/* Kitchen & Category Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Kitchen */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Home Kitchen / Chef <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={cookId}
                onChange={(e) => setCookId(e.target.value)}
                className="form-select"
                style={{ width: '100%' }}
                required
                disabled={loadingCooks}
              >
                {loadingCooks ? (
                  <option>Loading kitchens...</option>
                ) : cooks.length === 0 ? (
                  <option value="">No kitchens available</option>
                ) : (
                  cooks.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.kitchen_name} ({c.name})
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Category */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ea580c',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {isCustomCategory ? 'Choose Existing' : '+ Custom'}
                </button>
              </div>

              {isCustomCategory ? (
                <input
                  type="text"
                  placeholder="e.g. Starters, Tandoor..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                  required
                />
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select"
                  style={{ width: '100%' }}
                  required
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Pricing & Food Type Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {/* Price */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Selling Price (₹) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                placeholder="249"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
                required
              />
            </div>

            {/* Discount Price */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Offer Price (₹) <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Opt)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="199"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Food Type (Veg / Non-Veg) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Food Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFoodType('VEG')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: foodType === 'VEG' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    backgroundColor: foodType === 'VEG' ? '#f0fdf4' : '#ffffff',
                    color: foodType === 'VEG' ? '#15803d' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🌱 VEG
                </button>
                <button
                  type="button"
                  onClick={() => setFoodType('NON_VEG')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    border: foodType === 'NON_VEG' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                    backgroundColor: foodType === 'NON_VEG' ? '#fef2f2' : '#ffffff',
                    color: foodType === 'NON_VEG' ? '#b91c1c' : '#64748b',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  🍗 NON-VEG
                </button>
              </div>
            </div>
          </div>

          {/* Prep Time & Quantity Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Preparation Time
              </label>
              <input
                type="text"
                placeholder="e.g. 30 mins, 45 mins"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                Initial Daily Stock (Portions)
              </label>
              <input
                type="number"
                min="1"
                placeholder="15"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="form-input"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Image Presets & URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                Dish Image URL
              </label>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Pick a preset below or paste custom URL</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
              {PRESET_IMAGES.map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    border: imageUrl === p.url ? '2px solid #ea580c' : '1px solid #e2e8f0',
                    backgroundColor: imageUrl === p.url ? '#fff7ed' : '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: imageUrl === p.url ? '#c2410c' : '#475569',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <img src={p.url} alt={p.name} style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }} />
                  {p.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                backgroundColor: '#f8fafc',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'; }}
                  />
                ) : (
                  <ImageIcon size={22} color="#94a3b8" />
                )}
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
              Description & Special Ingredients
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Slow-cooked authentic spiced dum biryani served with mirchi ka salan and raita..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Feature Toggles */}
          <div style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            padding: '14px 18px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
              />
              Available for Ordering Now
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isTodayMenu}
                onChange={(e) => setIsTodayMenu(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
              />
              Featured in Today's Special
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={isEveningOffer}
                onChange={(e) => setIsEveningOffer(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#ea580c' }}
              />
              Evening Special Deal
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '150px', justifyContent: 'center' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Adding Item...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add Food Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFoodModal;
