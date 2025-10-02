import React, { Fragment } from "react"
import UserHeader from "../../components/user/userHeader";
import UserFooter from "../../components/user/userFooter";
import CafeCard from "../../components/user/cafeCard";
import {getAllCafe, cafeTypeList} from "../../services/api";
import './CafeVariety.css'
import { useState, useEffect } from "react";
import Pagination from '../../components/common/Pagination';

const CafeVariety = () => {
    const [cafeList, setCafeList] = useState([]);
    const [cafeType, setCafeType] = useState([]);
    const [searchName, setSearchName] = useState("");
    const [searchType, setSearchType] = useState("");
    const [filteredCafe, setFilteredCafe] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const resCafe = await getAllCafe();
                const resCafeTypes = await cafeTypeList();
                if(resCafe.data.cafeList.errCode === 0){
                    setCafeList(resCafe.data.cafeList.data);
                    setFilteredCafe(resCafe.data.cafeList.data);    
                }
                if(resCafeTypes.data.cafeTypeList.errCode === 0){
                    setCafeType(resCafeTypes.data.cafeTypeList.data);

                }

            }catch(e){
                console.error('Lỗi tải danh sách giống cafe', e);
            }
           
        };
        fetchData();
    }, []);

    const handleSearch = () => {
        const filtered = cafeList.filter(cafe => {
            const nameMatch = searchName.trim() === '' || cafe.name.toLowerCase().includes(searchName.toLowerCase());
            const typeMatch = searchType === '' ||  cafe.CafeTypes.some(type => type.id === +searchType);
            return nameMatch && typeMatch;
        });
        setFilteredCafe(filtered);
    }

    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchName, searchType]);

    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    const currentCafes = filteredCafe.slice(indexOfFirstItem, indexOfLastItem);
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    
    return (
        <div className="cafe-variety-page">
            <UserHeader></UserHeader>
            <div className="main-content">
                <div className="cafe-variety-container">
                    <div className="search-bar">
                        <input type="text" placeholder="Tìm kiếm giống cafe" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
                        <select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                            <option value="">Tất cả loại giống</option>
                            {cafeType.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        <button onClick={handleSearch}>🔍 Tìm kiếm</button>
                    </div>
                    <div className="cafe-variety-list">
                        {currentCafes.map(cafe => (
                            <CafeCard key={cafe.id} cafe={cafe} />
                        ))}
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      pageSize={pageSize}
                      totalItems={filteredCafe.length}
                      onPageChange={handlePageChange}
                    />
                </div>
            </div>
            <UserFooter></UserFooter>
        </div>
    )
}
export default CafeVariety