'use client';

import React from 'react';
import { useClassState } from '../../hooks/useClassState';
import { useHousesProgress } from '../../hooks/useHousesProgress';
import { Card } from '../../components/ui/Card';
import { Timer } from '../../components/ui/Timer';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/Button';

function TvDisplayContent() {
    const searchParams = useSearchParams();
    const urlSession = searchParams.get('session');

    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [inputPassword, setInputPassword] = React.useState('');
    const [sessionCode, setSessionCode] = React.useState<string | null>(null);
    const [joinInput, setJoinInput] = React.useState('');

    const { classState, loading } = useClassState(sessionCode);
    const { progress } = useHousesProgress(sessionCode);
    const [focusedHouse, setFocusedHouse] = React.useState<string | null>(null);
    const [pollResponses, setPollResponses] = React.useState<any[]>([]);

    React.useEffect(() => {
        const auth = localStorage.getItem('lim_tv_auth');
        if (auth === 'true') setIsAuthenticated(true);
        if (urlSession) setSessionCode(urlSession);
    }, [urlSession]);

    React.useEffect(() => {
        if (!sessionCode) return;

        // Fetch existing polls
        const fetchPolls = async () => {
            const { data } = await (supabase as any).from('poll_responses')
                .select('*')
                .eq('session_code', sessionCode);
            if (data) setPollResponses(data);
        };
        fetchPolls();

        // Listen for new polls via db changes
        const channel = supabase.channel(`poll_updates_tv_${sessionCode}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'poll_responses', filter: `session_code=eq.${sessionCode}` }, (payload) => {
                fetchPolls();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionCode]);

    // Reset focused house if phase changes
    React.useEffect(() => {
        setFocusedHouse(null);
    }, [classState?.phase]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputPassword === 'nshmadmin') {
            setIsAuthenticated(true);
            localStorage.setItem('lim_tv_auth', 'true');
        } else {
            alert('Mật khẩu không đúng!');
        }
    };

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinInput) return;
        const { data } = await supabase.from('class_state').select('session_code').eq('session_code', joinInput).single();
        if (data) {
            setSessionCode(joinInput);
        } else {
            alert('Mã PIN Phòng không tồn tại!');
        }
    };

    if (!isAuthenticated) return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
            <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                <h2>Truy Cập Màn Chiếu TV</h2>
                <form onSubmit={handleLogin} className="flex-column gap-md" style={{ marginTop: '24px', textAlign: 'left' }}>
                    <input
                        type="password"
                        value={inputPassword}
                        onChange={e => setInputPassword(e.target.value)}
                        placeholder="Nhập mật khẩu GV..."
                        className="input-field"
                        required
                    />
                    <Button type="submit">Xác nhận</Button>
                </form>
            </Card>
        </div>
    );

    if (!sessionCode) return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
            <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h2>Nhập PIN Tiết Học</h2>
                <p style={{ margin: '16px 0', opacity: 0.7 }}>Thầy Cô hãy nhập Mã PIN 5 số từ màn hình điều khiển.</p>
                <form onSubmit={handleJoinSession} className="flex-column gap-sm">
                    <input
                        type="text"
                        value={joinInput}
                        onChange={e => setJoinInput(e.target.value)}
                        placeholder="Mã PIN (5 số)..."
                        className="input-field text-center"
                        style={{ fontSize: '2rem', letterSpacing: '4px' }}
                        maxLength={5}
                        required
                    />
                    <Button type="submit" className="flex-center gap-sm" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                        <LogIn size={20} /> Kết nối Màn Chiếu
                    </Button>
                </form>
            </Card>
        </div>
    );

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh', fontSize: '2rem' }}>Đang tải màn chiếu (Mã PIN: {sessionCode})...</div>;
    }

    const phase = classState?.phase || 1;

    // Placeholder component for TV content
    const renderPhaseContent = () => {
        switch (phase) {
            case 1:
                return (
                    <div className="flex-column gap-xl text-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)', marginBottom: '16px' }}>K – Em đã biết/đã trải nghiệm gì?</h1>
                        <p style={{ fontSize: '2rem', color: 'var(--warning)', fontWeight: 'bold' }}>GV: Theo dõi thời gian (2 phút)</p>
                        <div className="glass-card text-left" style={{ padding: '32px 40px', marginTop: '24px', fontSize: '1.8rem', lineHeight: '1.6' }}>
                            <div className="flex-column gap-md">
                                <div>
                                    <strong className="text-gradient">K1. Về “khác biệt” trong nhóm/lớp:</strong> <span style={{ fontSize: '1.4rem', opacity: 0.8 }}>(Khoanh 1 ý đúng với em nhất)</span>
                                    <ul style={{ listStyleType: 'none', paddingLeft: '24px', margin: '12px 0 0 0', fontSize: '1.6rem' }}>
                                        <li>☐ Khác biệt thường làm khó làm việc cùng nhau</li>
                                        <li>☐ Khác biệt giúp nhóm mạnh hơn nếu biết cách</li>
                                        <li>☐ Em chưa rõ khác biệt giúp hay hại</li>
                                    </ul>
                                </div>
                                <hr style={{ borderColor: 'var(--surface-border)', margin: '12px 0', opacity: 0.5 }} />
                                <div>
                                    <strong className="text-gradient">K2. Em từng thấy “cùng nhau tốt hơn” trong tình huống nào?</strong> <span style={{ fontSize: '1.4rem', opacity: 0.8 }}>(viết 1 ví dụ thật ngắn)</span>
                                    <p style={{ margin: '12px 0 0 24px', fontSize: '1.6rem' }}>Ví dụ: ________________________________________________________</p>
                                </div>
                                <hr style={{ borderColor: 'var(--surface-border)', margin: '12px 0', opacity: 0.5 }} />
                                <div>
                                    <strong className="text-gradient">K3. Khi có ý kiến trái nhau, nhóm thường…</strong> <span style={{ fontSize: '1.4rem', opacity: 0.8 }}>(tick 1)</span>
                                    <div style={{ display: 'flex', gap: '32px', margin: '12px 0 0 24px', fontSize: '1.6rem' }}>
                                        <span>☐ cãi nhau</span>
                                        <span>☐ im lặng</span>
                                        <span>☐ mỗi người một ý</span>
                                        <span>☐ tìm cách kết hợp</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {classState?.timer_ends_at && (
                            <div style={{ marginTop: '40px' }}>
                                <Timer targetDate={classState.timer_ends_at} className="text-gradient" />
                            </div>
                        )}
                    </div>
                );
            case 2:
                // 2'–7' Khởi động SEE: Poll
                return (
                    <div className="flex-column gap-md text-center" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '3rem', color: 'var(--secondary)' }}>Khởi động SEE: Poll Cảm Nhận</h1>
                        <h2 style={{ fontSize: '2.5rem', lineHeight: '1.4' }}>“Nếu cả tháng ngày nào em cũng ăn món em thích nhất, <br />em nghĩ điều gì sẽ xảy ra?”</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px', width: '100%' }}>
                            <Card className="text-left" style={{ padding: '32px' }}>
                                <h3 style={{ color: 'var(--warning)', marginBottom: '16px' }}>Bước 1: Chọn nhanh (15s)</h3>
                                <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>A. Em vẫn thích như cũ</p>
                                <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>B. Em sẽ chán dần</p>
                                <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>C. Em có thể chán nhưng vẫn ăn vì tiện</p>
                                <p style={{ fontSize: '1.5rem', margin: '4px 0' }}>D. Em không chắc</p>
                            </Card>
                            <Card className="text-left" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Bước 2: Giải thích (20-30s)</h3>
                                <p style={{ fontSize: '2rem', fontStyle: 'italic', opacity: 0.8 }}>“Vì sao em chọn đáp án đó? (1 câu)”</p>
                                <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '12px', maxHeight: '300px' }}>
                                        {pollResponses.length === 0 ? (
                                            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                                                (Bức tường ý kiến ẩn danh sẽ hiển thị ở đây...)
                                            </p>
                                        ) : (
                                            pollResponses.slice().reverse().map((resp, i) => (
                                                <div key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${resp.choice === 'A' ? 'var(--house-n)' : resp.choice === 'B' ? 'var(--house-e)' : resp.choice === 'C' ? 'var(--house-s)' : 'var(--house-w)'}` }}>
                                                    <span style={{ fontWeight: 'bold', marginRight: '8px', color: 'var(--text-secondary)' }}>Chọn {resp.choice}:</span>
                                                    <span style={{ fontSize: '1.4rem' }}>{resp.reason}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '16px', color: 'var(--success)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                        Đã gửi: {pollResponses.length} ý kiến
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="flex-column gap-xl text-center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--accent)' }}>Trò chơi Synergy</h1>
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
                        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary)' }}>Làm nhóm DO: tạo Ý 3</h1>
                        {classState?.topic_prompt && (
                            <h2 style={{ fontSize: '2rem', background: 'var(--surface)', padding: '16px', borderRadius: '16px' }}>
                                Chủ đề: <span className="text-gradient-alt">{classState.topic_prompt}</span>
                            </h2>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '32px', marginTop: '24px', textAlign: 'left' }}>
                            <Card glassType="panel">
                                <h3 style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '16px', marginBottom: '16px' }}>Nhiệm vụ các Vai</h3>
                                <ul style={{ fontSize: '1.4rem', lineHeight: '2.5', listStyleType: 'none', padding: 0 }}>
                                    <li><strong>Vai A (Nên dùng)</strong>: Nhập các ý kiến</li>
                                    <li><strong>Vai B (Không nên)</strong>: Nhập các ý kiến</li>
                                    <li><strong>Vai C</strong>: Chốt điều cần giữ lại</li>
                                    <li><strong>Vai C</strong>: Điền Ý 3 = 3 quy định + 1 xử lý</li>
                                    <li><strong>Vai D</strong>: Kiểm tra → CHỐT NỘP</li>
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
                                            <span style={{ color: progress[house].a >= 2 ? 'var(--success)' : 'inherit' }}>A (Nên): {progress[house].a}/2</span>
                                            <span style={{ color: progress[house].b >= 2 ? 'var(--success)' : 'inherit' }}>B (Không): {progress[house].b}/2</span>
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
                    <div className="flex-column gap-xl text-center" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
                        <h1 style={{ fontSize: '4rem', color: 'var(--secondary)' }}>Thuyết trình GET</h1>
                        {focusedHouse === null && <p style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>Mỗi nhà ~3 phút (lên - nói - xuống)</p>}

                        {focusedHouse ? (
                            <div className="flex-column gap-lg animate-fade-in" style={{ width: '100%' }}>
                                <div className="flex-between">
                                    <button onClick={() => setFocusedHouse(null)} className="btn-secondary" style={{ fontSize: '1.5rem', padding: '12px 24px' }}>
                                        ⬅ Quay lại danh sách
                                    </button>
                                </div>
                                <Card className="text-left" style={{ borderTop: `12px solid var(--house-${focusedHouse.toLowerCase()})`, padding: '60px' }}>
                                    <div className="flex-between" style={{ marginBottom: '40px' }}>
                                        <h3 style={{ fontSize: '4.5rem', color: `var(--house-${focusedHouse.toLowerCase()})`, margin: 0 }}>Nhà {focusedHouse}</h3>
                                        <img src={`/logo/Nha ${focusedHouse}.png`} alt={`Logo Nhà ${focusedHouse}`} style={{ width: '120px', height: '120px', objectFit: 'contain' }} />
                                    </div>
                                    <div className="flex-column gap-md" style={{ fontSize: '2.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                        <p><strong>Ý 1 (Nên dùng):</strong> {progress[focusedHouse].product?.y1 || '⏳ Đang nộp...'}</p>
                                        <p><strong>Ý 2 (Không nên):</strong> {progress[focusedHouse].product?.y2 || '⏳ Đang nộp...'}</p>
                                        <hr style={{ borderColor: 'var(--surface-border)', margin: '24px 0', opacity: 0.5 }} />
                                        <p><strong>Giữ lại:</strong> {progress[focusedHouse].product?.gold1 || '⏳ Đang nộp...'}</p>
                                        <p><strong>Ý 3 (Giải pháp mới):</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progress[focusedHouse].product?.y3 || '⏳ Đang nộp...'}</span></p>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '12px', marginTop: '24px' }}>
                                            <p style={{ margin: 0 }}><strong>Vì sao 1+1=3:</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{progress[focusedHouse].product?.why || '⏳ Đang nộp...'}</span></p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '32px', width: '100%', marginTop: '24px' }}>
                                {['N', 'E', 'W', 'S'].map(house => (
                                    <Card
                                        key={house}
                                        className="text-left glass-card"
                                        style={{ borderTop: `8px solid var(--house-${house.toLowerCase()})`, cursor: 'pointer', position: 'relative' }}
                                        onClick={() => setFocusedHouse(house)}
                                    >
                                        <div className="flex-between" style={{ marginBottom: '16px' }}>
                                            <h3 style={{ fontSize: '2.5rem', color: `var(--house-${house.toLowerCase()})`, margin: 0 }}>Nhà {house}</h3>
                                            <img src={`/logo/Nha ${house}.png`} alt={`Logo Nhà ${house}`} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                                        </div>
                                        <div className="flex-column gap-sm" style={{ fontSize: '1.4rem', color: 'var(--text-secondary)' }}>
                                            <p><strong>Ý 1 (A):</strong> {progress[house].product?.y1?.substring(0, 50) + (progress[house].product?.y1?.length > 50 ? '...' : '') || '⏳ Đang nộp...'}</p>
                                            <p><strong>Ý 2 (B):</strong> {progress[house].product?.y2?.substring(0, 50) + (progress[house].product?.y2?.length > 50 ? '...' : '') || '⏳ Đang nộp...'}</p>
                                            <p><strong>Giữ lại:</strong> {progress[house].product?.gold1?.substring(0, 50) + (progress[house].product?.gold1?.length > 50 ? '...' : '') || '⏳ Đang nộp...'}</p>
                                            <p><strong>Ý 3 (C):</strong> <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{progress[house].product?.y3?.substring(0, 50) + (progress[house].product?.y3?.length > 50 ? '...' : '') || '⏳ Đang nộp...'}</span></p>
                                            <p><strong>Chốt (D):</strong> <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{progress[house].product?.why?.substring(0, 50) + (progress[house].product?.why?.length > 50 ? '...' : '') || '⏳ Đang nộp...'}</span></p>
                                        </div>
                                        <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '1.2rem', color: 'var(--primary)', opacity: 0.8 }}>
                                            Bấm để xem lớn 🔍
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                );
            case 6:
                return (
                    <div className="flex-center flex-column gap-xl text-center">
                        <h1 style={{ fontSize: '4rem', color: 'var(--success)' }}>KWL giấy: L + cam kết</h1>
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

export default function TvDisplay() {
    return (
        <React.Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh', fontSize: '2rem' }}>Đang tải hệ thống...</div>}>
            <TvDisplayContent />
        </React.Suspense>
    );
}
