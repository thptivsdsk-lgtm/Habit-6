'use client';

import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function StudentLogin() {
    const [name, setName] = useState('');
    const [house, setHouse] = useState<'N' | 'E' | 'W' | 'S' | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !house) return;

        setIsLoading(true);
        // TODO: Create session in Supabase and redirect to /student/dashboard
        setTimeout(() => {
            setIsLoading(false);
            // Mock navigation
            window.location.href = `/student/dashboard?house=${house}&name=${encodeURIComponent(name)}`;
        }, 1000);
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
                                        transition: 'all var(--transition-fast)'
                                    }}
                                >
                                    <span style={{ color: h.color, display: 'block', fontSize: '1.5rem', marginBottom: '4px' }}>{h.id}</span>
                                    {h.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" isLoading={isLoading} disabled={!name || !house} style={{ marginTop: '16px' }}>
                        Vào lớp
                    </Button>
                </form>
            </Card>
        </div>
    );
}
