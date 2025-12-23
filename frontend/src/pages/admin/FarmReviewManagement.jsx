import { useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../../components/admin/adminSidebar";
import { adminGetAllFarmWeeklyUpdates, adminReviewFarmWeeklyUpdate } from "../../services/api";
import { toast } from "react-toastify";
import "./FarmReviewManagement.css";

const FarmReviewManagement = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });

  const pendingCount = useMemo(() => updates.filter(u => !u.review).length, [updates]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetAllFarmWeeklyUpdates();
      setUpdates(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách cập nhật");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openReview = (u) => {
    setSelected(u);
    setForm({ rating: u.review?.rating || 5, comment: u.review?.comment || "" });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const res = await adminReviewFarmWeeklyUpdate(selected.id, { rating: Number(form.rating), comment: form.comment });
    if (res?.data?.errCode === 0) {
      toast.success("Đã lưu đánh giá");
      setSelected(null);
      await load();
    } else {
      toast.error(res?.data?.errMessage || "Lưu đánh giá thất bại");
    }
  };

  return (
    <div className="farm-review-page">
      <SidebarAdmin />
      <div className="content">
        <div className="header">
          <h2>Đánh giá nông trại</h2>
          <div className="meta">Chưa đánh giá: <b>{pendingCount}</b></div>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : updates.length === 0 ? (
          <p>Chưa có cập nhật nào từ người dùng.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tuần</th>
                  <th>Người dùng</th>
                  <th>Nông trại</th>
                  <th>Giống</th>
                  <th>Tình trạng</th>
                  <th>Ghi chú</th>
                  <th>Đánh giá</th>
                </tr>
              </thead>
              <tbody>
                {updates.map((u) => (
                  <tr key={u.id} className={u.review ? "" : "pending"}>
                    <td>{u.weekStart}</td>
                    <td>{u.farm?.user?.userName || u.farm?.user?.email}</td>
                    <td>{u.farm?.farmName}</td>
                    <td>{u.farm?.cafeVariety?.name}</td>
                    <td>{u.healthStatus}</td>
                    <td className="note">{u.noteMarkdown || ""}</td>
                    <td>
                      {u.review ? (
                        <div className="reviewed">
                          <div>{u.review.rating}/5</div>
                          <button className="btn" onClick={() => openReview(u)}>Sửa</button>
                        </div>
                      ) : (
                        <button className="btn primary" onClick={() => openReview(u)}>Đánh giá</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="drawer">
            <div className="drawer-card">
              <div className="drawer-head">
                <h3>Đánh giá - {selected.farm?.farmName} ({selected.weekStart})</h3>
                <button className="btn" onClick={() => setSelected(null)}>Đóng</button>
              </div>
              <form onSubmit={submit} className="form">
                <label>
                  Rating (1-5)
                  <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                </label>
                <label>
                  Nhận xét
                  <textarea rows={4} value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
                </label>
                <button className="btn primary" type="submit">Lưu</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmReviewManagement;
