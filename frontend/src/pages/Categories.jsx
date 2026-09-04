import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tags, Utensils, ArrowRight, Plus } from 'lucide-react';
import { adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import AddFoodModal from '../components/AddFoodModal';

const CATEGORY_ICONS = {
  'Breakfast': '🥞',
  'Lunch': '🍛',
  'Dinner': '🥘',
  'Biryani': '🍗',
  'Snacks': '🥟',
  'Desserts': '🍮',
  'Healthy Food': '🥗',
  'South Indian': '🫓',
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const { showError } = useToast();

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      showError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Food Category Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Overview of food categories dynamically grouped across home chef kitchens. Click any category to view its dishes.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={18} />
          <span>Add New Food Item</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
      }}>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', gridColumn: '1 / -1' }}>
            Loading categories...
          </div>
        ) : (
          categories.map((cat) => {
            const icon = CATEGORY_ICONS[cat.name] || '🍲';

            return (
              <div
                key={cat.name}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border-subtle)',
                }}
                onClick={() => navigate(`/admin/foods?category=${encodeURIComponent(cat.name)}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ea580c';
                  e.currentTarget.style.boxShadow = '0 10px 20px -3px rgba(234, 88, 12, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: '#fff7ed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                  }}>
                    {icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      {cat.food_count} listed dish{cat.food_count !== 1 ? 'es' : ''}
                    </p>
                  </div>
                </div>

                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c',
                  transition: 'background 0.2s ease',
                }}>
                  <ArrowRight size={18} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddFoodModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onFoodAdded={fetchCategories}
      />
    </div>
  );
};

export default Categories;
