'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClassState } from '../../../hooks/useClassState';
import { Card } from '../../../components/ui/Card';
import { Timer } from '../../../components/ui/Timer';
import { GroupPhase } from '../../../components/phases/GroupPhase';

function DashboardContent() {
    const searchParams = useSearchParams();
    const house = searchParams.get('house') || 'N';
    const name = searchParams.get('name') || 'Học sinh';
    const rawUid = searchParams.get('uid');

    const [uid, setUid] = React.useState(rawUid || '');

    React.useEffect(() => {
        if (!uid) {
            const stored = localStorage.getItem('lim_session_id');
            if (stored) setUid(stored);
        }
    }, [uid]);

    const { classState, loading } = useClassState();

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh' }}>Đang tải trạng thái lớp học...</div>;
    }

    const phase = classState?.phase || 1;
    const houseColor = `var(--house-${house.toLowerCase()})`;

    return (
        <div className="container" style={{ padding: '24px 0' }}>
            <header className="flex-between glass-panel" style={{ marginBottom: '24px', padding: '16px 24px' }}>
                <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{name}</h2>
                    <span style={{ color: houseColor, fontWeight: 'bold' }}>Nhà {house}</span>
                </div>
                {classState?.timer_ends_at && (
                    <div className="flex-center gap-sm">
                        <span>⏱️</span>
                        <Timer targetDate={classState.timer_ends_at} />
                    </div>
                )}
            </header>

            <main>
                {phase === 1 && (
                    <Card className="text-center">
                        <h3>0’–2’ KWL giấy: K + W</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            Chủ đề: <strong style={{ color: 'white', fontSize: '1.1rem' }}>{classState?.topic_prompt}</strong><br /><br />
                            Vui lòng ghi vào phiếu giấy:<br />
                            - <strong>K</strong>: Em đã biết gì về "khác biệt khi làm nhóm"?<br />
                            - <strong>W</strong>: Em muốn đạt điều gì khi thảo luận hôm nay?<br /><br />
                            👉 Lưu ý: Viết rất ngắn, 1 gạch đầu dòng mỗi ô.
                        </p>
                    </Card>
                )}

                {phase === 2 && (
                    <Card className="text-center flex-column gap-md">
                        <h3>2’–7’ Khởi động SEE: Poll</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>“Nếu cả tháng ngày nào em cũng ăn món em thích nhất, em nghĩ điều gì sẽ xảy ra?”</p>
                        <div className="flex-column gap-sm" style={{ textAlign: 'left', marginTop: '12px' }}>
                            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textAlign: 'left' }}>A. Em vẫn thích như cũ</button>
                            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textAlign: 'left' }}>B. Em sẽ chán dần</button>
                            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textAlign: 'left' }}>C. Em có thể chán nhưng vẫn ăn vì tiện</button>
                            <button className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textAlign: 'left' }}>D. Em không chắc</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '16px', textAlign: 'left' }}>Vì sao em chọn đáp án đó? (1 câu)</p>
                        <textarea placeholder="Nhập lý do (ẩn danh)..." className="input-field" style={{ width: '100%', minHeight: '60px' }} />
                        <button className="btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', width: '100%' }}>Gửi bình chọn & Ý kiến</button>
                    </Card>
                )}

                {phase === 3 && (
                    <Card className="text-center flex-column gap-md">
                        <h3>7’–9’ Trò chơi Synergy (2 phút)</h3>
                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'left' }}>
                            <p style={{ color: 'var(--warning)', fontWeight: 'bold', marginBottom: '8px' }}>⚠️ Không nhập web. Chỉ nói theo mẫu.</p>
                            <p style={{ lineHeight: '1.5' }}>Mỗi nhà chọn nhanh 2 bạn đứng tại chỗ:</p>
                            <p style={{ lineHeight: '1.5' }}>- Bạn 1: <strong>"Mình hiểu ý bạn, và mình đề nghị..."</strong></p>
                            <p style={{ lineHeight: '1.5' }}>- Bạn 2: <strong>"Mình lo rằng..., và mình đề nghị..."</strong></p>
                        </div>
                    </Card>
                )}

                {phase === 4 && (
                    <Card>
                        <h3 className="text-center" style={{ marginBottom: '24px' }}>9’–21’ Làm nhóm DO (Tạo Ý 3)</h3>
                        <div className="flex-center gap-md text-center flex-column" style={{ marginBottom: '24px' }}>
                            <p>Chủ đề: <strong className="text-gradient-alt" style={{ fontSize: '1.2rem' }}>{classState?.topic_prompt}</strong></p>
                        </div>

                        <hr style={{ borderColor: 'var(--surface-border)', margin: '24px 0', opacity: 0.5 }} />

                        {uid ? (
                            <GroupPhase house={house as any} studentId={uid} />
                        ) : (
                            <p style={{ color: 'var(--warning)' }}>Vui lòng đăng nhập lại để nhận diện mã phiên hợp lệ.</p>
                        )}
                    </Card>
                )}

                {phase === 5 && (
                    <Card className="text-center">
                        <h3>21’–35’ Thuyết trình GET</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6', textAlign: 'left', display: 'inline-block' }}>
                            <strong>Đội hình nhà {house} (Chỉ ~3 phút):</strong><br />
                            - A (2 bạn): Ý 1 (10-15s)<br />
                            - B (2 bạn): Ý 2 (10-15s)<br />
                            - C (1-2 bạn): Ý 3 (20-30s)<br />
                            - D (1 bạn): Vì sao 1+1=3 (10-15s)<br /><br />
                            🎙️ Cả nhóm chốt: <em>"Nhà {house} cam kết ..."</em>
                        </p>
                    </Card>
                )}

                {phase === 6 && (
                    <Card className="text-center">
                        <h3>35’–40’ KWL giấy: L + cam kết</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            Vui lòng ghi vào phần cuối của phiếu giấy:<br />
                            - <strong>L (Learned)</strong>: Em học được gì về 1+1=3? (1-2 dòng)<br />
                            - <strong>Cam kết 7 ngày</strong>: Chọn 1 hành vi (đánh dấu tick ✅)<br /><br />
                            🌟 "Synergy không phải thắng–thua; là giải pháp mới giữ điều tốt của cả hai."
                        </p>
                    </Card>
                )}
            </main>
        </div>
    );
}

export default function StudentDashboard() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh' }}>Đang tải...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
