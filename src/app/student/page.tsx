'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

function StudentLoginContent() {
    const searchParams = useSearchParams();
    const urlSession = searchParams.get('session');

    const [name, setName] = useState('');
    const [house, setHouse] = useState<'N' | 'E' | 'W' | 'S' | ''>('');
    const [sessionCode, setSessionCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // URL session param takes priority
        if (urlSession) {
            setSessionCode(urlSession);
            return;
        }
        const savedName = localStorage.getItem('lim_name');
        const savedHouse = localStorage.getItem('lim_house');
        const savedSession = localStorage.getItem('lim_session');
        if (savedName) setName(savedName);
        if (savedHouse) setHouse(savedHouse as any);
        if (savedSession) setSessionCode(savedSession);
    }, [urlSession]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !house || !sessionCode) return;

        setIsLoading(true);

        // Validate session
        const { data: sessionInfo } = await (supabase as any).from('class_state').select('session_code').eq('session_code', sessionCode).single();
        if (!sessionInfo) {
            alert('Mã tiết học không tồn tại!');
            setIsLoading(false);
            return;
        }

        localStorage.setItem('lim_name', name);
        localStorage.setItem('lim_house', house);
        localStorage.setItem('lim_session', sessionCode);

        let sessionId = localStorage.getItem('lim_session_id');

        try {
            if (!sessionId) {
                const { data } = await (supabase as any).from('student_session').insert({ name, house, session_code: sessionCode }).select('id').single();
                if (data?.id) {
                    sessionId = data.id as string;
                    localStorage.setItem('lim_session_id', sessionId);
                }
            } else {
                await (supabase as any).from('student_session').update({ name, house, session_code: sessionCode }).eq('id', sessionId);
            }
        } catch (error) {
            console.error(error);
        }

        window.location.href = `/student/dashboard?house=${house}&name=${encodeURIComponent(name)}&uid=${sessionId || ''}`;
    };

    const houses = [
        { id: 'N', name: 'Nhà N', color: 'var(--house-n)' },
        { id: 'E', name: 'Nhà E', color: 'var(--house-e)' },
        { id: 'W', name: 'Nhà W', color: 'var(--house-w)' },
        { id: 'S', name: 'Nhà S', color: 'var(--house-s)' },
    ];

    return (
        <div className="container flex-column flex-center" style={{ minHeight: '100vh', padding: '24px' }}>
            <Card glassType="panel" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center" style={{ marginBottom: '24px' }}>Tham gia lớp học</h2>

                <form onSubmit={handleJoin} className="flex-column gap-lg">
                    <div className="flex-column gap-sm">
                        <label htmlFor="session" style={{ fontWeight: 500 }}>Mã tiết học (PIN)</label>
                        <input
                            id="session"
                            type="text"
                            value={sessionCode}
                            onChange={(e) => setSessionCode(e.target.value)}
                            placeholder="Nhập mã 5 số GV cung cấp..."
                            maxLength={5}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1.2rem', letterSpacing: '2px', textAlign: 'center' }}
                            required
                        />
                    </div>

                    <div className="flex-column gap-sm">
                        <label htmlFor="name" style={{ fontWeight: 500 }}>Tên của bạn</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên..."
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '1rem' }}
                            required
                        />
                    </div>

                    <div className="flex-column gap-sm">
                        <label style={{ fontWeight: 500 }}>Chọn Nhà</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {houses.map((h) => (
                                <button
                                    key={h.id}
                                    type="button"
                                    onClick={() => setHouse(h.id as any)}
                                    style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        border: `2px solid ${house === h.id ? h.color : 'transparent'}`,
                                        background: house === h.id ? `${h.color}33` : 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        transition: 'all var(--transition-fast)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <img src={`/logo/Nha ${h.id}.png`} alt={`Logo Nhà ${h.id}`} style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                                    <span>{h.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} disabled={!name || !house || !sessionCode} style={{ marginTop: '16px' }}>
                        Vào lớp
                    </Button>
                </form>
            </Card>
        </div>
    );
}

export default function StudentLogin() {
    return (
        <Suspense fallback={<div className="flex-center" style={{ minHeight: '100vh' }}>Đang tải...</div>}>
            <StudentLoginContent />
        </Suspense>
    );
}
