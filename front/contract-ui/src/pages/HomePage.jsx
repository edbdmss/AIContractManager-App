// src/pages/HomePage.jsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const contracts = useMemo(
    () => [
      {
        id: "gym-001",
        name: "헬스장 이용 계약",
        category: "운동",
        amount: 50000,
        nextPayment: "2026-10-15",
        expireDate: "2027-04-30",
        noticeDeadline: "2026-10-20",
      },
      {
        id: "net-001",
        name: "인터넷 이용 계약",
        category: "통신",
        amount: 33000,
        nextPayment: "2026-10-15",
        expireDate: "2027-03-01",
        noticeDeadline: "",
      },
      {
        id: "video-001",
        name: "영상 스트리밍",
        category: "구독",
        amount: 17000,
        nextPayment: "2026-10-18",
        expireDate: "",
        noticeDeadline: "",
      },
      {
        id: "rent-001",
        name: "원룸 월세 계약",
        category: "주거",
        amount: 420000,
        nextPayment: "2026-11-01",
        expireDate: "2027-02-28",
        noticeDeadline: "2027-01-31",
      },
    ],
    []
  );

  const monthlyTotal = contracts.reduce((sum, c) => sum + c.amount, 0);

  const expiringSoon = contracts
    .filter((c) => c.noticeDeadline || c.expireDate)
    .slice(0, 4);

  const categorySummary = Object.entries(
    contracts.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + c.amount;
      return acc;
    }, {})
  );

  const noticeCount = expiringSoon.length;

  const alertLine = expiringSoon.length
    ? `${expiringSoon[0].name} · ${
        expiringSoon[0].noticeDeadline
          ? `해지 통보 ${expiringSoon[0].noticeDeadline}`
          : expiringSoon[0].expireDate
          ? `만료 예정 ${expiringSoon[0].expireDate}`
          : `결제 예정 ${expiringSoon[0].nextPayment}`
      }`
    : "예정된 변경 알림이 없습니다.";

  // 데모용 캘린더
  const year = 2026;
  const month = 10;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const eventDays = new Set(
    contracts
      .map((c) => [c.nextPayment, c.noticeDeadline, c.expireDate])
      .flat()
      .filter(Boolean)
      .filter((d) => d.startsWith(`${year}-${String(month).padStart(2, "0")}`))
      .map((d) => Number(d.split("-")[2]))
  );

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>계약이 한눈에, 일상이 편하게</h1>
      <p style={styles.subtitle}>오늘 확인할 일정과 계약을 모았어요.</p>

      {/* 상단 2칸 */}
      <div style={styles.topGrid}>
        {/* 왼쪽: 분할 카드 (상단 알림 / 하단 계약목록 미리보기) */}
        <div style={{ ...styles.card, ...styles.noticeSplitCard }}>
          {/* 위 작은 칸: 변경 알림 (클릭 없음) */}
          <div style={styles.noticeMiniCard}>
            <span style={styles.noticeBadge}>변경 알림 {noticeCount}건</span>
            <p style={styles.noticeOneLine}>{alertLine}</p>
          </div>

          {/* 아래 큰 칸: 계약 목록 미리보기 */}
          <button
            type="button"
            style={styles.contractMiniCard}
            onClick={() => navigate("/contracts")}
          >
            <div style={styles.rowBetween}>
              <h3 style={styles.miniListTitle}>계약서 목록 미리보기</h3>
              <span style={styles.linkText}>전체보기</span>
            </div>

            <div style={styles.miniListWrap}>
              {contracts.slice(0, 3).map((c) => (
                <div key={c.id} style={styles.miniListItem}>
                  <p style={styles.miniItemName}>{c.name}</p>
                  <p style={styles.miniItemSub}>
                    {c.noticeDeadline
                      ? `해지 통보 ${c.noticeDeadline}`
                      : c.expireDate
                      ? `만료 예정 ${c.expireDate}`
                      : `결제 예정 ${c.nextPayment}`}
                  </p>
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* 오른쪽: 제안 칸 */}
        <button
          type="button"
          style={{ ...styles.card, ...styles.suggestCard }}
          onClick={() => navigate("/contracts/register")}
        >
          <span style={styles.suggestBadge}>제안</span>
          <h2 style={styles.cardTitle}>반복 결제 감지 후보</h2>
          <p style={styles.cardDesc}>
            결제 패턴 기반으로 계약 등록이 필요한 항목을 제안해요.
          </p>
          <div style={styles.suggestBox}>
            <p style={styles.suggestName}>모아 뮤직 정기결제</p>
            <p style={styles.suggestAmount}>월 9,900원</p>
          </div>
          <span style={styles.suggestLink}>계약 등록으로 이동 →</span>
        </button>
      </div>

      {/* 대시보드 */}
      <section style={{ ...styles.card, marginTop: 16 }}>
        <h2 style={styles.sectionTitle}>대시보드</h2>

        {/* 캘린더 + 곧 만료 리스트 */}
        <div style={styles.dashboardTop}>
          <div style={styles.innerCard}>
            <div style={styles.calendarHeader}>
              <strong>
                {year}년 {month}월
              </strong>
              <span style={styles.smallMuted}>예정일 강조</span>
            </div>

            <div style={styles.weekRow}>
              {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                <span key={d} style={styles.weekday}>
                  {d}
                </span>
              ))}
            </div>

            <div style={styles.calendarGrid}>
              {Array.from({ length: firstDay }).map((_, idx) => (
                <span key={`empty-${idx}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isEvent = eventDays.has(day);
                return (
                  <span
                    key={day}
                    style={{
                      ...styles.dayCell,
                      ...(isEvent ? styles.dayEvent : {}),
                    }}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={styles.innerCard}>
            <h3 style={styles.innerTitle}>곧 만료/변경되는 계약</h3>
            {expiringSoon.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate("/contracts")}
                style={styles.expireItem}
              >
                <p style={styles.expireTitle}>{item.name}</p>
                <p style={styles.expireSub}>
                  {item.noticeDeadline
                    ? `해지 통보 ${item.noticeDeadline}`
                    : item.expireDate
                    ? `만료 ${item.expireDate}`
                    : `결제 ${item.nextPayment}`}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* 총지출 + 카테고리 분배 */}
        <div style={styles.dashboardBottom}>
          <div style={styles.innerCard}>
            <h3 style={styles.innerTitle}>총 지출 정리</h3>
            <p style={styles.totalLabel}>월 환산 예상 고정비</p>
            <p style={styles.totalValue}>{monthlyTotal.toLocaleString()}원</p>
            <p style={styles.smallMuted}>이용 중 계약 {contracts.length}개 기준</p>
          </div>

          <div style={styles.innerCard}>
            <h3 style={styles.innerTitle}>카테고리별 지출 분배</h3>
            {categorySummary.map(([category, value]) => {
              const ratio = monthlyTotal ? Math.round((value / monthlyTotal) * 100) : 0;
              return (
                <div key={category} style={{ marginBottom: 12 }}>
                  <div style={styles.rowBetween}>
                    <span style={styles.categoryName}>{category}</span>
                    <span style={styles.categoryAmount}>
                      {value.toLocaleString()}원 ({ratio}%)
                    </span>
                  </div>
                  <div style={styles.barTrack}>
                    <div style={{ ...styles.barFill, width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { width: "100%" },
  title: {
    margin: "0 0 8px",
    fontSize: 28,
    color: "#172b3a",
    letterSpacing: -0.5,
  },
  subtitle: {
    margin: 0,
    color: "#71818d",
    fontSize: 14,
  },

  topGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: 14,
  },

  card: {
    background: "#fff",
    border: "1px solid #e3eaee",
    borderRadius: 16,
    padding: 18,
    boxShadow: "0 4px 12px rgba(25,44,58,0.04)",
    textAlign: "left",
  },

  noticeSplitCard: {
    padding: 10,
    display: "grid",
    gridTemplateRows: "64px 1fr",
    gap: 8,
    border: "1px solid #d6e7e3",
    background: "#f9fcfb",
  },

  noticeMiniCard: {
    width: "100%",
    border: "1px solid #d6e7e3",
    borderRadius: 10,
    background: "#f3fbf8",
    padding: "8px 10px",
  },
  noticeBadge: {
    display: "inline-block",
    fontSize: 10,
    fontWeight: 700,
    color: "#087e7d",
    background: "#e7f3ef",
    borderRadius: 6,
    padding: "3px 7px",
    marginBottom: 6,
  },
  noticeOneLine: {
    margin: 0,
    fontSize: 12,
    color: "#3f5866",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  contractMiniCard: {
    width: "100%",
    border: "1px solid #e8ecef",
    borderRadius: 12,
    background: "#fff",
    padding: "12px 12px 8px",
    textAlign: "left",
    cursor: "pointer",
  },
  miniListTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 800,
    color: "#172b3a",
  },
  miniListWrap: {
    marginTop: 8,
    display: "grid",
    gap: 6,
  },
  miniListItem: {
    border: "1px solid #eef2f4",
    borderRadius: 8,
    padding: "8px 10px",
  },
  miniItemName: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    color: "#172b3a",
  },
  miniItemSub: {
    margin: "3px 0 0",
    fontSize: 12,
    color: "#71818d",
  },

  suggestCard: {
    cursor: "pointer",
  },
  suggestBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: "#a96415",
    background: "#fff1d8",
    borderRadius: 7,
    padding: "5px 8px",
  },
  cardTitle: {
    margin: "12px 0 6px",
    fontSize: 18,
    color: "#172b3a",
  },
  cardDesc: {
    margin: 0,
    color: "#71818d",
    fontSize: 13,
    lineHeight: 1.55,
  },
  suggestBox: {
    marginTop: 14,
    border: "1px dashed #b7d6d1",
    borderRadius: 10,
    background: "#f8fcfb",
    padding: 12,
  },
  suggestName: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#172b3a",
  },
  suggestAmount: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#087e7d",
    fontWeight: 700,
  },
  suggestLink: {
    display: "inline-block",
    marginTop: 12,
    fontSize: 13,
    color: "#087e7d",
    fontWeight: 700,
  },

  sectionTitle: {
    margin: "0 0 12px",
    fontSize: 20,
    color: "#172b3a",
  },

  dashboardTop: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 12,
  },
  dashboardBottom: {
    marginTop: 12,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },

  innerCard: {
    border: "1px solid #e8ecef",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
  },
  innerTitle: {
    margin: "0 0 10px",
    fontSize: 16,
    color: "#172b3a",
  },

  calendarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  smallMuted: {
    fontSize: 12,
    color: "#71818d",
  },
  weekRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    marginBottom: 6,
  },
  weekday: {
    textAlign: "center",
    fontSize: 11,
    color: "#71818d",
  },
  calendarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  dayCell: {
    height: 34,
    borderRadius: 8,
    fontSize: 12,
    color: "#334155",
    background: "#f7fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dayEvent: {
    background: "#e0f2ec",
    color: "#087e7d",
    fontWeight: 700,
  },

  expireItem: {
    width: "100%",
    border: 0,
    borderBottom: "1px solid #eef2f4",
    background: "transparent",
    padding: "9px 0",
    textAlign: "left",
    cursor: "pointer",
  },
  expireTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 700,
    color: "#172b3a",
  },
  expireSub: {
    margin: "4px 0 0",
    fontSize: 12,
    color: "#71818d",
  },

  totalLabel: {
    margin: "0 0 6px",
    color: "#71818d",
    fontSize: 13,
  },
  totalValue: {
    margin: "0 0 6px",
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: -0.5,
    color: "#087e7d",
  },

  rowBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    color: "#087e7d",
    fontWeight: 600,
  },
  categoryName: {
    fontSize: 13,
    color: "#334155",
    fontWeight: 600,
  },
  categoryAmount: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 600,
  },
  barTrack: {
    width: "100%",
    height: 8,
    borderRadius: 99,
    background: "#edf2f4",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 99,
    background: "#087e7d",
  },
};
