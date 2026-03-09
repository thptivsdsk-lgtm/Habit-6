export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            class_state: {
                Row: {
                    id: number
                    phase: number
                    timer_ends_at: string | null
                    current_house: string | null
                    lock_submissions: boolean
                    topic_prompt: string | null
                }
                Insert: {
                    id?: number
                    phase?: number
                    timer_ends_at?: string | null
                    current_house?: string | null
                    lock_submissions?: boolean
                    topic_prompt?: string | null
                }
                Update: {
                    id?: number
                    phase?: number
                    timer_ends_at?: string | null
                    current_house?: string | null
                    lock_submissions?: boolean
                    topic_prompt?: string | null
                }
            }
            student_session: {
                Row: {
                    id: string
                    name: string | null
                    house: 'N' | 'E' | 'W' | 'S'
                    last_seen: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name?: string | null
                    house: 'N' | 'E' | 'W' | 'S'
                    last_seen?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string | null
                    house?: 'N' | 'E' | 'W' | 'S'
                    last_seen?: string | null
                    created_at?: string
                }
            }
            role_assignments: {
                Row: {
                    id: number
                    house: 'N' | 'E' | 'W' | 'S'
                    role: 'A' | 'B' | 'C' | 'D'
                    student_id: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    house: 'N' | 'E' | 'W' | 'S'
                    role: 'A' | 'B' | 'C' | 'D'
                    student_id: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    house?: 'N' | 'E' | 'W' | 'S'
                    role?: 'A' | 'B' | 'C' | 'D'
                    student_id?: string
                    created_at?: string
                }
            }
            contributions: {
                Row: {
                    id: number
                    house: 'N' | 'E' | 'W' | 'S'
                    role: 'A' | 'B' | 'C' | 'D'
                    student_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    house: 'N' | 'E' | 'W' | 'S'
                    role: 'A' | 'B' | 'C' | 'D'
                    student_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    house?: 'N' | 'E' | 'W' | 'S'
                    role?: 'A' | 'B' | 'C' | 'D'
                    student_id?: string
                    content?: string
                    created_at?: string
                }
            }
            group_product: {
                Row: {
                    house: 'N' | 'E' | 'W' | 'S'
                    y1: string | null
                    y2: string | null
                    gold1: string | null
                    gold2: string | null
                    y3: string | null
                    why: string | null
                    status: 'draft' | 'locked' | 'submitted'
                    submitted_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    house: 'N' | 'E' | 'W' | 'S'
                    y1?: string | null
                    y2?: string | null
                    gold1?: string | null
                    gold2?: string | null
                    y3?: string | null
                    why?: string | null
                    status?: 'draft' | 'locked' | 'submitted'
                    submitted_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    house?: 'N' | 'E' | 'W' | 'S'
                    y1?: string | null
                    y2?: string | null
                    gold1?: string | null
                    gold2?: string | null
                    y3?: string | null
                    why?: string | null
                    status?: 'draft' | 'locked' | 'submitted'
                    submitted_at?: string | null
                    updated_at?: string | null
                }
            }
        }
    }
}
