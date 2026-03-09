'use client';

import React from 'react';
import { useClassState } from '../../hooks/useClassState';
import { useHousesProgress } from '../../hooks/useHousesProgress';
import { Card } from '../../components/ui/Card';
import { Timer } from '../../components/ui/Timer';

export default function TvDisplay() {
    const { classState, loading } = useClassState();
    const { progress } = useHousesProgress();

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh', fontSize: '2rem' }}>Đang tải màn chiếu...</div>;
    }

    const phase = classState?.phase || 1;

    // Placeholder component for TV content
    const renderPhaseContent = () => {
        switch (phase) {
            case 1:
                return (
                    <div className="flex-column gap-xl text-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--primary)' }}>0’–2’ KWL giấy: K + W</h1>
                        {classState?.topic_prompt && (
                            <h2 style={{ fontSize: '2.5rem', background: 'var(--surface)', padding: '16px', borderRadius: '16px' }}>
                                Chủ đề: <span className="text-gradient-alt">{classState.topic_prompt}</span>
                            </h2>
                        )}
                        <div className="glass-card flex-column gap-md" style={{ padding: '40px', textAlign: 'left' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '24px', lineHeight: '1.5' }}>
                                <p><strong>K:</strong> Em đã biết gì về “khác biệt khi làm nhóm”? <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>(1 gạch đầu dòng)</span></p>
                                <p><strong>W:</strong> Em muốn đạt điều gì khi thảo luận hôm nay? <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>(1 gạch đầu dòng)</span></p>
                            </div>
                            <p style={{ color: 'var(--warning)', fontSize: '2rem', textAlign: 'center', fontWeight: 'bold' }}>⚠️ Nhấn “viết rất ngắn”, không viết dài!</p>
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
                        <h1 style={{ fontSize: '4rem', color: 'var(--secondary)' }}>2’–7’ Khởi động SEE: Poll</h1>
                        <h2 style={{ fontSize: '2.5rem' }}>Món ăn yêu thích của bạn là gì?</h2>
                        <Card style={{ padding: '60px', marginTop: '40px' }}>
                            <p style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>
                                % lựa chọn + bức tường ý kiến sẽ hiển thị ở đây. (Đang cập nhật realtime)
                            </p>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '40px', color: 'var(--primary)' }}>Tiến độ: 0/27</p>
                        </Card>
                    </div>
                );
            case 3:
                return (
                    <div className="flex-column gap-xl text-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--accent)' }}>7’–9’ Trò chơi Synergy (2 phút)</h1>
                        <div className="glass-card flex-column flex-center gap-md" style={{ padding: '40px', marginTop: '20px' }}>
                            <h2 style={{ fontSize: '3rem', color: 'var(--warning)', margin: 0 }}>Cách nói mẫu:</h2>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '20px 0' }}>💬 "Mình hiểu ý bạn, và mình đề nghị..."</p>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '20px 0' }}>💬 "Mình lo rằng..., và mình đề nghị..."</p>
                        </div>
                        {classState?.timer_ends_at && (
                            <div className="flex-center" style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                <Timer targetDate={classState.timer_ends_at} className="text-gradient" />
                            </div>
                        )}
                    </div>
                );
            case 4:
                return (
                    <div className="flex-column gap-lg text-center" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)' }}>9’–21’ Làm nhóm DO: tạo Ý 3 (12 phút)</h1>
                        {classState?.topic_prompt && (
                            <h2 style={{ fontSize: '2rem', background: 'var(--surface)', padding: '16px', borderRadius: '16px' }}>
                                Chủ đề: <span className="text-gradient-alt">{classState.topic_prompt}</span>
                            </h2>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '32px', marginTop: '24px', textAlign: 'left' }}>
                            <Card glassType="panel">
                                <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '16px' }}>Nhịp 12 Phút</h3>
                                <ul style={{ fontSize: '1.4rem', lineHeight: '2.5', listStyleType: 'none', padding: 0 }}>
                                    <li><strong>0-2' (A)</strong>: Vai A nhập 2 ý</li>
                                    <li><strong>2-4' (B)</strong>: Vai B nhập 2 ý</li>
                                    <li><strong>4-6' (C)</strong>: C chốt điều tốt cần giữ lại</li>
                                    <li><strong>6-10' (C)</strong>: C điền Ý 3 = 3 quy định + 1 xử lý</li>
                                    <li><strong>10-12' (D)</strong>: D checklist → CHỐT NỘP</li>
                                </ul>
                                {classState?.timer_ends_at && (
                                    <div className="flex-center" style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <Timer targetDate={classState.timer_ends_at} />
                                    </div>
                                )}
                            </Card>

                            <div className="flex-column gap-md">
                                {['N', 'E', 'W', 'S'].map(house => (
                                    <div key={house} className="glass-card flex-between" style={{ padding: '24px', borderLeft: `8px solid var(--house-${house.toLowerCase()})` }}>
                                        <h3 style={{ fontSize: '2.5rem', width: '120px' }}>Nhà {house}</h3>
                                        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', padding: '0 24px', opacity: progress[house].status === 'submitted' ? 1 : 0.6 }}>
                                            <span>Vai: {progress[house].roles}/7</span>
                                            <span style={{ color: progress[house].a >= 2 ? 'var(--success)' : 'inherit' }}>A: {progress[house].a}/2</span>
                                            <span style={{ color: progress[house].b >= 2 ? 'var(--success)' : 'inherit' }}>B: {progress[house].b}/2</span>
                                            <span style={{ color: progress[house].gold ? 'var(--success)' : 'inherit' }}>Giữ lại: {progress[house].gold ? '✅' : '⏳'}</span>
                                            <span style={{ color: progress[house].y3 ? 'var(--success)' : 'inherit' }}>Ý 3: {progress[house].y3 ? '✅' : '⏳'}</span>
                                            <span style={{ color: progress[house].d ? 'var(--success)' : 'inherit' }}>Chốt: {progress[house].d ? '✅' : '⏳'}</span>
                                            <span style={{ color: progress[house].status === 'submitted' ? 'var(--success)' : 'inherit', fontWeight: 'bold' }}>Nộp: {progress[house].status === 'submitted' ? '✅' : '⏳'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="flex-column gap-xl text-center" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--secondary)' }}>21’–35’ Thuyết trình GET (14 phút)</h1>
                        <p style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>Mỗi nhà ~3 phút (lên - nói - xuống)</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '32px', width: '100%', marginTop: '24px' }}>
                            {['N', 'E', 'W', 'S'].map(house => (
                                <Card key={house} className="text-left" style={{ borderTop: `8px solid var(--house-${house.toLowerCase()})` }}>
                                    <h3 style={{ fontSize: '2.5rem', color: `var(--house-${house.toLowerCase()})`, marginBottom: '16px' }}>Nhà {house}</h3>
                                    <div className="flex-column gap-sm" style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
                                        <p><strong>Ý 1 (A):</strong> {progress[house].product?.y1 || '⏳ Đang nộp...'}</p>
                                        <p><strong>Ý 2 (B):</strong> {progress[house].product?.y2 || '⏳ Đang nộp...'}</p>
                                        <p><strong>Giữ lại:</strong> {progress[house].product?.gold1 || '⏳ Đang nộp...'}</p>
                                        <p><strong>Ý 3 (C):</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progress[house].product?.y3 || '⏳ Đang nộp...'}</span></p>
                                        <p><strong>Vì sao 1+1=3:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{progress[house].product?.why || '⏳ Đang nộp...'}</span></p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="flex-center flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--success)' }}>35’–40’ KWL giấy: L + cam kết (5 phút)</h1>
                        <div className="glass-card flex-column" style={{ padding: '60px', maxWidth: '1200px', textAlign: 'left' }}>
                            <p style={{ fontSize: '2.5rem', marginBottom: '40px', lineHeight: '1.5' }}>
                                <strong>L (Learned)</strong>: Em học được gì về 1+1=3? <span style={{ opacity: 0.8 }}>(1–2 dòng)</span>
                            </p>
                            <p style={{ fontSize: '2.5rem', marginBottom: '24px', lineHeight: '1.5' }}>
                                <strong>Cam kết 7 ngày</strong>: Chọn 1 hành vi (đánh dấu tick ✅)
                            </p>
                            <div className="text-center" style={{ marginTop: '40px', fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                                "Synergy không phải thắng–thua; là giải pháp mới giữ điều tốt của cả hai."
                            </div>
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
