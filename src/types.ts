// src/types.ts

export interface TranscriptSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  language: string;
  created_at: string;
  speaker: string | null;
  absolute_start_time: string;
  absolute_end_time: string;
}