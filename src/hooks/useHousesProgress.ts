'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useHousesProgress() {
    const [progress, setProgress] = useState<any>({
        N: { roles: 0, a: 0, b: 0, gold: false, y3: false, d: false, status: 'draft' },
        E: { roles: 0, a: 0, b: 0, gold: false, y3: false, d: false, status: 'draft' },
        W: { roles: 0, a: 0, b: 0, gold: false, y3: false, d: false, status: 'draft' },
        S: { roles: 0, a: 0, b: 0, gold: false, y3: false, d: false, status: 'draft' }
    });

    useEffect(() => {
        const fetchAll = async () => {
            const { data: roles } = await (supabase as any).from('role_assignments').select('*');
            const { data: contribs } = await (supabase as any).from('contributions').select('*');
            const { data: products } = await (supabase as any).from('group_product').select('*');

            const newProgress = { ...progress };

            ['N', 'E', 'W', 'S'].forEach(house => {
                const houseRoles = roles?.filter((r: any) => r.house === house) || [];
                const houseContribs = contribs?.filter((c: any) => c.house === house) || [];
                const houseProduct = products?.find((p: any) => p.house === house);

                newProgress[house] = {
                    roles: houseRoles.length,
                    a: houseContribs.filter((c: any) => c.role === 'A').length,
                    b: houseContribs.filter((c: any) => c.role === 'B').length,
                    gold: !!houseProduct?.gold1,
                    y3: !!houseProduct?.y3,
                    d: !!houseProduct?.why,
                    status: houseProduct?.status || 'draft',
                    product: houseProduct
                };
            });

            setProgress(newProgress);
        };

        fetchAll();

        const channel = supabase.channel('tv_progress')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'role_assignments' }, fetchAll)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, fetchAll)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'group_product' }, fetchAll)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return { progress };
}
