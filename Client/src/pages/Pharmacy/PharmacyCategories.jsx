import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const PharmacyCategories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/pharmacy/categories?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setCategories(data.categories || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn('Name is required');
    try {
      setSaving(true);
      await api.post('/pharmacy/categories', { name: name.trim(), description });
      setName(''); setDescription('');
      toast.success('Category added');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/pharmacy/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Medicine Categories</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={onSearch} className="mb-4 flex gap-2">
            <input className="flex-1 border rounded px-3 py-2" placeholder="Search categories..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            <button className="px-4 py-2 bg-indigo-600 text-white rounded">Search</button>
          </form>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="3" className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan="3" className="text-center py-8 text-gray-500">No categories</td></tr>
                ) : categories.map((c)=> (
                  <tr key={c._id}>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{c.description || '-'}</td>
                    <td className="px-4 py-2">
                      <button onClick={()=>remove(c._id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button className="px-3 py-2 bg-gray-100 rounded border" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
            <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
            <button className="px-3 py-2 bg-gray-100 rounded border" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-gray-800 mb-3">Add Category</h2>
          <form onSubmit={addCategory} className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input className="w-full border rounded px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)} />
            </div>
            <button disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{saving? 'Saving...' : 'Add Category'}</button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

export default PharmacyCategories;
