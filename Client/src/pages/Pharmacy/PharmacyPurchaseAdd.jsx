import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const PharmacyPurchaseAdd = () => {
  const [supplierName, setSupplierName] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0,10));

  const [medicines, setMedicines] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);

  const [items, setItems] = useState([
    { medicineId: '', quantity: 1, unitCost: 0, batchNumber: '', expiryDate: '', cgst: 0, sgst: 0, igst: 0 }
  ]);
  const [saving, setSaving] = useState(false);

  const loadMeds = async () => {
    try {
      setLoadingMeds(true);
      const { data } = await api.get('/pharmacy/medicines?limit=100&page=1');
      setMedicines(data.medicines || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load medicines');
    } finally {
      setLoadingMeds(false);
    }
  };

  useEffect(() => { loadMeds(); }, []);

  const addRow = () => setItems((arr)=> [...arr, { medicineId: '', quantity: 1, unitCost: 0, batchNumber: '', expiryDate: '', cgst: 0, sgst: 0, igst: 0 }]);
  const removeRow = (idx) => setItems((arr)=> arr.filter((_,i)=>i!==idx));

  const updateItem = (idx, key, val) => {
    setItems((arr)=> arr.map((it,i)=> i===idx ? { ...it, [key]: val } : it));
  };

  const computeLine = (it) => {
    const qty = Number(it.quantity)||0;
    const unit = Number(it.unitCost)||0;
    const base = qty * unit;
    const taxPct = (Number(it.cgst)||0) + (Number(it.sgst)||0) + (Number(it.igst)||0);
    const tax = base * (taxPct/100);
    return { base, tax, total: base + tax };
  };

  const totals = items.reduce((acc, it)=>{
    const { base, tax } = computeLine(it);
    acc.subtotal += base; acc.totalTax += tax; return acc;
  }, { subtotal: 0, totalTax: 0 });
  const grandTotal = totals.subtotal + totals.totalTax;

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (items.length === 0) return toast.warn('Add at least one item');
      for (const it of items) {
        if (!it.medicineId) return toast.warn('Select medicine for all items');
        if ((Number(it.quantity)||0) <= 0) return toast.warn('Quantity must be > 0');
        if ((Number(it.unitCost)||0) < 0) return toast.warn('Unit cost must be >= 0');
      }
      setSaving(true);
      await api.post('/pharmacy/purchases', { supplierName, billNumber, purchaseDate, items });
      toast.success('Purchase recorded');
      // reset minimal
      setSupplierName(''); setBillNumber(''); setItems([{ medicineId: '', quantity: 1, unitCost: 0, batchNumber: '', expiryDate: '', cgst: 0, sgst: 0, igst: 0 }]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save purchase');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Purchase</h1>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Supplier Name</label>
            <input className="w-full border rounded px-3 py-2" value={supplierName} onChange={(e)=>setSupplierName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bill/Invoice No</label>
            <input className="w-full border rounded px-3 py-2" value={billNumber} onChange={(e)=>setBillNumber(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Purchase Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={purchaseDate} onChange={(e)=>setPurchaseDate(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CGST %</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SGST %</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">IGST %</th>
                <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Line Total</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((it, idx)=> {
                const { total } = computeLine(it);
                return (
                  <tr key={idx}>
                    <td className="px-2 py-2 min-w-[220px]">
                      <select className="w-full border rounded px-2 py-2" value={it.medicineId} onChange={(e)=>updateItem(idx,'medicineId', e.target.value)} disabled={loadingMeds}>
                        <option value="">Select medicine</option>
                        {medicines.map((m)=> (
                          <option key={m._id} value={m._id}>{m.name} ({m.manufacturer||'N/A'})</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2"><input type="number" min={1} className="w-24 border rounded px-2 py-1 text-right" value={it.quantity} onChange={(e)=>updateItem(idx,'quantity', Number(e.target.value)||0)} /></td>
                    <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-28 border rounded px-2 py-1 text-right" value={it.unitCost} onChange={(e)=>updateItem(idx,'unitCost', Number(e.target.value)||0)} /></td>
                    <td className="px-2 py-2"><input className="w-28 border rounded px-2 py-1" value={it.batchNumber} onChange={(e)=>updateItem(idx,'batchNumber', e.target.value)} /></td>
                    <td className="px-2 py-2"><input type="date" className="w-36 border rounded px-2 py-1" value={it.expiryDate} onChange={(e)=>updateItem(idx,'expiryDate', e.target.value)} /></td>
                    <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-20 border rounded px-2 py-1 text-right" value={it.cgst} onChange={(e)=>updateItem(idx,'cgst', Number(e.target.value)||0)} /></td>
                    <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-20 border rounded px-2 py-1 text-right" value={it.sgst} onChange={(e)=>updateItem(idx,'sgst', Number(e.target.value)||0)} /></td>
                    <td className="px-2 py-2"><input type="number" min={0} step="0.01" className="w-20 border rounded px-2 py-1 text-right" value={it.igst} onChange={(e)=>updateItem(idx,'igst', Number(e.target.value)||0)} /></td>
                    <td className="px-2 py-2 text-right font-semibold">{total.toFixed(2)}</td>
                    <td className="px-2 py-2 text-right">
                      <button type="button" className="text-red-600 hover:text-red-800" onClick={()=>removeRow(idx)} disabled={items.length===1}>Remove</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          <button type="button" className="px-3 py-2 bg-gray-100 rounded border" onClick={addRow}>Add Item</button>
        </div>

        <div className="flex justify-end">
          <div className="w-full md:w-80 bg-gray-50 rounded p-4 border">
            <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-semibold">{totals.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm mt-1"><span className="text-gray-600">Tax</span><span className="font-semibold">{totals.totalTax.toFixed(2)}</span></div>
            <div className="flex justify-between text-base mt-2 border-t pt-2"><span className="text-gray-800">Grand Total</span><span className="font-bold">{grandTotal.toFixed(2)}</span></div>
          </div>
        </div>

        <div>
          <button disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">{saving? 'Saving...' : 'Save Purchase'}</button>
        </div>
      </form>
    </motion.div>
  );
};

export default PharmacyPurchaseAdd;
