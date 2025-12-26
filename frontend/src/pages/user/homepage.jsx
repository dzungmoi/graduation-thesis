import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../../components/user/userHeader";
import UserFooter from "../../components/user/userFooter";
import FeatureCard from "../../components/user/featureCard";
import Banner from "../../assets/banner.png";
import './homepage.css'
import PestPrediction from "./PestPrediction";
import { FaMicroscope, FaSeedling, FaBug, FaTractor, FaChartBar } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleNavigation = (path) => {
        navigate(path);
    }
    const openModal = () => {
        setIsModalOpen(true);
    }
    const closeModal = () => {
        setIsModalOpen(false);
    }
    return (
        <div>
            <UserHeader></UserHeader>
            <section className="vp-banner">
                <div className="banner-content">
                    <h2>CoffeViet</h2>
                    <h3>Trợ lý ảo cho nhà nông</h3>
                    <p>Ứng dụng Nông nghiệp thông minh dễ dàng tra cứu thông tin về cafe và tích hợp công nghệ AI,
                        giúp người nông dân dễ dàng chẩn đoán và theo dõi quá trình
                        canh tác cafe hiệu quả.</p>
                    <button className="explore-btn" onClick={() => handleNavigation('/disease-detection')}>
                        Khám phá ngay →
                    </button>
                </div>
                <div className="banner-image">
                    <img src={Banner} alt="CoffeeViet Banner" />
                </div>
            </section>
            <section className="vp-features">
                <h3 className="features-title"> CÁC TÍNH NĂNG NỔI BẬT</h3>
                <div className="feature-list-grid">
                    <div className="image-container">
                        <img src="https://43factory.coffee/wp-content/uploads/2022/12/202301040805-Cac-loai-benh-tren-cay-ca-phe-thuong-gap-01.jpg" alt="AI chẩn đoán" />
                    </div>
                    <FeatureCard
                        icon={<FaMicroscope />}
                        title="Nông trại của tôi"
                        description="Chỉ cần chụp ảnh cây cafe, CoffeeViet sẽ đưa ra chẩn đoán và cách điều trị các loại sâu/bệnh bằng công nghệ nhận diện AI."
                        buttonText="Xem ngay"
                        onClick={() => { window.scrollTo(0, 0); handleNavigation('/my-farm') }}
                    />

                    <FeatureCard
                        icon={<FaSeedling />}
                        title="Giống Cafe"
                        description="Tìm hiểu về các giống cafe phổ biến, đặc điểm và hướng dẫn trồng phù hợp."
                        buttonText="Xem ngay"
                        onClick={() => handleNavigation('/cafe-variety')}
                    />
                    <div className="image-container">
                        <img src="https://vietcoffee.com.vn/wp-content/uploads/2016/06/nhung-vung-trong-ca-phe-arabica-ngon-o-viet-nam-vietcoffee-1.jpg" alt="Giống cafe" />
                    </div>

                    <div className="image-container">
                        <img src="https://phadincoffee.com/wp-content/uploads/2016/01/tim-hieu-nhung-loai-sau-benh-chinh-tren-cay-ca-phe-2.jpg" alt="Sâu bệnh" />
                    </div>
                    <FeatureCard
                        icon={<FaBug />}
                        title="Sâu Bệnh Hại"
                        description="Thông tin chi tiết về các loại sâu bệnh hại phổ biến trên cây cafe và biện pháp phòng trị."
                        buttonText="Xem ngay"
                        onClick={() => handleNavigation('/pest-disease')}
                    />

                    <FeatureCard
                        icon={<FaTractor />}
                        title="Kỹ Thuật Trồng Trọt"
                        description="Hướng dẫn chi tiết về kỹ thuật trồng cafe từ các chuyên gia nông nghiệp."
                        buttonText="Xem ngay"
                        onClick={() => handleNavigation('/cultivation')}
                    />
                    <div className="image-container">
                        <img src="https://www.mashed.com/img/gallery/foods-you-wouldnt-recognize-in-their-natural-state/coffee-1497622618.jpg" alt="Ứng dụng VietPlant" />
                    </div>

                    <div className="image-container">
                        <img src="https://www.helenacoffee.vn/wp-content/uploads/2022/02/All-Arabica-Varieties-1-790x527.jpg" alt="Ứng dụng VietPlant" />
                    </div>
                    <FeatureCard
                        icon={<FaChartBar />}
                        title="Mô Hình Canh Tác"
                        description="Khám phá các mô hình canh tác cafe tiên tiến giúp tăng năng suất và bảo vệ môi trường."
                        buttonText="Xem ngay"
                        onClick={() => handleNavigation('/model-farm')}
                    />
                </div>
            </section>
            <PestPrediction isOpen={isModalOpen} onClose={closeModal} />
            <UserFooter></UserFooter>
        </div>
    )
}
export default HomePage