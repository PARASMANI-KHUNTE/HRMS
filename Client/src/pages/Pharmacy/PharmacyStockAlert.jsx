import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const PharmacyStockAlert = () => {
  const [threshold, setThreshold] = useState(10);
  const [search, setSearch] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/pharmacy/medicines/low-stock?threshold=${threshold}&page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setMedicines(data.medicines || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load low stock medicines');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Medicine Stock Alert</h1>

      <form onSubmit={onSearch} className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Threshold</label>
          <input type="number" min={0} className="border rounded px-3 py-2 w-28" value={threshold} onChange={(e)=>setThreshold(Number(e.target.value)||0)} />
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input className="border rounded px-3 py-2 w-full" placeholder="Search by name/manufacturer/category" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded">Apply</button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Min Threshold</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
            ) : medicines.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-gray-500">No low stock medicines</td></tr>
            ) : medicines.map((m)=> (
              <tr key={m._id}>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{m.manufacturer || '-'}</td>
                <td className="px-4 py-2 text-right font-semibold">{m.stockQuantity}</td>
                <td className="px-4 py-2 text-right">{threshold}</td>
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
    </motion.div>
  );
};

export default PharmacyStockAlert;
