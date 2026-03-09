'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type ClassState = Database['public']['Tables']['class_state']['Row'];

export function useClassState() {
    const [classState, setClassState] = useState<ClassState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial state
        const fetchState = async () => {
            const { data, error } = await supabase
                .from('class_state')
                .select('*')
                .eq('id', 1)
                .single();

            if (data) setClassState(data);
            if (error) console.error('Error fetching class state:', error);
            setLoading(false);
        };

        fetchState();

        // Subscribe to realtime changes
        const channel = supabase
            .channel('class_state_changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'class_state', filter: 'id=eq.1' },
                (payload) => {
                    console.log('Class state updated:', payload.new);
                    setClassState(payload.new as ClassState);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { classState, loading };
}
