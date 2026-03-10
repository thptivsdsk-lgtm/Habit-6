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

    // Inputs depending on role
    const [inputA, setInputA] = useState('');
    const [inputB, setInputB] = useState('');
    const [inputCGold, setInputCGold] = useState('');
    const [inputCY3, setInputCY3] = useState('');
    const [inputDWhy, setInputDWhy] = useState('');

    // Server state
    const [groupProduct, setGroupProduct] = useState<any>(null);
    const [contributions, setContributions] = useState<any[]>([]);

    // Realtime Subscriptions
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch roles
                const { data: rData } = await supabase.from('role_assignments').select('*').eq('house', house);
                if (rData) {
                    setRoleAssignments(rData);
                    const myRole = rData.find((r: any) => r.student_id === studentId);
                    if (myRole) setRole((myRole as any).role);
                }

                // Fetch product (might not exist yet, don't use .single() directly without error handling)
                const { data: pData } = await supabase.from('group_product').select('*').eq('house', house).limit(1);
                if (pData && pData.length > 0) {
                    setGroupProduct(pData[0]);
                }

                // Fetch contributions
                const { data: cData } = await supabase.from('contributions').select('*').eq('house', house);
                if (cData) setContributions(cData);
            } catch (err) {
                console.error("Error fetching group data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const channel = supabase
            .channel(`group_${house}_changes`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'role_assignments', filter: `house=eq.${house}` }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_product', filter: `house=eq.${house}` }, fetchData)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions', filter: `house=eq.${house}` }, fetchData)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [house, studentId]);

    // Restore drafts
    useEffect(() => {
        if (role) {
            setInputA(localStorage.getItem(`lim_draft_${house}_A`) || '');
            setInputB(localStorage.getItem(`lim_draft_${house}_B`) || '');
            setInputCGold(localStorage.getItem(`lim_draft_${house}_CGold`) || '');
            setInputCY3(localStorage.getItem(`lim_draft_${house}_CY3`) || '');
            setInputDWhy(localStorage.getItem(`lim_draft_${house}_DWhy`) || '');
        }
    }, [role, house]);

    // Save drafts
    useEffect(() => { if (role === 'A') localStorage.setItem(`lim_draft_${house}_A`, inputA); }, [inputA, role, house]);
    useEffect(() => { if (role === 'B') localStorage.setItem(`lim_draft_${house}_B`, inputB); }, [inputB, role, house]);
    useEffect(() => { if (role === 'C') { localStorage.setItem(`lim_draft_${house}_CGold`, inputCGold); localStorage.setItem(`lim_draft_${house}_CY3`, inputCY3); } }, [inputCGold, inputCY3, role, house]);
    useEffect(() => { if (role === 'D') localStorage.setItem(`lim_draft_${house}_DWhy`, inputDWhy); }, [inputDWhy, role, house]);

    const handleSelectRole = async (selectedRole: 'A' | 'B' | 'C' | 'D') => {
        setLoading(true);
        const { error } = await supabase.from('role_assignments').insert([{ house, role: selectedRole, student_id: studentId }] as any);
        if (!error) setRole(selectedRole);
        setLoading(false);
    };

    const submitContribution = async (content: string) => {
        if (!content.trim()) return;
        setLoading(true);
        await supabase.from('contributions').insert([{ house, role, student_id: studentId, content }] as any);

        // Also update group_product placeholders just to make tracking easy for TV
        if (role === 'A') await updateProduct({ y1: (groupProduct?.y1 ? groupProduct.y1 + " | " + content : content) });
        if (role === 'B') await updateProduct({ y2: (groupProduct?.y2 ? groupProduct.y2 + " | " + content : content) });

        setLoading(false);
        alert('Đã gửi ý kiến thành công!');
        localStorage.removeItem(`lim_draft_${house}_${role}`);
    };

    const updateProduct = async (updates: any) => {
        setLoading(true);
        if (!groupProduct) {
            await (supabase as any).from('group_product').insert([{ house, status: 'draft', ...updates }]);
        } else {
            await (supabase as any).from('group_product').update(updates).eq('house', house);
        }
        setLoading(false);
    };

    const submitC = async () => {
        if (!inputCGold.trim() || !inputCY3.trim()) return;
        await updateProduct({ gold1: inputCGold, y3: inputCY3 });
        alert('Đã gửi phần việc của C thành công!');
        localStorage.removeItem(`lim_draft_${house}_CGold`);
        localStorage.removeItem(`lim_draft_${house}_CY3`);
    };

    const submitD = async () => {
        if (!inputDWhy.trim()) return;
        await updateProduct({ why: inputDWhy, status: 'submitted' });
        alert('Đã chốt nhóm và nộp bài thành công!');
        localStorage.removeItem(`lim_draft_${house}_DWhy`);
    };

    if (loading) return <div>Đang tải dữ liệu nhóm...</div>;

    const roleCountA = roleAssignments.filter(r => r.role === 'A').length;
    const roleCountB = roleAssignments.filter(r => r.role === 'B').length;
    const roleCountC = roleAssignments.filter(r => r.role === 'C').length;
    const roleCountD = roleAssignments.filter(r => r.role === 'D').length;

    if (!role) {
        return (
            <div className="flex-column gap-md">
                <h3 className="text-center" style={{ marginBottom: '16px' }}>Chọn Vai Trò Nhóm (Quota có hạn)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button variant="secondary" disabled={roleCountA >= 2} onClick={() => handleSelectRole('A')}>Vai A ({roleCountA}/2) - Cách của Bạn</Button>
                    <Button variant="secondary" disabled={roleCountB >= 2} onClick={() => handleSelectRole('B')}>Vai B ({roleCountB}/2) - Cách của Tôi</Button>
                    <Button variant="secondary" disabled={roleCountC >= 2} onClick={() => handleSelectRole('C')}>Vai C ({roleCountC}/2) - Tìm Ý 3</Button>
                    <Button variant="secondary" style={{ border: '2px solid var(--warning)' }} disabled={roleCountD >= 1} onClick={() => handleSelectRole('D')}>Vai D ({roleCountD}/1) - Trọng tài Chốt</Button>
                </div>
            </div>
        );
    }

    const completedA = contributions.filter(c => c.role === 'A');
    const completedB = contributions.filter(c => c.role === 'B');

    return (
        <div className="flex-column gap-md text-left">
            <div className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '8px' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Đang giữ Vai {role}</h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tiến độ nhóm: {groupProduct?.status === 'submitted' ? '✅ Đã Nộp' : '⏳ Đang làm'}</span>
            </div>

            {/* VAI A */}
            {role === 'A' && (
                <div className="flex-column gap-sm" style={{ marginTop: '16px' }}>
                    <p><strong>Nhiệm vụ:</strong> Nhập 1 ý kiến bảo vệ phương án của bạn.</p>
                    <textarea value={inputA} onChange={(e) => setInputA(e.target.value)} className="input-field" style={{ minHeight: '80px' }} placeholder="VD: Khuyến khích sự tự chủ..." />
                    <Button onClick={() => submitContribution(inputA)} disabled={!inputA.trim() || loading}>Gửi Ý 1</Button>
                    {completedA.length > 0 && <p className="text-success mt-2">✅ Bạn đã gửi: {completedA[completedA.length - 1].content}</p>}
                </div>
            )}

            {/* VAI B */}
            {role === 'B' && (
                <div className="flex-column gap-sm" style={{ marginTop: '16px' }}>
                    <p><strong>Nhiệm vụ:</strong> Nhập 1 ý kiến bảo vệ phương án của bạn.</p>
                    <textarea value={inputB} onChange={(e) => setInputB(e.target.value)} className="input-field" style={{ minHeight: '80px' }} placeholder="VD: Giữ lớp học tập trung..." />
                    <Button onClick={() => submitContribution(inputB)} disabled={!inputB.trim() || loading}>Gửi Ý 2</Button>
                    {completedB.length > 0 && <p className="text-success mt-2">✅ Bạn đã gửi: {completedB[completedB.length - 1].content}</p>}
                </div>
            )}

            {/* VAI C */}
            {role === 'C' && (
                <div className="flex-column gap-md" style={{ marginTop: '16px' }}>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <h4 style={{ margin: '0 0 12px 0', color: 'var(--warning)' }}>Nguyên liệu từ A & B:</h4>
                        <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Từ A: {groupProduct?.y1 || '⏳ Chờ...'}</p>
                        <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Từ B: {groupProduct?.y2 || '⏳ Chờ...'}</p>
                    </div>

                    <label style={{ fontWeight: 'bold' }}>1. Chốt "Điều tốt cần giữ lại":</label>
                    <textarea value={inputCGold} onChange={(e) => setInputCGold(e.target.value)} className="input-field" style={{ minHeight: '60px' }} placeholder="Nhập điểm tốt từ A và B..." />

                    <label style={{ fontWeight: 'bold', marginTop: '12px' }}>2. Điền Ý tưởng thứ 3 (1+1=3):</label>
                    <textarea value={inputCY3} onChange={(e) => setInputCY3(e.target.value)} className="input-field" style={{ minHeight: '100px' }} placeholder="3 quy định + 1 xử lý..." />

                    <Button onClick={submitC} disabled={!inputCGold.trim() || !inputCY3.trim() || loading}>Lưu Bản Nháp (C)</Button>
                    {groupProduct?.y3 && <p className="text-success mt-2">✅ Đã lưu Ý 3.</p>}
                </div>
            )}

            {/* VAI D */}
            {role === 'D' && (
                <div className="flex-column gap-md" style={{ marginTop: '16px', border: '1px solid var(--success)', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--success)', margin: '0 0 16px 0' }}>Bảng Trọng Tài Chốt</h4>
                    <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        <div><strong>A đã nộp:</strong> {groupProduct?.y1 ? '✅' : '⏳'} {groupProduct?.y1}</div>
                        <div><strong>B đã nộp:</strong> {groupProduct?.y2 ? '✅' : '⏳'} {groupProduct?.y2}</div>
                        <div><strong>C đã chốt Giữ lại:</strong> {groupProduct?.gold1 ? '✅' : '⏳'} {groupProduct?.gold1}</div>
                        <div><strong>C đã chốt Ý 3:</strong> {groupProduct?.y3 ? '✅' : '⏳'} {groupProduct?.y3}</div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--warning)' }}>Kiểm tra checklist: 1. Đủ ý kiến các bên chưa? 2. Ý 3 có bảo vệ lợi ích chung không?</p>

                    <label style={{ fontWeight: 'bold' }}>Nhập Tóm tắt: Vì sao 1+1=3 (D):</label>
                    <textarea value={inputDWhy} onChange={(e) => setInputDWhy(e.target.value)} className="input-field" style={{ minHeight: '80px' }} placeholder="Lý do Ý 3 tốt hơn..." />

                    <Button style={{ background: 'var(--success)', marginTop: '12px' }} onClick={submitD} disabled={!inputDWhy.trim() || loading || groupProduct?.status === 'submitted'}>
                        {groupProduct?.status === 'submitted' ? 'ĐÃ NỘP BÀI' : 'CHỐT NHÓM & NỘP CHO GV'}
                    </Button>
                </div>
            )}
        </div>
    );
}
