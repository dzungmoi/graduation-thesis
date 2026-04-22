import { useEffect, useMemo, useState } from "react";
import SidebarAdmin from "../../components/admin/adminSidebar";
import {
  adminGetAllFarmWeeklyUpdates,
  adminReviewFarmWeeklyUpdate,
  adminGetAllFarms,
} from "../../services/api";
import { toast } from "react-toastify";
import "./FarmReviewManagement.css";
import { FaEdit, FaCommentDots, FaSearch, FaSyncAlt } from "react-icons/fa";
import { MdRateReview } from "react-icons/md";
const FarmReviewManagement = () => {
  const [farms, setFarms] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [q, setQ] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [farmsRes, updatesRes] = await Promise.all([
        adminGetAllFarms(),
        adminGetAllFarmWeeklyUpdates(),
      ]);

      if (farmsRes?.data?.errCode === 0) setFarms(farmsRes.data.data || []);
      else toast.error(farmsRes?.data?.errMessage || "Không lấy được danh sách nông trại");

      if (updatesRes?.data?.errCode === 0) setUpdates(updatesRes.data.data || []);
      else toast.error(updatesRes?.data?.errMessage || "Không lấy được cập nhật hàng tuần");
    } catch (e) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // farms + stats
  const farmsWithStats = useMemo(() => {
    const updatesByFarm = new Map();
    for (const u of updates) {
      const farmId = u?.farm?.id || u?.farmId;
      if (!farmId) continue;
      if (!updatesByFarm.has(farmId)) updatesByFarm.set(farmId, []);
      updatesByFarm.get(farmId).push(u);
    }

    return (farms || []).map(f => {
      const list = updatesByFarm.get(f.id) || [];
      const pending = list.filter(x => !x.review).length;
      return { ...f, _updates: list, _pending: pending, _total: list.length };
    });
  }, [farms, updates]);

  const filteredFarms = useMemo(() => {
    const keyword = (q || "").trim().toLowerCase();
    if (!keyword) return farmsWithStats;
    return farmsWithStats.filter(f => {
      const userName = f.user?.userName || "";
      const email = f.user?.email || "";
      const farmName = f.farmName || "";
      const variety = f.cafeVariety?.name || "";
      return [userName, email, farmName, variety].some(s => String(s).toLowerCase().includes(keyword));
    });
  }, [farmsWithStats, q]);

  // choose default selected farm
  useEffect(() => {
    if (selectedFarmId) return;
    if (filteredFarms.length > 0) setSelectedFarmId(filteredFarms[0].id);
  }, [filteredFarms, selectedFarmId]);

  const selectedFarm = useMemo(
    () => farmsWithStats.find(f => f.id === selectedFarmId) || null,
    [farmsWithStats, selectedFarmId]
  );

  const selectedFarmUpdates = useMemo(() => {
    if (!selectedFarm) return [];
    // already sorted in API by weekStart DESC; but keep stable:
    return [...(selectedFarm._updates || [])].sort((a, b) => String(b.weekStart).localeCompare(String(a.weekStart)));
  }, [selectedFarm]);

  const pendingCountAll = useMemo(
    () => updates.filter(u => !u.review).length,
    [updates]
  );

  const openReview = (u) => {
    setSelectedUpdate(u);
    setForm({
      rating: u.review?.rating || 5,
      comment: u.review?.comment || "",
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedUpdate) return;

    try {
      const res = await adminReviewFarmWeeklyUpdate(selectedUpdate.id, {
        rating: Number(form.rating),
        comment: form.comment,
      });

      if (res?.data?.errCode === 0) {
        toast.success("Đã lưu phản hồi");
        setSelectedUpdate(null);
        await load();
      } else {
        toast.error(res?.data?.errMessage || "Lưu phản hồi thất bại");
      }
    } catch (e) {
      toast.error("Lỗi khi lưu phản hồi");
    }
  };

  return (
    <div className="farm-review-page">
      <SidebarAdmin />
      <div className="content">
        <div className="header">
          <div>
            <h2>Đánh giá nông trại</h2>
            <div className="sub">
              Tổng cập nhật đang chờ: <b>{pendingCountAll}</b>
            </div>
          </div>

          <div className="tools">
            <input
              className="search"
              placeholder="Tìm theo nông trại / người dùng / giống..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="btn" onClick={load}>Tải lại</button>
          </div>
        </div>

        <div className="review-layout">
          <div className="farm-list">
            <div className="panel-title">Danh sách nông trại ({filteredFarms.length})</div>

            {loading ? (
              <div className="box">Đang tải...</div>
            ) : filteredFarms.length === 0 ? (
              <div className="box">Không có nông trại phù hợp</div>
            ) : (
              <div className="farm-items">
                {filteredFarms.map((f) => (
                  <button
                    key={f.id}
                    className={`farm-item ${f.id === selectedFarmId ? "active" : ""}`}
                    onClick={() => setSelectedFarmId(f.id)}
                    type="button"
                  >
                    <div className="farm-item-top">
                      <div className="farm-name">{f.farmName}</div>
                      {f._pending > 0 && <span className="badge">{f._pending} chờ</span>}
                    </div>
                    <div className="farm-meta">
                      <div className="muted">{f.user?.userName || f.user?.email}</div>
                      <div className="muted">Giống: {f.cafeVariety?.name}</div>
                      <div className="muted">Cập nhật: {f._total}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="updates-panel">
            <div className="panel-title">
              {selectedFarm ? (
                <>
                  Cập nhật hàng tuần — <b>{selectedFarm.farmName}</b>
                  <div className="sub">
                    Chủ nông trại: <b>{selectedFarm.user?.userName || selectedFarm.user?.email}</b> •
                    {" "}Giống: <b>{selectedFarm.cafeVariety?.name}</b> •
                    {" "}Chờ đánh giá: <b>{selectedFarm._pending}</b>
                  </div>
                </>
              ) : (
                "Chọn 1 nông trại để xem cập nhật"
              )}
            </div>

            {!selectedFarm ? (
              <div className="box">Chưa chọn nông trại</div>
            ) : selectedFarmUpdates.length === 0 ? (
              <div className="box">Nông trại này chưa có cập nhật hàng tuần</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tuần</th>
                      <th>Hình ảnh</th>
                      <th>Tình trạng</th>
                      <th>Ghi chú</th>
                      <th>Phản hồi admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFarmUpdates.map((u) => (
                      <tr key={u.id} className={u.review ? "" : "pending"}>
                        <td className="week">{u.weekStart}</td>
                        <td>
                          <img src={u.image_url} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                        </td>
                        <td>{u.healthStatus || "-"}</td>
                        <td className="note">{u.noteMarkdown || ""}</td>
                        <td>
                          {u.review ? (
                            <div className="reviewed">
                              <div class>
                              </div>
                              <button className="btn" onClick={() => openReview(u)}><FaEdit /></button>
                            </div>
                          ) : (
                            <button className="btn primary" onClick={() => openReview(u)}> Gửi phản hồi</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selectedUpdate && (
          <div className="drawer">
            <div className="drawer-card">
              <div className="drawer-head">
                <div>
                  <h3>
                    Phản hồi — {selectedUpdate.farm?.farmName} ({selectedUpdate.weekStart})
                  </h3>
                  <div className="muted small">
                    User: {selectedUpdate.farm?.user?.userName || selectedUpdate.farm?.user?.email}
                  </div>
                </div>
                <button className="btn" onClick={() => setSelectedUpdate(null)}>Đóng</button>
              </div>

              <div className="drawer-info">
                <div><b>Tình trạng:</b> {selectedUpdate.healthStatus || "-"}</div>
                <div className="note"><b>Ghi chú:</b>{selectedUpdate.noteMarkdown || ""}</div>
              </div>

              <form onSubmit={submit} className="form">
                <label>
                  Nhận xét / hướng dẫn cho user
                  <textarea
                    rows={6}
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  />
                </label>

                <button className="btn primary" type="submit">Lưu phản hồi</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmReviewManagement;
