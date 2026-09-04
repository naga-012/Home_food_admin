import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, UtensilsCrossed, Trash2, Power, CheckCircle, XCircle, X, Filter, Plus } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import AddFoodModal from '../components/AddFoodModal';

const Foods = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'ALL';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { showSuccess, showError } = useToast();

  // Sync state if URL query param changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('ALL');
    }
  }, [searchParams]);

  const fetchFoods = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        adminApi.getFoods({
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: searchTerm || undefined,
        }),
        adminApi.getCategories(),
      ]);
      setFoods(fRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      showError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(fetchFoods, 250);
    return () => clearTimeout(handler);
  }, [selectedCategory, searchTerm]);

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    if (newCat === 'ALL') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: newCat });
    }
  };

  const handleClearCategory = () => {
    handleCategoryChange('ALL');
  };

  const handleToggleAvailability = async (food) => {
    try {
      await adminApi.updateFoodStatus(food.id, { is_available: !food.is_available });
      showSuccess(`"${food.name}" is now ${!food.is_available ? 'Available' : 'Disabled'}`);
      await fetchFoods();
    } catch (err) {
      showError('Failed to update food status');
    }
  };

  const handleConfirmDelete = async () => {
    if (!foodToDelete) return;
    setActionLoading(true);
    try {
      await adminApi.deleteFood(foodToDelete.id);
      showSuccess(`"${foodToDelete.name}" deleted successfully`);
      setDeleteModalOpen(false);
      setFoodToDelete(null);
      await fetchFoods();
    } catch (err) {
      showError('Failed to delete food item');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Menu & Food Catalog Oversight
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Browse meals across all kitchens, toggle availability, and moderate listings
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search dishes or recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            style={{ width: '190px' }}
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name} ({cat.food_count})</option>
            ))}
          </select>

          <button
            onClick={() => setAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
          >
            <Plus size={18} />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Active Category Filter Tag Banner */}
      {selectedCategory !== 'ALL' && (
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={16} color="#ea580c" />
            <span style={{ fontSize: '0.875rem', color: '#9a3412', fontWeight: 600 }}>
              Showing only <strong>{selectedCategory}</strong> dishes ({foods.length} items found)
            </span>
          </div>

          <button
            onClick={handleClearCategory}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: '#ffffff',
              color: '#c2410c',
              borderColor: '#fdba74',
              gap: '6px',
            }}
          >
            <X size={14} />
            <span>Show All Categories</span>
          </button>
        </div>
      )}

      {/* Foods Table */}
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Dish</th>
              <th>Kitchen / Chef</th>
              <th>Category</th>
              <th>Price</th>
              <th>Food Type</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  Loading food items...
                </td>
              </tr>
            ) : foods.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍲</div>
                  <h3 style={{ fontSize: '1.05rem', color: '#0f172a' }}>No {selectedCategory !== 'ALL' ? selectedCategory : ''} Dishes Found</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                    No food items match the selected criteria.
                  </p>
                  {selectedCategory !== 'ALL' && (
                    <button
                      onClick={handleClearCategory}
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: '12px' }}
                    >
                      View All Categories
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              foods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={food.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=80'}
                        alt={food.name}
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          backgroundColor: '#f1f5f9',
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{food.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Prep: {food.preparation_time}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{food.kitchen_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{food.cook_name}</div>
                  </td>
                  <td>
                    <span style={{
                      backgroundColor: food.category?.toLowerCase() === 'biryani' ? '#ffedd5' : '#f1f5f9',
                      color: food.category?.toLowerCase() === 'biryani' ? '#c2410c' : '#475569',
                      border: food.category?.toLowerCase() === 'biryani' ? '1px solid #fed7aa' : 'none',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}>
                      {food.category}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>₹{food.price}</div>
                    {food.discount_price && (
                      <div style={{ fontSize: '0.75rem', color: '#16a34a', textDecoration: 'line-through' }}>
                        ₹{food.discount_price}
                      </div>
                    )}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      color: food.food_type === 'VEG' ? '#16a34a' : '#dc2626',
                    }}>
                      {food.food_type === 'VEG' ? '🌱 VEG' : '🍗 NON-VEG'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleAvailability(food)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: food.is_available ? '#dcfce7' : '#fee2e2',
                        color: food.is_available ? '#15803d' : '#b91c1c',
                      }}
                      title="Click to toggle availability"
                    >
                      <Power size={12} />
                      <span>{food.is_available ? 'Available' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setFoodToDelete(food);
                        setDeleteModalOpen(true);
                      }}
                      className="btn btn-outline btn-sm"
                      style={{ color: '#dc2626', borderColor: '#fee2e2' }}
                      title="Delete dish"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete "${foodToDelete?.name}"?`}
        message="Are you sure you want to permanently delete this dish listing from the platform? This cannot be undone."
        confirmText="Delete Dish"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setFoodToDelete(null);
        }}
      />

      <AddFoodModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onFoodAdded={fetchFoods}
        defaultCategory={selectedCategory}
      />
    </div>
  );
};

export default Foods;
