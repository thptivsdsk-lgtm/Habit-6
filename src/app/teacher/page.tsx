'use client';

import React, { useState, useEffect } from 'react';
import { useClassState } from '../../hooks/useClassState';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Play, Square, ExternalLink } from 'lucide-react';

const PHASES = [
    { id: 1, name: '0’–2’ KWL giấy: K + W', targetDuration: 2 * 60 },
    { id: 2, name: '2’–7’ Khởi động SEE: Poll', targetDuration: 5 * 60 },
    { id: 3, name: '7’–9’ Trò SYNERGY (Yes, And)', targetDuration: 2 * 60 },
    { id: 4, name: '9’–21’ Làm nhóm DO (Tạo Ý 3)', targetDuration: 12 * 60 },
    { id: 5, name: '21’–35’ Thuyết trình GET', targetDuration: 14 * 60 },
    { id: 6, name: '35’–40’ KWL giấy: L + cam kết', targetDuration: 5 * 60 },
];

export default function TeacherDashboard() {
    const { classState, loading } = useClassState();
    const [activeTab, setActiveTab] = useState<'control' | 'preview'>('control');
    const [stats, setStats] = useState({ N: 0, E: 0, W: 0, S: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const { data } = await supabase.from('student_session').select('house');
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

        const channel = supabase.channel('student_stats')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'student_session' }, fetchStats)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    if (loading) return <div className="flex-center" style={{ minHeight: '100vh' }}>Đang tải...</div>;

    const currentPhase = classState?.phase || 1;

    const handleSetPhase = async (phaseId: number) => {
        await (supabase as any).from('class_state').update({ phase: phaseId, timer_ends_at: null }).eq('id', 1);
    };

    const startTimer = async (minutes: number) => {
        const endsAt = new Date(Date.now() + minutes * 60000).toISOString();
        await (supabase as any).from('class_state').update({ timer_ends_at: endsAt }).eq('id', 1);
    };

    const stopTimer = async () => {
        await (supabase as any).from('class_state').update({ timer_ends_at: null }).eq('id', 1);
    };

    const openTVWindow = () => {
        window.open('/tv', 'LIM Synergy TV', 'width=1280,height=720,menubar=no,toolbar=no');
    };

    return (
        <div className="container" style={{ padding: '24px 0' }}>
            <header className="glass-panel flex-column" style={{ marginBottom: '24px', alignItems: 'flex-start', gap: '16px' }}>
                <div className="flex-between" style={{ width: '100%' }}>
                    <h2>Bảng Điều Khiển Giáo Viên</h2>
                    <Button onClick={openTVWindow} variant="secondary" className="flex-center gap-sm">
                        <ExternalLink size={18} />
                        Mở Màn Chiếu (/tv)
                    </Button>
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
                                    <Button variant="secondary" onClick={() => startTimer(2)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu A 2:00</Button>
                                    <Button variant="secondary" onClick={() => startTimer(2)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu B 2:00</Button>
                                    <Button variant="secondary" onClick={() => startTimer(2)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu C 2:00</Button>
                                    <Button variant="secondary" onClick={() => startTimer(4)} className="flex-center gap-sm"><Play size={16} /> Bắt đầu Ý3 4:00</Button>
                                    <Button variant="secondary" onClick={() => startTimer(2)} className="flex-center gap-sm" style={{ gridColumn: 'span 2' }}><Play size={16} /> Bắt đầu Chốt 2:00</Button>
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
                    <iframe src="/tv" style={{ width: '100%', height: '100%', border: 'none' }} title="TV Preview" />
                </Card>
            )}
        </div>
    );
}
