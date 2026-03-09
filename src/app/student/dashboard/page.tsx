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
                        <h3>Bước 1: KWL (K & W)</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            Chủ đề: <strong style={{ color: 'white', fontSize: '1.1rem' }}>{classState?.topic_prompt}</strong><br /><br />
                            Vui lòng ghi vào phiếu giấy 2 cột đầu tiên:<br />
                            - <strong>K (Know)</strong>: Em đã biết gì về chủ đề này?<br />
                            - <strong>W (Want)</strong>: Em muốn học thêm điều gì?<br /><br />
                            👉 Hãy nhìn lên TV và chuẩn bị bút + phiếu giấy.
                        </p>
                    </Card>
                )}

                {phase === 2 && (
                    <Card className="text-center">
                        <h3>Bước 2: Khởi động Poll</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
                            Bình chọn món ăn yêu thích của bạn (Tính năng đang phát triển).
                        </p>
                    </Card>
                )}

                {phase === 3 && (
                    <Card className="text-center">
                        <h3>Bước 3: Trò chơi Synergy (Yes, And)</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
                            Cùng nhóm tạo chuỗi 4 câu. Nhập ý kiến của bạn khi được yêu cầu.
                        </p>
                    </Card>
                )}

                {phase === 4 && (
                    <Card>
                        <h3 className="text-center" style={{ marginBottom: '24px' }}>Bước 4: Làm nhóm (Cùng tạo cách mới)</h3>
                        <div className="flex-center gap-md text-center flex-column" style={{ marginBottom: '24px' }}>
                            <p>Chủ đề: <strong className="text-gradient-alt" style={{ fontSize: '1.2rem' }}>{classState?.topic_prompt}</strong></p>
                        </div>

                        <hr style={{ borderColor: 'var(--surface-border)', margin: '24px 0', opacity: 0.5 }} />

                        <GroupPhase house={house as any} studentId={name + '_' + Date.now()} />
                    </Card>
                )}

                {phase === 5 && (
                    <Card className="text-center">
                        <h3>Bước 5: Thuyết trình</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
                            Hãy chú ý lên màn hình TV và chuẩn bị lên bảng thuyết trình (1+1=3) khi tới lượt Nhà của bạn!
                        </p>
                    </Card>
                )}

                {phase === 6 && (
                    <Card className="text-center">
                        <h3>Bước 6: KWL (L) & Cam kết</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            Vui lòng ghi vào phần cuối của phiếu giấy:<br />
                            - <strong>L (Learned)</strong>: Những bài học/cách mới em đã rút ra được hôm nay là gì?<br /><br />
                            Và hãy lựa chọn 1 <strong>cam kết hành động trong 7 ngày</strong> tiếp theo. Bạn đã làm rất tốt!
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
