'use client';

import React, { useState, useEffect } from 'react';
import { useClassState } from '../../hooks/useClassState';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, Square, ExternalLink, ShieldCheck, Plus, LogIn } from 'lucide-react';

const PHASES = [
    { id: 1, name: 'KWL giấy: K + W', targetDuration: 2 * 60 },
    { id: 2, name: 'Khởi động SEE: Poll', targetDuration: 5 * 60 },
    { id: 3, name: 'Làm nhóm DO (Tạo Ý 3)', targetDuration: 14 * 60 },
    { id: 4, name: 'Thuyết trình GET', targetDuration: 10 * 60 },
    { id: 5, name: 'Tuyên bố Doanh nghiệp', targetDuration: 5 * 60 },
    { id: 6, name: 'Kết luận', targetDuration: 1 * 60 },
    { id: 7, name: 'KWL giấy: L + cam kết', targetDuration: 3 * 60 },
];

export default function TeacherDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [inputPassword, setInputPassword] = useState('');
    const [sessionCode, setSessionCode] = useState<string | null>(null);
    const [joinInput, setJoinInput] = useState('');

    const { classState, loading } = useClassState(sessionCode);
    const [activeTab, setActiveTab] = useState<'control' | 'preview'>('control');
    const [stats, setStats] = useState({ N: 0, E: 0, W: 0, S: 0 });

    useEffect(() => {
        // Khôi phục session và auth
        const auth = localStorage.getItem('lim_teacher_auth');
        const sess = localStorage.getItem('lim_teacher_session');
        if (auth === 'true') setIsAuthenticated(true);
        if (sess) setSessionCode(sess);
    }, []);

    useEffect(() => {
        if (!sessionCode) return;
        const fetchStats = async () => {
            const { data } = await supabase.from('student_session').select('house').eq('session_code', sessionCode);
            if (data) {
                const newStats = { N: 0, E: 0, W: 0, S: 0 };
                data.forEach((s: any) => {
                    if (newStats[s.house as keyof typeof newStats] !== undefined) {
                        newStats[s.house as keyof typeof newStats]++;
                    }
                });
                setStats(newStats);
            }
        };

        fetchStats();

        const channel = supabase.channel(`student_stats_${sessionCode}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'student_session', filter: `session_code=eq.${sessionCode}` }, fetchStats)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [sessionCode]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputPassword === 'nshmadmin') {
            setIsAuthenticated(true);
            localStorage.setItem('lim_teacher_auth', 'true');
        } else {
            alert('Mật khẩu không đúng!');
        }
    };

    const handleCreateSession = async () => {
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const { error } = await (supabase as any).from('class_state').insert([{ session_code: code }]);
        if (error) {
            alert('Lỗi tạo phòng: ' + error.message);
        } else {
            setSessionCode(code);
            localStorage.setItem('lim_teacher_session', code);
        }
    };

    const handleJoinSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinInput) return;
        const { data } = await supabase.from('class_state').select('session_code').eq('session_code', joinInput).single();
        if (data) {
            setSessionCode(joinInput);
            localStorage.setItem('lim_teacher_session', joinInput);
        } else {
            alert('Mã phòng không tồn tại!');
        }
    };

    if (!isAuthenticated) return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
            <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                <h2>Mật Khẩu Giáo Viên</h2>
                <form onSubmit={handleLogin} className="flex-column gap-md" style={{ marginTop: '24px', textAlign: 'left' }}>
                    <input
                        type="password"
                        value={inputPassword}
                        onChange={e => setInputPassword(e.target.value)}
                        placeholder="Nhập mật khẩu..."
                        className="input-field"
                        required
                    />
                    <Button type="submit">Đăng Nhập</Button>
                </form>
            </Card>
        </div>
    );

    if (!sessionCode) return (
        <div className="container flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
            <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
                <h2>Quản Lý Tiết Học</h2>
                <div style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginTop: '24px' }}>
                    <Button onClick={handleCreateSession} className="flex-center gap-sm" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                        <Plus /> TẠO TIẾT HỌC MỚI
                    </Button>
                    <p style={{ margin: '16px 0', opacity: 0.7 }}>Hoặc tiếp tục tiết học cũ bằng Mã PIN:</p>
                    <form onSubmit={handleJoinSession} className="flex-column gap-sm">
                        <input
                            type="text"
                            value={joinInput}
                            onChange={e => setJoinInput(e.target.value)}
                            placeholder="Nhập mã PIN 5 số..."
                            className="input-field"
                            maxLength={5}
                            required
                        />
                        <Button type="submit" variant="secondary" className="flex-center gap-sm"><LogIn size={18} /> Vào phòng</Button>
                    </form>
                </div>
            </Card>
        </div>
    );

    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Đang tải...</div>;

    const currentPhase = classState?.phase || 1;

    const handleSetPhase = async (phaseId: number) => {
        await (supabase as any).from('class_state').update({ phase: phaseId, timer_ends_at: null }).eq('session_code', sessionCode);
    };

    const startTimer = async (minutes: number) => {
        const endsAt = new Date(Date.now() + minutes * 60000).toISOString();
        await (supabase as any).from('class_state').update({ timer_ends_at: endsAt }).eq('session_code', sessionCode);
    };

    const stopTimer = async () => {
        await (supabase as any).from('class_state').update({ timer_ends_at: null }).eq('session_code', sessionCode);
    };

    const openTVWindow = () => {
        window.open(`/tv?session=${sessionCode}`, 'LIM Synergy TV', 'width=1280,height=720,menubar=no,toolbar=no');
    };

    return (
        <div className="container" style={{ padding: '24px 0' }}>
            <header className="glass-panel flex-column" style={{ marginBottom: '24px', alignItems: 'flex-start', gap: '16px' }}>
                <div className="flex-between" style={{ width: '100%' }}>
                    <div>
                        <h2>Bảng Điều Khiển Giáo Viên</h2>
                        <h3 className="text-gradient" style={{ marginTop: '8px' }}>MÃ PIN: {sessionCode}</h3>
                    </div>
                    <div className="flex-center gap-md">
                        <Button
                            onClick={() => { setSessionCode(null); localStorage.removeItem('lim_teacher_session'); }}
                            variant="secondary"
                        >Đổi Phòng</Button>
                        <Button onClick={openTVWindow} variant="secondary" className="flex-center gap-sm">
                            <ExternalLink size={18} />
                            Mở Màn Chiếu (/tv)
                        </Button>
                    </div>
                </div>
                {classState?.topic_prompt && (
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px', width: '100%' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Vấn đề thảo luận: </span>
                        <strong className="text-gradient-alt" style={{ fontSize: '1.2rem' }}>{classState.topic_prompt}</strong>
                    </div>
                )}
            </header>

            <div className="flex-center gap-md" style={{ marginBottom: '24px' }}>
                <button
                    className={activeTab === 'control' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('control')}
                >
                    Điều khiển & Thống kê
                </button>
                <button
                    className={activeTab === 'preview' ? 'btn-primary' : 'btn-secondary'}
                    onClick={() => setActiveTab('preview')}
                >
                    Tab Màn Chiếu (Nhúng)
                </button>
            </div>

            {activeTab === 'control' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Phase Controls */}
                    <Card>
                        <h3 style={{ marginBottom: '16px' }}>Thanh Điều Khiển Giai Đoạn</h3>
                        <div className="flex-column gap-sm">
                            {PHASES.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSetPhase(p.id)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: `1px solid ${currentPhase === p.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                                        background: currentPhase === p.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        textAlign: 'left',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div className="flex-between">
                                        <span>{p.name}</span>
                                        {currentPhase === p.id && <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>Đang diễn ra</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Timer & Stats Controls */}
                    <div className="flex-column gap-lg">
                        <Card>
                            <h3 style={{ marginBottom: '16px' }}>Điều Khiển Đồng Hồ</h3>

                            <div className="flex-column gap-md">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    <Button variant="secondary" onClick={() => startTimer(1)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 1 Phút</Button>
                                    <Button variant="secondary" onClick={() => startTimer(2)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 2 Phút</Button>
                                    <Button variant="secondary" onClick={() => startTimer(4)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 4 Phút</Button>
                                    <Button variant="secondary" onClick={() => startTimer(5)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 5 Phút</Button>
                                    <Button variant="secondary" onClick={() => startTimer(11)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 11 Phút (Nhóm)</Button>
                                    <Button variant="secondary" onClick={() => startTimer(10)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu 10 Phút (Thuyết trình)</Button>
                                </div>

                                <hr style={{ borderColor: 'var(--surface-border)', opacity: 0.5 }} />

                                <Button onClick={stopTimer} style={{ background: 'var(--error)' }} className="flex-center gap-sm">
                                    <Square size={16} /> Stop / Reset Timer
                                </Button>
                            </div>
                        </Card>

                        <Card>
                            <h3 style={{ marginBottom: '16px' }}>Thống Kê Nhanh (Realtime)</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Số lượng học sinh, quota và tiến độ chốt ý 3 của 4 Nhà sẽ hiện ở đây. (Đang cập nhật)
                            </p>

                            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {['N', 'E', 'W', 'S'].map(house => (
                                    <div key={house} className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
                                        <h4 style={{ color: `var(--house-${house.toLowerCase()})` }}>Nhà {house}</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats[house as keyof typeof stats]} HS</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <Card style={{ padding: 0, overflow: 'hidden', height: '600px' }}>
                    <iframe src={`/tv?session=${sessionCode}`} style={{ width: '100%', height: '100%', border: 'none' }} title="TV Preview" />
                </Card>
            )}
        </div>
    );
}
