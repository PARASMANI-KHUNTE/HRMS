import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import Pagination from '../components/Pagination';

// Add/Edit Patient Modal
function PatientModal({ isOpen, onClose, onSave, patient, hospitals }) {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', hospital: '' });
  const isEditMode = !!patient;

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && patient) {
        setFormData({
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          email: patient.email || '',
          phone: patient.phone || '',
          password: '', // Always clear password for security
          hospital: patient.hospitalId?._id || ''
        });
      } else {
        setFormData({ firstName: '', lastName: '', email: '', phone: '', password: '', hospital: '' });
      }
    }
  }, [isOpen, patient, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, _id: patient?._id });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">{isEditMode ? 'Edit Patient' : 'Add New Patient'}</h2>
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
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">{isEditMode ? 'Save Changes' : 'Add Patient'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, patientName }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4 text-center">
                <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Deletion</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete the patient <strong className="font-semibold">{patientName}</strong>? This action cannot be undone.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
                </div>
            </div>
        </div>
    );
}

export default function SuperadminPatients() {
  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(null);

  // Server-side pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    fetchData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on new search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchData = async (page, search) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search };
      const [patientsRes, hospitalsRes] = await Promise.all([
        api.get('/reception/patient/getall', { params }),
        api.get('/hospital/getall')
      ]);
      setPatients(patientsRes.data.patients);
      setTotalPages(patientsRes.data.totalPages);
      setHospitals(hospitalsRes.data.hospitals);
    } catch (error) {
      toast.error('Failed to fetch data.');
      console.error(error);
    }
    setLoading(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
    }
  };

  const handleSavePatient = async (patientData) => {
    setLoading(true);
    try {
      let response;
      const payload = { ...patientData, hospitalId: patientData.hospital };
      delete payload.hospital; // Clean up payload

      if (editingPatient) {
        // Edit existing patient
        payload.id = editingPatient._id;
        response = await api.put(`/patient/update`, payload);
        setUsers(prev => prev.map(p => p._id === response.data.patient._id ? response.data.patient : p));
        toast.success('Patient updated successfully!');
      } else {
        // Add new patient
        response = await api.post('/patient/create', payload);
        setUsers(prev => [response.data.patient, ...prev]);
        toast.success('Patient added successfully!');
      }
      setIsModalOpen(false);
      setEditingPatient(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save patient.');
    }
    setLoading(false);
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;
    setLoading(true);
    try {
      await api.delete('/patient/delete', { data: { id: deletingPatient._id } });
      setUsers(prev => prev.filter(u => u._id !== deletingPatient._id));
      toast.success('Patient deleted successfully.');
      setIsDeleteModalOpen(false);
      setDeletingPatient(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete patient.');
    }
    setLoading(false);
  };

  const openAddModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const openDeleteModal = (patient) => {
    setDeletingPatient(patient);
    setIsDeleteModalOpen(true);
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Patients Management</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          <FaPlus /> Add Patient
        </button>
      </div>
      
      <div className="flex justify-between items-center mb-6 gap-4">
        <div className="relative w-full max-w-md">
          <input 
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {patients.length === 0 && !loading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-700">No Patients Found</h3>
          <p className="text-gray-500 mt-2">There are no patients matching your criteria. Try adding a new one.</p>
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
              {patients.map(p => (
                <tr key={p._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{`${p.firstName} ${p.lastName}`}</td>
                  <td className="py-3 px-6">{p.email}</td>
                  <td className="py-3 px-6">{p.phone}</td>
                  <td className="py-3 px-6">{p.hospitalId?.name || <span className='text-gray-400'>N/A</span>}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => openEditModal(p)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit"><FaEdit /></button>
                      <button onClick={() => openDeleteModal(p)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <PatientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSavePatient} patient={editingPatient} hospitals={hospitals} />
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeletePatient} patientName={deletingPatient ? `${deletingPatient.firstName} ${deletingPatient.lastName}` : ''} />
    </div>
  );
}
