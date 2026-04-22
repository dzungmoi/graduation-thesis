import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserHeader from "../../components/user/userHeader";
import UserFooter from "../../components/user/userFooter";
import { getCafeById } from "../../services/api";
import "./CafeVarietyDetail.css";

const CafeVarietyDetail = () => {
    const { id } = useParams();
    const [cafe, setCafe] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCafeDetail = async () => {
            try {
                setLoading(true);
                const response = await getCafeById(id);
                if (response.data?.cafe.errCode === 0) {
                    setCafe(response.data.cafe.data);
                }else{
                    console.error("Error fetching cafe detail:", response.data.cafe.errMessage);
                }
            } catch (error) {
                console.error("Error fetching cafe detail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCafeDetail();
    }, [id]);
    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin...</p>
            </div>
        );
    }
    
    if (!cafe) {
        return <div className="error-message">Không tìm thấy thông tin giống cafe.</div>;
    }

    return (
        <div>
            <UserHeader />
            <div className="cafe-detail-container">
                <div className="cafe-detail-header">
                    <h1>{cafe.name}</h1>
                    <div className="cafe-types">
                        {cafe.CafeTypes?.map(type => (
                            <span key={type.id} className="type-tag">{type.name}</span>
                        ))}
                    </div>
                </div>
                
                <div className="cafe-detail-content">
                    <div className="cafe-image-container">
                        <img src={cafe.image_url} alt={cafe.name} />
                    </div>
                    
                    <div className="cafe-info">
                        <h2>Thông tin chi tiết</h2>
                        <div className="cafe-description">
                            {cafe.description}
                        </div>
                    </div>
                </div>
                <div className="cafe-detail-description">
                    <div className="content-html" dangerouslySetInnerHTML={{__html: cafe.descriptionHTML || ''}}></div>
                </div>
            </div>
            <UserFooter />
        </div>
    );
};

export default CafeVarietyDetail;