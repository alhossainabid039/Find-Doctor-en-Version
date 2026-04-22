export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  image: string;
  memberStatus: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  hospital: string;
  location: string;
  fee: number;
  rating: number;
  image: string;
  slots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  slot: string;
  patientName: string;
  patientEmail: string;
  status: string;
  createdAt: string;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}
