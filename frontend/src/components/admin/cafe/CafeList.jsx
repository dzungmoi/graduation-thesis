import React,{useState,useEffect} from 'react';
import { getAllCafe,deleteCafe } from '../../../services/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from "react-toastify";
import Pagination from '../../common/Pagination';
const CafeList = ( { onEdit, refreshTrigger} ) => {
  const [cafeList,setCafeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const fetchCafe = async() => {
    setLoading(true);
    try{
      const res = await getAllCafe();
      if(res.data.cafeList.errCode === 0){
        setCafeList(res.data.cafeList.data);
      }
    }catch(e){
      console.error('Error loading cafe list', e)
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchCafe();
    },[refreshTrigger]); 

  const handleDeleteCafe = async(id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa giống cafe này không?');
    if(!confirmDelete) return;
    try{
      await deleteCafe(id);
      await fetchCafe();
    }catch(e){
      console.error('Error deleting cafe',e);
      toast.error('Xóa thất bại!')
    }
  } 

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentCafe = cafeList.slice(indexOfFirstItem, indexOfLastItem);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className='cafe-list'>
      <h4>Danh sách giống cafe</h4>
      {
        loading ? (<p>Đang tải dữ liệu...</p>) : (
          <>
            <table id='list-cafe'>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên giống cafe</th>
                  <th>Loại giống</th>
                  <th>Giới thiệu</th>
                  <th>Ảnh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentCafe.map((cafe,index) => (
                  <tr key = {cafe.id}>
                    <td>{indexOfFirstItem+index+1}</td>
                    <td>{cafe.name}</td>
                    <td>{cafe.CafeTypes.map(t => t.name).join(', ')}</td>
                    <td>{cafe.description}</td>
                    <td>
                      {cafe.image_url && <img src={cafe.image_url} alt={cafe.name} style={{ width: 60 }} />}
                    </td>
                    <td>
                      <button onClick={() => onEdit(cafe)} className="edit-btn"><FaEdit /></button>
                      <button onClick={() => handleDeleteCafe(cafe.id)} className="delete-btn"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={cafeList.length}
                onPageChange={handlePageChange}
            />
          </>
        )
      }
    </div>
  );
};
export default CafeList;
