'use client';

import React from 'react';
import { useClassState } from '../../hooks/useClassState';
import { Card } from '../../components/ui/Card';
import { Timer } from '../../components/ui/Timer';

export default function TvDisplay() {
    const { classState, loading } = useClassState();

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh', fontSize: '2rem' }}>Đang tải màn chiếu...</div>;
    }

    const phase = classState?.phase || 1;

    // Placeholder component for TV content
    const renderPhaseContent = () => {
        switch (phase) {
            case 1:
                return (
                    <div className="flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>Bước 1: KWL (Giấy)</h1>
                        <div className="glass-card" style={{ padding: '40px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '24px' }}>
                                <p><strong>K:</strong> Em đã biết gì... (1-2 gạch đầu dòng)</p>
                                <p><strong>W:</strong> Em muốn học gì... (1 gạch đầu dòng)</p>
                            </div>
                            <p style={{ color: 'var(--warning)', fontSize: '1.5rem' }}>👉 Cả lớp chuẩn bị bút và phiếu nhé!</p>
                        </div>
                        {classState?.timer_ends_at && (
                            <div style={{ marginTop: '40px' }}>
                                <Timer targetDate={classState.timer_ends_at} className="text-gradient" />
                            </div>
                        )}
                    </div>
                );
            case 2:
                return (
                    <div className="flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--secondary)' }}>Bước 2: Khởi động Poll</h1>
                        <h2 style={{ fontSize: '2.5rem' }}>Món ăn yêu thích của bạn là gì?</h2>
                        <Card style={{ padding: '60px', marginTop: '40px' }}>
                            <p style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>
                                Bức tường ý kiến & Biểu đồ sẽ hiển thị ở đây. (Đang cập nhật realtime)
                            </p>
                        </Card>
                    </div>
                );
            case 3:
                return (
                    <div className="flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--accent)' }}>Bước 3: Trò chơi Synergy</h1>
                        <h2 style={{ fontSize: '2.5rem' }}>"YES, AND" - "Mình hiểu ý bạn, và mình đề nghị..."</h2>
                        <div className="flex-center gap-lg" style={{ marginTop: '40px' }}>
                            <div className="glass-card flex-center flex-column" style={{ padding: '40px', flex: 1 }}>
                                <h3>Mục tiêu</h3>
                                <p style={{ fontSize: '1.5rem' }}>Mỗi nhà tạo chuỗi 4 câu liên tiếp nhau.</p>
                            </div>
                            <div className="glass-card flex-center flex-column" style={{ padding: '40px', flex: 1, border: '1px solid var(--primary)' }}>
                                {classState?.timer_ends_at ? (
                                    <>
                                        <h3>Đồng hồ Đạo diễn</h3>
                                        <Timer targetDate={classState.timer_ends_at} />
                                    </>
                                ) : (
                                    <p style={{ fontSize: '1.5rem' }}>Đang chờ bắt đầu...</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="flex-column gap-lg text-center" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '3rem', color: 'var(--primary)' }}>Bước 4: Cùng tạo cách mới (Làm nhóm)</h1>
                        {classState?.topic_prompt && (
                            <h2 style={{ fontSize: '2rem', background: 'var(--surface)', padding: '16px', borderRadius: '16px' }}>
                                Chủ đề: <span className="text-gradient-alt">{classState.topic_prompt}</span>
                            </h2>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', marginTop: '24px', textAlign: 'left' }}>
                            <Card glassType="panel">
                                <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '16px' }}>Đạo diễn 12 Phút</h3>
                                <ul style={{ fontSize: '1.2rem', lineHeight: '2.5', listStyleType: 'none', padding: 0 }}>
                                    <li>[0-2'] A nhập ý kiến</li>
                                    <li>[2-4'] B nhập ý kiến</li>
                                    <li>[4-6'] C chọn Điều tốt giữ lại</li>
                                    <li>[6-10'] C điền Ý 3 theo khung</li>
                                    <li>[10-12'] D checklist → CHỐT NỘP</li>
                                </ul>
                                {classState?.timer_ends_at && (
                                    <div className="flex-center" style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <Timer targetDate={classState.timer_ends_at} />
                                    </div>
                                )}
                            </Card>

                            <div className="flex-column gap-md">
                                {/* Progress Board */}
                                {['N', 'E', 'W', 'S'].map(house => (
                                    <div key={house} className="glass-card flex-between" style={{ padding: '24px', borderLeft: `8px solid var(--house-${house.toLowerCase()})` }}>
                                        <h3 style={{ fontSize: '2rem', width: '100px' }}>Nhà {house}</h3>
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', padding: '0 24px' }}>
                                            <span>Vai: --/5 </span>
                                            <span>Ý 1: ⏳</span>
                                            <span>Ý 2: ⏳</span>
                                            <span>Giữ lại: ⏳</span>
                                            <span>Ý 3: ⏳</span>
                                            <span>Chốt: ⏳</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="flex-center flex-column gap-xl" style={{ width: '100%' }}>
                        <h1 style={{ fontSize: '3.5rem' }}>Thuyết trình Sản phẩm</h1>
                        <div style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>Chờ nhóm lên bảng...</div>
                    </div>
                );
            case 6:
                return (
                    <div className="flex-center flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--success)' }}>Bước 6: KWL (L) & Cam kết</h1>
                        <div className="glass-card" style={{ padding: '40px', maxWidth: '800px' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '24px' }}>
                                Hãy trả lời phần <strong>L (Học được gì)</strong> vào phiếu và chọn 1 cam kết 7 ngày!
                            </p>
                            <h2 className="text-gradient">Cảm ơn các bạn đã tham gia bài học (1+1=3) hôm nay!</h2>
                        </div>
                    </div>
                );
            default:
                return <div>Chờ giáo viên bắt đầu...</div>;
        }
    };

    return (
        <div style={{ minHeight: '100vh', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {renderPhaseContent()}

            {/* Background decoration adjustments for TV */}
            <style dangerouslySetInnerHTML={{
                __html: `
        body { background: #070B14; }
        .bg-mesh { opacity: 0.5; }
      `}} />
        </div>
    );
}
