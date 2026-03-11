'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClassState } from '../../../hooks/useClassState';
import { Card } from '../../../components/ui/Card';
import { Timer } from '../../../components/ui/Timer';
import { GroupPhase } from '../../../components/phases/GroupPhase';
import { Button } from '../../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

function DashboardContent() {
    const searchParams = useSearchParams();
    const house = searchParams.get('house') || 'N';
    const name = searchParams.get('name') || 'Học sinh';
    const rawUid = searchParams.get('uid');

    const [uid, setUid] = useState(rawUid || '');
    const [sessionCode, setSessionCode] = useState<string | null>(null);

    // Poll State
    const [pollChoice, setPollChoice] = useState<string>('');
    const [pollReason, setPollReason] = useState<string>('');
    const [isPollSubmitting, setIsPollSubmitting] = useState(false);
    const [pollSubmitted, setPollSubmitted] = useState(false);

    useEffect(() => {
        const storedSession = localStorage.getItem('lim_session');
        if (storedSession) setSessionCode(storedSession);
        let currentUid = uid;
        if (!currentUid) {
            const stored = localStorage.getItem('lim_session_id');
            if (stored) {
                setUid(stored);
                currentUid = stored;
            }
        }

        if (currentUid && sessionCode) {
            // Khôi phục trạng thái poll nếu có trong localStorage
            const savedChoice = localStorage.getItem(`lim_poll_choice_${sessionCode}_${currentUid}`);
            const savedReason = localStorage.getItem(`lim_poll_reason_${sessionCode}_${currentUid}`);
            if (savedChoice) {
                setPollChoice(savedChoice);
                setPollReason(savedReason || '');
                setPollSubmitted(true);
            } else {
                setPollChoice('');
                setPollReason('');
                setPollSubmitted(false);
            }
        }
    }, [uid, sessionCode]);

    const { classState, loading } = useClassState(sessionCode);

    const handlePollSubmit = async () => {
        if (!pollChoice || !pollReason.trim()) {
            alert('Vui lòng chọn 1 đáp án và nhập 1 câu lý do!');
            return;
        }
        setIsPollSubmitting(true);
        try {
            // Tạm thời lưu localStorage và bảng student_session nếu được
            localStorage.setItem(`lim_poll_choice_${sessionCode}_${uid}`, pollChoice);
            localStorage.setItem(`lim_poll_reason_${sessionCode}_${uid}`, pollReason);

            // Gọi API lưu bảng poll_responses (chờ user chạy SQL)
            await (supabase as any).from('poll_responses').upsert({
                student_id: uid,
                session_code: sessionCode,
                choice: pollChoice,
                reason: pollReason,
                house: house
            }, { onConflict: 'session_code, student_id' });

            setPollSubmitted(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPollSubmitting(false);
        }
    };

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
                        <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>K – Em đã biết/đã trải nghiệm gì?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            Vui lòng xem hướng dẫn trên <strong style={{ color: 'white' }}>Màn chiếu TV</strong> và hoàn thành phần K trên phiếu giấy của em.<br /><br />
                            <span style={{ color: 'var(--warning)' }}>👉 Lưu ý: Trả lời thật ngắn gọn vào các câu K1, K2, K3 trong vòng 2 phút.</span>
                        </p>
                    </Card>
                )}

                {phase === 2 && (
                    <Card className="text-center flex-column gap-md">
                        <h3 style={{ color: 'var(--primary)' }}>Khởi động SEE: Poll</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>“Nếu cả tháng ngày nào em cũng ăn món em thích nhất, em nghĩ điều gì sẽ xảy ra?”</p>

                        <div className="flex-column gap-sm" style={{ textAlign: 'left', marginTop: '12px' }}>
                            {['A', 'B', 'C', 'D'].map((opt, i) => {
                                const texts = [
                                    "A. Em vẫn thích như cũ",
                                    "B. Em sẽ chán dần",
                                    "C. Em có thể chán nhưng vẫn ăn vì tiện",
                                    "D. Em không chắc"
                                ];
                                return (
                                    <button
                                        key={opt}
                                        className={pollChoice === opt ? "btn-primary" : "btn-secondary"}
                                        style={{
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            textAlign: 'left',
                                            border: pollChoice === opt ? '2px solid var(--accent)' : '2px solid transparent',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => !pollSubmitted && setPollChoice(opt)}
                                        disabled={pollSubmitted}
                                    >
                                        {texts[i]}
                                    </button>
                                );
                            })}
                        </div>

                        <p style={{ color: 'var(--text-secondary)', marginTop: '16px', textAlign: 'left' }}>Vì sao em chọn đáp án đó? (1 câu)</p>
                        <textarea
                            value={pollReason}
                            onChange={(e) => setPollReason(e.target.value)}
                            placeholder="Nhập lý do (ẩn danh)..."
                            className="input-field"
                            style={{ width: '100%', minHeight: '80px', fontSize: '1.2rem', padding: '12px' }}
                            disabled={pollSubmitted}
                        />

                        {!pollSubmitted ? (
                            <Button isLoading={isPollSubmitting} onClick={handlePollSubmit} className="btn-primary" style={{ padding: '12px 16px', borderRadius: '8px', width: '100%', fontSize: '1.2rem' }}>
                                Gửi bình chọn & Ý kiến
                            </Button>
                        ) : (
                            <div style={{ background: 'var(--success)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 'bold' }}>
                                ✅ Đã gửi thành công! (Chờ các bạn khác)
                            </div>
                        )}
                    </Card>
                )}



                {phase === 3 && (
                    <Card>
                        <h3 className="text-center" style={{ marginBottom: '24px' }}>Làm nhóm DO (Tạo Ý 3)</h3>
                        <div className="flex-center gap-md text-center flex-column" style={{ marginBottom: '24px' }}>
                            <p>Chủ đề: <strong className="text-gradient-alt" style={{ fontSize: '1.2rem' }}>{classState?.topic_prompt}</strong></p>
                        </div>

                        <hr style={{ borderColor: 'var(--surface-border)', margin: '24px 0', opacity: 0.5 }} />

                        {uid ? (
                            <GroupPhase sessionCode={sessionCode} house={house as any} studentId={uid} />
                        ) : (
                            <p style={{ color: 'var(--warning)' }}>Vui lòng đăng nhập lại để nhận diện mã phiên hợp lệ.</p>
                        )}
                    </Card>
                )}

                {phase === 4 && (
                    <Card className="text-center">
                        <h3>Thuyết trình GET</h3>
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

                {phase === 5 && (
                    <Card className="text-center">
                        <h3>Tuyên ngôn Doanh nghiệp</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            (Mời các bạn hướng lên màn hình TV lớn)
                        </p>
                    </Card>
                )}

                {phase === 6 && (
                    <Card className="text-center">
                        <h3>Kết Luận</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            (Mời các bạn hướng lên màn hình TV lớn)
                        </p>
                    </Card>
                )}

                {phase === 7 && (
                    <Card className="text-center">
                        <h3>KWL giấy: L + cam kết</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '12px', lineHeight: '1.6' }}>
                            Vui lòng ghi vào phần cuối của phiếu giấy KWL:<br /><br />
                            <strong>L (Learned)</strong>: Tóm tắt thật ngắn (1-2 dòng) về:<br />
                            - Khác biệt làm nhóm mạnh hơn thế nào?<br />
                            - 1+1=3 nghĩa là gì? (kèm 1 minh chứng từ nhóm em)<br />
                            - Vì sao doanh nghiệp đề cao đa dạng?<br /><br />
                            <strong>Cam kết 7 ngày</strong> (Chọn 1 hành vi bằng cách đánh dấu ✅):<br />
                            ⬜ “Mình hiểu ý bạn…” trước khi phản bác<br />
                            ⬜ Tìm “điều hay/điểm mạnh” trong ý kiến khác<br />
                            ⬜ Không cắt lời khi bạn đang nói<br /><br />
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
