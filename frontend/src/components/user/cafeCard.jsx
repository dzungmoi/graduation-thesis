import React from "react";
import { Link } from "react-router-dom";
const CafeCard = ({ cafe }) => {
    return (
        <div className="card-cafe">
            <img src={cafe.image_url} alt={cafe.name} className="card-image" />
            <div className="card-content">
                <h3 className="card-title">{cafe.name}</h3>
                <p className="tags">
                    {cafe.CafeTypes?.map(type => type.name).join(", ")}
                </p>
                <p className="card-description">
                    {cafe.description && cafe.description > 10 ? cafe.description.slice(0, 10) + "..." : cafe.description}
                </p>
                <Link to={`/cafe/${cafe.id}`} className="card-button">Xem thêm</Link>
            </div>
        </div>
    )
}
export default CafeCard