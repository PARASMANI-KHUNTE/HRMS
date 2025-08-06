import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import Pagination from '../components/Pagination';

// Add/Edit Admin Modal
function AdminModal({ isOpen, onClose, onSave, admin, hospitals }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', hospital: '' });
  const isEditMode = !!admin;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && admin) {
        setFormData({
          firstName: admin.firstName || '',
          lastName: admin.lastName || '',
          email: admin.email || '',
          phone: admin.phone || '',
          password: '', // Always clear password for security
          hospital: admin.hospitalId?._id || ''
        });
      } else {
        // Reset form for adding a new admin
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', hospital: '' });
      }
    }
  }, [isOpen, admin, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: admin?._id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">{isEditMode ? 'Edit Admin' : 'Add New Admin'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          </div>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditMode ? 'New Password (optional)' : 'Password'} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required={!isEditMode} />
          <select name="hospital" value={formData.hospital} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
            <option value="">Assign to Hospital</option>
            {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
          </select>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditMode ? 'Save Changes' : 'Add Admin'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, adminName }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center">
                <FaExclamationTriangle className="mx-auto text-red-500 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Confirm Deletion</h2>
                <p className="text-gray-600 mt-2 mb-6">Are you sure you want to delete the admin <strong className='text-indigo-700'>{adminName}</strong>? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function SuperadminAdmins() {
  const [admins, setAdmins] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [adminsPerPage] = useState(10);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, hospitalsRes] = await Promise.all([
        api.get('/auth/getallusers'),
        api.get('/hospital/getall')
      ]);
      setAdmins(adminsRes.data || []);
      setHospitals(hospitalsRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins
      .filter(admin => admin.role !== 'superadmin')
      .filter(admin => {
        const searchTermLower = searchTerm.toLowerCase();
        const nameMatch = (admin.firstName && admin.firstName.toLowerCase().includes(searchTermLower)) ||
                          (admin.lastName && admin.lastName.toLowerCase().includes(searchTermLower));
        const emailMatch = admin.email && admin.email.toLowerCase().includes(searchTermLower);
        const matchesSearch = nameMatch || emailMatch;
        const matchesHospital = selectedHospital ? admin.hospitalId?._id === selectedHospital : true;
        return matchesSearch && matchesHospital;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [admins, searchTerm, selectedHospital]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedHospital]);

  // Pagination Logic
  const indexOfLastAdmin = currentPage * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSaveAdmin = async (adminData) => {
    try {
      let response;
      if (adminData._id) {
        // Update existing admin
        response = await api.put('/auth/update', adminData);
        toast.success('Admin updated successfully!');
      } else {
        // Add new admin with explicit role
        const newAdminData = { ...adminData, role: 'admin' };
        response = await api.post('/auth/register', newAdminData);
        toast.success('Admin added successfully!');
      }

      // Refetch all data to ensure consistency
      fetchData();
      setIsModalOpen(false);
      setEditingAdmin(null);

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save admin.');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    try {
      // Correct the API endpoint for deletion
      await api.delete('/auth/delete', { data: { email: deletingAdmin.email } });
      toast.success('Admin deleted successfully!');
      setAdmins(prev => prev.filter(a => a._id !== deletingAdmin._id));
      setIsDeleteModalOpen(false);
      setDeletingAdmin(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete admin.');
    }
  };

  const openAddModal = () => {
    console.log('Hospitals in state when opening modal:', hospitals);
    setEditingAdmin(null);
    setIsModalOpen(true);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setIsModalOpen(true);
  };

  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Admins Management</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          <FaPlus /> Add Admin
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-xs">
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <select 
          value={selectedHospital}
          onChange={e => setSelectedHospital(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Hospitals</option>
          {hospitals.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
        </select>
      </div>

      {currentAdmins.length === 0 && !loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Admins Found</h3>
          <p className="text-gray-500 mt-2">There are no admins matching your criteria. Try adjusting your filters or add a new one.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Hospital</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentAdmins.map(admin => (
                <tr key={admin._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{`${admin.firstName} ${admin.lastName}`}</td>
                  <td className="py-3 px-6">{admin.email}</td>
                  <td className="py-3 px-6">{admin.phone}</td>
                  <td className="py-3 px-6">{admin.hospitalId?.name || <span className='text-gray-400'>N/A</span>}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => openEditModal(admin)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit"><FaEdit /></button>
                      <button onClick={() => openDeleteModal(admin)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredAdmins.length > adminsPerPage && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <AdminModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveAdmin} admin={editingAdmin} hospitals={hospitals} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteAdmin} adminName={deletingAdmin ? `${deletingAdmin.firstName} ${deletingAdmin.lastName}` : ''} />
    </div>
  );
}
