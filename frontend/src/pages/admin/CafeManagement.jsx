import React, { useState } from 'react';
import CafeForm from '../../components/admin/cafe/CafeForm';
import CafeList from '../../components/admin/cafe/CafeList';
import { toast } from 'react-toastify';
import SidebarAdmin from "../../components/admin/adminSidebar";
import './CafeManagement.css';
import 'react-markdown-editor-lite/lib/index.css';

const CafeManagement = () => {
  const [editingCafe, setEditingCafe] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);  
  const handleFormSuccess = (action) => {
    setEditingCafe(null);
    setRefreshTrigger(prev => prev + 1);
    if (action === 'update') {
      toast.success("Cập nhật giống cafe thành công!");
    } else {
      toast.success("Tạo giống cafe thành công!");
    }
  };

  const handleCancelEdit = () => {
    setEditingCafe(null);
  };

  const scrollToForm = () => {
    const formElement = document.querySelector('.cafe-form-container');
    const contentElement = document.querySelector('.cafe-content');
    if (formElement && contentElement) {
      contentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  return (
    <div className="cafe-management-container">
      <SidebarAdmin />
      <div className="cafe-content">
        <h2>Quản lý giống cafe</h2>
        <CafeForm 
          initialData={editingCafe}
          onSuccess={handleFormSuccess}
          onCancel={handleCancelEdit}
        />
        <CafeList 
          onEdit={(cafe) => {
            setEditingCafe(cafe);
            scrollToForm();
          }}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default CafeManagement;
