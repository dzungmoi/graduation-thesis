import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/user/userHeader";
import Footer from "../../components/user/userFooter";
import {
  createMyFarm,
  getAllCafe,
  getMyFarms,
  getMyFarmWeeklyUpdates,
  upsertMyFarmWeeklyUpdate,
} from "../../services/api";
import "./myFarm.css";

const MyFarm = () => {
  const [cafes, setCafes] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [updates, setUpdates] = useState([]);

  const [farmForm, setFarmForm] = useState({ farmName: "", cafeVarietyId: "", location: "", areaHa: "" });
  const [updateForm, setUpdateForm] = useState({ weekStart: "", growthStageId: "", healthStatus: "tot", noteMarkdown: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const selectedFarm = useMemo(() => farms.find((f) => String(f.id) === String(selectedFarmId)), [farms, selectedFarmId]);

  const load = async () => {
    try {
      const [cafeRes, farmsRes] = await Promise.all([getAllCafe(), getMyFarms()]);
      setCafes(cafeRes?.data?.data || cafeRes?.data?.cafeList?.data || []);
      setFarms(farmsRes?.data?.data || []);
      if (!selectedFarmId && (farmsRes?.data?.data?.length || 0) > 0) setSelectedFarmId(farmsRes.data.data[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUpdates = async (farmId) => {
    if (!farmId) return;
    try {
      const res = await getMyFarmWeeklyUpdates(farmId);
      setUpdates(res?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadUpdates(selectedFarmId);
  }, [selectedFarmId]);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        farmName: farmForm.farmName,
        cafeVarietyId: Number(farmForm.cafeVarietyId),
        location: farmForm.location || null,
        areaHa: farmForm.areaHa ? Number(farmForm.areaHa) : null,
      };
      const res = await createMyFarm(payload);
      if (res?.data?.errCode === 0) {
        setFarmForm({ farmName: "", cafeVarietyId: "", location: "", areaHa: "" });
        await load();
      } else {
        alert(res?.data?.errMessage || "Tạo nông trại thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tạo nông trại");
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setImageFile(null);
    setImageFile(f);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(f);
  };

  const handleUpsertUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFarmId) {
      alert("Hãy tạo và chọn một nông trại trước.");
      return;
    }
    try {
      const payload = {
        weekStart: updateForm.weekStart,
        growthStageId: updateForm.growthStageId ? Number(updateForm.growthStageId) : null,
        healthStatus: updateForm.healthStatus,
        noteMarkdown: updateForm.noteMarkdown,
        noteHTML: updateForm.noteMarkdown,
      };

      if (imageFile && imagePreview) {
        const base64 = imagePreview.split(",")[1] || imagePreview;
        payload.imageBase64 = base64;
      }

      const res = await upsertMyFarmWeeklyUpdate(selectedFarmId, payload);
      if (res?.data?.errCode === 0) {
        setUpdateForm({ weekStart: "", growthStageId: "", healthStatus: "tot", noteMarkdown: "" });
        setImageFile(null);
        setImagePreview(null);
        await loadUpdates(selectedFarmId);
      } else {
        alert(res?.data?.errMessage || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu cập nhật");
    }
  };

  return (
    <div className="myfarm-page">
      <Header />
      <div className="page-inner">
        <div className="myfarm-container">
          <div className="myfarm-grid">
            {/* Left Column */}
            <div className="myfarm-left">
              {/* Create Farm Card */}
              <div className="myfarm-card create-card">
                <div className="card-header-custom green-header">
                  <div className="header-icon">🌱</div>
                  <div className="header-content">
                    <h3>Tạo nông trại</h3>
                    <p>Tạo nông trại mới để quản lý cây trồng</p>
                  </div>
                </div>
                <form onSubmit={handleCreateFarm} className="myfarm-form">
                  <div className="form-group">
                    <label>Tên nông trại / ID</label>
                    <input
                      type="text"
                      value={farmForm.farmName}
                      onChange={(e) => setFarmForm({ ...farmForm, farmName: e.target.value })}
                      placeholder="Nhập tên nông trại"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Giống cà phê</label>
                    <select
                      value={farmForm.cafeVarietyId}
                      onChange={(e) => setFarmForm({ ...farmForm, cafeVarietyId: e.target.value })}
                      required
                    >
                      <option value="">-- Chọn giống --</option>
                      {cafes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Khu vực / địa điểm</label>
                    <input
                      type="text"
                      value={farmForm.location}
                      onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                      placeholder="Nhập vị trí nông trại"
                    />
                  </div>

                  <div className="form-group">
                    <label>Diện tích (ha)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={farmForm.areaHa}
                      onChange={(e) => setFarmForm({ ...farmForm, areaHa: e.target.value })}
                      placeholder="0.0"
                    />
                  </div>

                  <button className="btn-submit green-btn" type="submit">Tạo</button>
                </form>
              </div>

              {/* Farm List Card */}
              <div className="myfarm-card list-card">
                <div className="card-header-custom yellow-header">
                  <div className="header-icon">📋</div>
                  <h4>Danh sách nông trại</h4>
                </div>
                <div className="farm-list-container">
                  {farms.length === 0 ? (
                    <p className="empty-message">Bạn chưa có nông trại nào.</p>
                  ) : (
                    farms.map((f) => (
                      <div
                        key={f.id}
                        className={`farm-list-item ${String(selectedFarmId) === String(f.id) ? "active" : ""}`}
                        onClick={() => setSelectedFarmId(f.id)}
                      >
                        <div className="farm-info">
                          <strong className="farm-name">{f.farmName || f.name}</strong>
                          <span className="farm-variety">{f.cafeVariety?.name || f.variety || ""}</span>
                        </div>
                        <button className="farm-badge">
                          {String(selectedFarmId) === String(f.id) ? "Đang chọn" : "Chọn"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="myfarm-right">
              {/* Update Card */}
              <div className="myfarm-card update-card">
                <div className="card-header-custom blue-header">
                  <div className="header-icon">📝</div>
                  <div className="header-content">
                    <h3>Cập nhật tuần - {selectedFarm ? (selectedFarm.farmName || selectedFarm.name) : ""}</h3>
                    <p>Chọn ngày trong tuần (tự hệ thống quy về Thứ 2)</p>
                  </div>
                </div>
                <form onSubmit={handleUpsertUpdate} className="myfarm-form">
                  <div className="form-group">
                    <label>Tuần bắt đầu</label>
                    <input
                      type="date"
                      value={updateForm.weekStart}
                      onChange={(e) => setUpdateForm({ ...updateForm, weekStart: e.target.value })}
                      placeholder="mm/dd/yyyy"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tình trạng</label>
                    <select
                      value={updateForm.healthStatus}
                      onChange={(e) => setUpdateForm({ ...updateForm, healthStatus: e.target.value })}
                    >
                      <option value="">Chọn tình trạng</option>
                      <option value="tot">Tốt</option>
                      <option value="trung_binh">Trung bình</option>
                      <option value="kem">Kém</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Hình ảnh (không bắt buộc)</label>
                    <label className="image-upload-zone">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-input"
                      />
                      <div className="upload-content">
                        <div className="upload-icon">📷</div>
                        <span>Chọn hình ảnh</span>
                      </div>
                      {imagePreview && (
                        <div className="image-preview-container">
                          <img src={imagePreview} alt="preview" className="preview-img" />
                        </div>
                      )}
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Ghi chú</label>
                    <textarea
                      placeholder="Nhập ghi chú..."
                      rows={4}
                      value={updateForm.noteMarkdown}
                      onChange={(e) => setUpdateForm({ ...updateForm, noteMarkdown: e.target.value })}
                    />
                  </div>

                  <button className="btn-submit brown-btn" type="submit">Lưu cập nhật</button>
                </form>
              </div>

              {/* History Card */}
              <div className="myfarm-card history-card">
                <div className="card-header-custom pink-header">
                  <div className="header-icon">⏰</div>
                  <h4>Lịch sử cập nhật</h4>
                </div>
                <div className="history-list">
                  {updates.length === 0 ? (
                    <p className="empty-message">Chưa có cập nhật.</p>
                  ) : (
                    updates.map((u) => (
                      <div className="history-item" key={u.id}>
                        <div className="history-content">
                          <div className="history-date">
                            <strong>Tuần bắt đầu:</strong> {u.weekStart}
                          </div>
                          {u.noteMarkdown && (
                            <div className="history-note">{u.noteMarkdown}</div>
                          )}
                        </div>
                        <span className={`status-badge status-${u.healthStatus}`}>
                          {u.healthStatus === 'tot' ? 'Tốt' : u.healthStatus === 'trung_binh' ? 'Trung bình' : 'Kém'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyFarm;
