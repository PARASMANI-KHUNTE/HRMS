import React, { useEffect, useState } from 'react';
import { FaPlus, FaTrash, FaEdit, FaTimes, FaExclamationTriangle, FaBuilding } from 'react-icons/fa';
import api from '../utils/api';
import { toast } from 'react-toastify';

// AddHospitalModal Component Definition
function AddHospitalModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ name: '', address: '', phone: '', email: '' }); // Reset form
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Add New Hospital</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="add-name" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <input type="text" name="name" id="add-name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="add-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" id="add-address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="add-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" id="add-phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="add-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" id="add-email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">Add Hospital</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// EditHospitalModal Component Definition
function EditHospitalModal({ isOpen, onClose, onSave, hospital }) {
  const [formData, setFormData] = useState({ name: '', address: '', phone: '', email: '' });

  useEffect(() => {
    if (hospital) {
      setFormData({
        name: hospital.name || '',
        address: hospital.address || '',
        phone: hospital.phone || '',
        email: hospital.email || '',
      });
    }
  }, [hospital]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Edit Hospital</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <input type="text" name="name" id="edit-name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input type="text" name="address" id="edit-address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" id="edit-phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" id="edit-email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Assign Departments Modal
function AssignDepartmentsModal({ isOpen, onClose, onSave, hospital }) {
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchDepartments = async () => {
        setLoading(true);
        try {
          const { data } = await api.get('/department/getall');
          setAllDepartments(data || []);
          // Pre-select departments that are already assigned to the hospital
          const assignedDeptIds = hospital?.departments?.map(dept => dept._id) || [];
          setSelectedDepartments(assignedDeptIds);
        } catch (error) {
          toast.error('Failed to fetch departments.');
        } finally {
          setLoading(false);
        }
      };
      fetchDepartments();
    }
  }, [isOpen, hospital]);

  const handleCheckboxChange = (deptId) => {
    setSelectedDepartments(prev => 
      prev.includes(deptId) ? prev.filter(id => id !== deptId) : [...prev, deptId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(hospital._id, selectedDepartments);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">Assign Departments to {hospital?.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        {loading ? (
          <p>Loading departments...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {allDepartments.map(dept => (
                <div key={dept._id} className="flex items-center p-3 rounded-lg hover:bg-gray-100">
                  <input 
                    type="checkbox" 
                    id={`dept-${dept._id}`}
                    checked={selectedDepartments.includes(dept._id)}
                    onChange={() => handleCheckboxChange(dept._id)}
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor={`dept-${dept._id}`} className="ml-3 text-md text-gray-700 font-medium cursor-pointer">
                    {dept.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 font-semibold">Save Assignments</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// DeleteConfirmationModal Component Definition
function DeleteConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm m-4 text-center">
        <div className="flex justify-center text-red-500 mb-4">
            <FaExclamationTriangle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Are you sure?</h2>
        <p className="text-gray-600 mb-6">This action cannot be undone. All data associated with this hospital will be permanently deleted.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-800 bg-gray-200 hover:bg-gray-300 font-semibold">Cancel</button>
          <button onClick={onConfirm} className="px-6 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold">Delete</button>
        </div>
      </div>
    </div>
  );
}


// Main SuperadminHospitals Component
export default function SuperadminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [hospitalForAssignment, setHospitalForAssignment] = useState(null);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/hospital/getall');
      setHospitals(data || []); // Corrected: API returns a direct array
    } catch (error) {
      toast.error('Failed to fetch hospitals');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (hospitalData) => {
    try {
      const response = await api.post('/hospital/create', hospitalData);
      if (response.data) {
        toast.success('Hospital added successfully!');
        setIsAddModalOpen(false);
        fetchHospitals();
      }
    } catch (error) {
      console.error('Failed to add hospital:', error);
      toast.error(error.response?.data?.message || 'Failed to add hospital');
    }
  };

  const handleEditClick = (hospital) => {
    setSelectedHospital(hospital);
    setIsEditModalOpen(true);
  };

  const handleAssignClick = (hospital) => {
    setHospitalForAssignment(hospital);
    setIsAssignModalOpen(true);
  };

  const handleAssignDepartments = async (hospitalId, departmentIds) => {
    console.log('Saving department assignments:', { hospitalId, departmentIds }); // DEBUG LOG
    try {
      await api.put('/hospital/assign-departments', { hospitalId, departmentIds });
      toast.success('Departments assigned successfully!');
      fetchHospitals(); // Refresh the data
      setIsAssignModalOpen(false);
      setHospitalForAssignment(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign departments.');
    }
  };

  const handleUpdateHospital = async (hospitalData) => {
    try {
      const response = await api.put('/hospital/update', { id: selectedHospital._id, ...hospitalData });
      if (response.data) {
        toast.success('Hospital updated successfully!');
        setIsEditModalOpen(false);
        fetchHospitals();
      }
    } catch (error) {
      console.error('Failed to update hospital:', error);
      toast.error(error.response?.data?.message || 'Failed to update hospital');
    }
  };

  const handleDeleteClick = (id) => {
    setHospitalToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hospitalToDelete) return;
    try {
      await api.delete('/hospital/delete', { data: { id: hospitalToDelete } });
      toast.success('Hospital deleted successfully');
      fetchHospitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setIsDeleteModalOpen(false);
      setHospitalToDelete(null);
    }
  };

  if (loading) return <div className="text-center p-8">Loading hospitals...</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-800">Hospital Management</h1>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
          <FaPlus /> Add Hospital
        </button>
      </div>

      {hospitals.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <h2 className="text-xl font-semibold text-gray-700">No Hospitals Found</h2>
          <p className="text-gray-500 mt-2">Get started by adding a new hospital.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead>
              <tr className="bg-indigo-50 text-indigo-800 uppercase text-sm leading-normal">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Address</th>
                <th className="py-3 px-6">Phone</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {hospitals.map(hospital => (
                <tr key={hospital._id} className="border-b border-gray-200 hover:bg-indigo-50">
                  <td className="py-3 px-6 font-medium">{hospital.name}</td>
                  <td className="py-3 px-6">{hospital.address}</td>
                  <td className="py-3 px-6">{hospital.phone}</td>
                  <td className="py-3 px-6">{hospital.email || '-'}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center gap-4">
                      <button onClick={() => handleEditClick(hospital)} className="text-blue-500 hover:text-blue-700 text-xl" title="Edit"><FaEdit /></button>
                      <button onClick={() => handleAssignClick(hospital)} className="text-green-500 hover:text-green-700 text-xl" title="Assign Departments"><FaBuilding /></button>
                      <button onClick={() => handleDeleteClick(hospital._id)} className="text-red-500 hover:text-red-700 text-xl" title="Delete"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddHospitalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddHospital} />
      {selectedHospital && <EditHospitalModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSave={handleUpdateHospital} hospital={selectedHospital} />}
      <DeleteConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} />
      {hospitalForAssignment && <AssignDepartmentsModal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} onSave={handleAssignDepartments} hospital={hospitalForAssignment} />}
    </div>
  );
}
