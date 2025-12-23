import { useEffect, useMemo, useState } from "react";
import Header from "../../components/user/userHeader";
import Footer from "../../components/user/userFooter";
import { createMyFarm, getAllCafe, getMyFarms, getMyFarmWeeklyUpdates, upsertMyFarmWeeklyUpdate } from "../../services/api";
import "./MyFarm.css";

const MyFarm = () => {
  const [cafes, setCafes] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [updates, setUpdates] = useState([]);

  const [farmForm, setFarmForm] = useState({ farmName: "", cafeVarietyId: "", location: "", areaHa: "" });
  const [updateForm, setUpdateForm] = useState({ weekStart: "", growthStageId: "", healthStatus: "tot", noteMarkdown: "" });

  const selectedFarm = useMemo(() => farms.find(f => String(f.id) === String(selectedFarmId)), [farms, selectedFarmId]);

  const load = async () => {
    const [cafeRes, farmsRes] = await Promise.all([getAllCafe(), getMyFarms()]);
        setCafes(cafeRes?.data?.cafeList?.data || []);
    setFarms(farmsRes?.data?.data || []);
    if (!selectedFarmId && (farmsRes?.data?.data?.length || 0) > 0) setSelectedFarmId(farmsRes.data.data[0].id);
  };

  const loadUpdates = async (farmId) => {
    if (!farmId) return;
    const res = await getMyFarmWeeklyUpdates(farmId);
    setUpdates(res?.data?.data || []);
  };

  useEffect(() => {
    load().catch(console.error);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    loadUpdates(selectedFarmId).catch(console.error);
  }, [selectedFarmId]);

  const handleCreateFarm = async (e) => {
    e.preventDefault();
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
  };

  const handleUpsertUpdate = async (e) => {
    e.preventDefault();
    if (!selectedFarmId) return;
    const payload = {
      weekStart: updateForm.weekStart,
      growthStageId: updateForm.growthStageId ? Number(updateForm.growthStageId) : null,
      healthStatus: updateForm.healthStatus,
      noteMarkdown: updateForm.noteMarkdown,
      noteHTML: updateForm.noteMarkdown, // tạm thời
    };
    const res = await upsertMyFarmWeeklyUpdate(selectedFarmId, payload);
    if (res?.data?.errCode === 0) {
      setUpdateForm({ weekStart: "", growthStageId: "", healthStatus: "tot", noteMarkdown: "" });
      await loadUpdates(selectedFarmId);
    } else {
      alert(res?.data?.errMessage || "Cập nhật thất bại");
    }
  };

  return (
    <div className="my-farm-page">
      <Header />
      <div className="my-farm-container">
        <h1 className="page-title">Nông trại của tôi</h1>

        <div className="grid">
          <div className="card">
            <h2>Tạo nông trại</h2>
            <form onSubmit={handleCreateFarm} className="form">
              <label>
                Tên nông trại / lô
                <input value={farmForm.farmName} onChange={(e) => setFarmForm({ ...farmForm, farmName: e.target.value })} required />
              </label>

              <label>
                Giống cà phê
                <select value={farmForm.cafeVarietyId} onChange={(e) => setFarmForm({ ...farmForm, cafeVarietyId: e.target.value })} required>
                  <option value="">-- Chọn giống --</option>
                  {cafes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Khu vực / địa điểm
                <input value={farmForm.location} onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })} />
              </label>

              <label>
                Diện tích (ha)
                <input type="number" step="0.01" value={farmForm.areaHa} onChange={(e) => setFarmForm({ ...farmForm, areaHa: e.target.value })} />
              </label>

              <button className="btn" type="submit">Tạo</button>
            </form>
          </div>

          <div className="card">
            <h2>Danh sách nông trại</h2>
            {farms.length === 0 ? (
              <p>Bạn chưa có nông trại nào.</p>
            ) : (
              <ul className="farm-list">
                {farms.map((f) => (
                  <li key={f.id} className={String(f.id) === String(selectedFarmId) ? "active" : ""}>
                    <button onClick={() => setSelectedFarmId(f.id)}>
                      <div className="farm-title">{f.farmName}</div>
                      <div className="farm-sub">{f.cafeVariety?.name || ""}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card">
          <h2>Cập nhật tuần {selectedFarm ? `- ${selectedFarm.farmName}` : ""}</h2>
          {!selectedFarmId ? (
            <p>Hãy tạo và chọn một nông trại trước.</p>
          ) : (
            <form onSubmit={handleUpsertUpdate} className="form">
              <label>
                Chọn ngày trong tuần (hệ thống tự quy về Thứ 2)
                <input type="date" value={updateForm.weekStart} onChange={(e) => setUpdateForm({ ...updateForm, weekStart: e.target.value })} required />
              </label>

              <label>
                Tình trạng
                <select value={updateForm.healthStatus} onChange={(e) => setUpdateForm({ ...updateForm, healthStatus: e.target.value })}>
                  <option value="tot">Tốt</option>
                  <option value="trung_binh">Trung bình</option>
                  <option value="kem">Kém</option>
                </select>
              </label>

              <label>
                Ghi chú
                <textarea rows={4} value={updateForm.noteMarkdown} onChange={(e) => setUpdateForm({ ...updateForm, noteMarkdown: e.target.value })} />
              </label>

              <button className="btn" type="submit">Lưu cập nhật</button>
            </form>
          )}

          <h3 className="mt">Lịch sử cập nhật</h3>
          {updates.length === 0 ? (
            <p>Chưa có cập nhật.</p>
          ) : (
            <div className="updates">
              {updates.map((u) => (
                <div key={u.id} className="update-item">
                  <div className="update-head">
                    <div><b>Tuần bắt đầu:</b> {u.weekStart}</div>
                    <div><b>Tình trạng:</b> {u.healthStatus}</div>
                  </div>
                  {u.noteMarkdown && <div className="update-note">{u.noteMarkdown}</div>}

                  {u.review ? (
                    <div className="review">
                      <div><b>Admin đánh giá:</b> {u.review.rating}/5</div>
                      {u.review.comment && <div>{u.review.comment}</div>}
                      <div className="muted">Bởi: {u.review.admin?.userName || u.review.admin?.email}</div>
                    </div>
                  ) : (
                    <div className="muted">Chưa có đánh giá từ Admin</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyFarm;
