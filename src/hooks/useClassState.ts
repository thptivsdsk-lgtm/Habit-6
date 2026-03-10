'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type ClassState = Database['public']['Tables']['class_state']['Row'];

export function useClassState(sessionCode: string | null) {
    const [classState, setClassState] = useState<ClassState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial state
        const fetchState = async () => {
            if (!sessionCode) {
                setLoading(false);
                return;
            }
            const { data, error } = await supabase
                .from('class_state')
                .select('*')
                .eq('session_code', sessionCode)
                .single();

            if (data) setClassState(data);
            if (error) console.error('Error fetching class state:', error);
            setLoading(false);
        };

        fetchState();

        if (!sessionCode) return;

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`class_state_changes_${sessionCode}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'class_state', filter: `session_code=eq.${sessionCode}` },
                (payload) => {
                    console.log('Class state updated:', payload.new);
                    setClassState(payload.new as ClassState);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionCode]);

    return { classState, loading };
}
