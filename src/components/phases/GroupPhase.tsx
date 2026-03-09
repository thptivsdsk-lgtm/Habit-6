'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface GroupPhaseProps {
    house: 'N' | 'E' | 'W' | 'S';
    studentId: string;
}

export function GroupPhase({ house, studentId }: GroupPhaseProps) {
    const [role, setRole] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
    const [loading, setLoading] = useState(true);
    const [roleAssignments, setRoleAssignments] = useState<any[]>([]);
    const [myContributions, setMyContributions] = useState<string>('');

    // Realtime Subscriptions
    useEffect(() => {
        // Fetch initial roles
        const fetchRoles = async () => {
            const { data } = await supabase.from('role_assignments').select('*').eq('house', house);
            if (data) setRoleAssignments(data);

            const myRole = data?.find((r: any) => r.student_id === studentId);
            if (myRole) setRole((myRole as any).role);

            setLoading(false);
        };

        fetchRoles();

        const channel = supabase
            .channel('roles_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'role_assignments', filter: `house=eq.${house}` },
                async () => {
                    const { data } = await supabase.from('role_assignments').select('*').eq('house', house);
                    if (data) setRoleAssignments(data);
                })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [house, studentId]);

    const handleSelectRole = async (selectedRole: 'A' | 'B' | 'C' | 'D') => {
        setLoading(true);
        const { error } = await supabase.from('role_assignments').insert([{
            house,
            role: selectedRole,
            student_id: studentId
        }] as any);

        if (!error) setRole(selectedRole);
        setLoading(false);
    };

    const handleSubmitContribution = async () => {
        if (!myContributions.trim()) return;
        setLoading(true);
        await supabase.from('contributions').insert([{
            house,
            role: role as any,
            student_id: studentId,
            content: myContributions
        }] as any);
        setLoading(false);
        alert('Đã gửi ý kiến thành công!');
        setMyContributions('');
    };

    if (loading) return <div>Đang tải dữ liệu nhóm...</div>;

    // Role Limits
    const roleCountA = roleAssignments.filter(r => r.role === 'A').length;
    const roleCountB = roleAssignments.filter(r => r.role === 'B').length;
    const roleCountC = roleAssignments.filter(r => r.role === 'C').length;
    const roleCountD = roleAssignments.filter(r => r.role === 'D').length;

    if (!role) {
        return (
            <div className="flex-column gap-md">
                <h3 className="text-center" style={{ marginBottom: '16px' }}>Chọn Vai Trò (Quota có hạn)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button
                        variant="secondary"
                        disabled={roleCountA >= 2}
                        onClick={() => handleSelectRole('A')}
                    >
                        Vai A ({roleCountA}/2) - Phương án 1
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={roleCountB >= 2}
                        onClick={() => handleSelectRole('B')}
                    >
                        Vai B ({roleCountB}/2) - Phương án 2
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={roleCountC >= 2}
                        onClick={() => handleSelectRole('C')}
                    >
                        Vai C ({roleCountC}/2) - Kết nối Ý 3
                    </Button>
                    <Button
                        variant="secondary"
                        disabled={roleCountD >= 1}
                        onClick={() => handleSelectRole('D')}
                        style={{ border: '2px solid var(--warning)' }}
                    >
                        Vai D ({roleCountD}/1) - Trọng tài & Chốt
                    </Button>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '16px' }}>
                    Hãy thảo luận cùng các bạn trong nhà {house} để phân vai nhé!
                </p>
            </div>
        );
    }

    return (
        <div className="flex-column gap-md">
            <div className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px' }}>
                <h3 style={{ margin: 0 }}>Bạn đang giữ Vai {role}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {role === 'A' && 'Đại diện Phương án 1'}
                    {role === 'B' && 'Đại diện Phương án 2'}
                    {role === 'C' && 'Kết nối & Tìm Ý 3'}
                    {role === 'D' && 'Trọng tài chốt Nhóm'}
                </span>
            </div>

            {(role === 'A' || role === 'B') && (
                <div className="flex-column gap-sm" style={{ marginTop: '16px' }}>
                    <label>Nhập 1-2 ý riêng của bạn:</label>
                    <textarea
                        value={myContributions}
                        onChange={(e) => setMyContributions(e.target.value)}
                        style={{ width: '100%', height: '100px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                        placeholder="Nhập ý kiến..."
                    />
                    <Button onClick={handleSubmitContribution} disabled={!myContributions.trim() || loading}>Gửi Lên Bảng Nhóm</Button>
                </div>
            )}

            {role === 'C' && (
                <div className="flex-column gap-sm" style={{ marginTop: '16px' }}>
                    <p style={{ color: 'var(--warning)' }}>Đang chờ A và B gửi ý kiến...</p>
                    <label>Nhập Ý Tưởng Thứ 3 (1+1=3):</label>
                    <textarea
                        value={myContributions}
                        onChange={(e) => setMyContributions(e.target.value)}
                        style={{ width: '100%', height: '150px', background: 'rgba(255,255,255,0.1)', color: 'white', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}
                        placeholder="Theo khung 3 quy định + 1 xử lý..."
                    />
                    <Button onClick={handleSubmitContribution} disabled={!myContributions.trim() || loading}>Gửi Ý 3</Button>
                </div>
            )}

            {role === 'D' && (
                <div className="flex-column gap-md" style={{ marginTop: '16px', border: '1px solid var(--warning)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--warning)', margin: 0 }}>Bảng Trọng Tài</h4>
                    <p style={{ fontSize: '0.9rem' }}>Bạn cần chờ A, B, C hoàn thành ý kiến, sau đó kiểm tra và tạo Bản Chốt Cuối Cùng.</p>
                    <Button style={{ background: 'var(--success)' }}>CHỐT NHÓM & NỘP CHO GV</Button>
                </div>
            )}
        </div>
    );
}
