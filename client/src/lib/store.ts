import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Site, User, SiteStatus } from './types';
import { Question } from './types';
import { QUESTIONS, calculateScore } from './questions';

interface AppState {
  user: User | null;
  sites: Site[];
  questions: Question[];
  login: (user: User) => void;
  logout: () => void;
  registerSite: (site: Omit<Site, "id" | "status" | "registeredAt" | "answers">) => void;
  generateToken: (siteId: string) => string;
  submitEvaluation: (siteId: string, answers: Record<string, any>) => void;
  updateSiteStatus: (siteId: string, status: SiteStatus) => void;
  
  // Question Management
  addQuestion: (question: Omit<Question, "id">) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  toggleQuestion: (id: string, enabled: boolean) => void;
}

// Initial Mock Data
const MOCK_SITES: Site[] = [
  {
    id: "1",
    contactName: "Dr. Sarah Chen",
    email: "sarah.chen@univ-hospital.com",
    description: "University hospital with specialized oncology unit.",
    location: "Boston, MA",
    country: "USA",
    status: "Approved",
    registeredAt: "2023-10-15T10:00:00Z",
    token: "TOKEN-123",
    score: 95,
    answers: {},
    evaluatedAt: "2023-10-20T14:30:00Z",
    evaluatedBy: "Admin User"
  },
  {
    id: "2",
    contactName: "James Wilson",
    email: "j.wilson@research-center.uk",
    description: "Dedicated phase 1 unit.",
    location: "London, UK",
    country: "UK",
    status: "ToConsider",
    registeredAt: "2023-11-02T09:15:00Z",
    token: "TOKEN-456",
    score: 45,
    answers: {},
    evaluatedAt: "2023-11-05T11:20:00Z",
    evaluatedBy: "Admin User"
  },
  {
    id: "3",
    contactName: "Elena Rodriguez",
    email: "elena@madrid-clinical.es",
    description: "Large patient database, primary care focus.",
    location: "Madrid, ES",
    country: "Spain",
    status: "Pending",
    registeredAt: "2023-12-01T16:45:00Z",
    answers: {}
  },
  {
    id: "4",
    contactName: "Hans Müller",
    email: "hans.mueller@berlin-charite.de",
    description: "Specialized in cardiology trials.",
    location: "Berlin, DE",
    country: "Germany",
    status: "Approved",
    registeredAt: "2024-01-10T09:30:00Z",
    token: "TOKEN-789",
    score: 88,
    answers: {},
    evaluatedAt: "2024-01-15T14:00:00Z",
    evaluatedBy: "Admin User"
  },
  {
    id: "5",
    contactName: "Marie Dubois",
    email: "marie.dubois@paris-sante.fr",
    description: "Leading immunology center.",
    location: "Paris, FR",
    country: "France",
    status: "Approved",
    registeredAt: "2024-01-20T11:45:00Z",
    token: "TOKEN-101",
    score: 92,
    answers: {},
    evaluatedAt: "2024-01-25T10:30:00Z",
    evaluatedBy: "Admin User"
  },
  {
    id: "6",
    contactName: "Dr. John Smith",
    email: "john.smith@ny-presbyterian.org",
    description: "Large urban hospital center.",
    location: "New York, NY",
    country: "USA",
    status: "Pending",
    registeredAt: "2024-02-05T13:20:00Z",
    answers: {}
  },
  {
    id: "7",
    contactName: "Dr. Emily Davis",
    email: "emily.davis@chicago-med.org",
    description: "Academic medical center.",
    location: "Chicago, IL",
    country: "USA",
    status: "Approved",
    registeredAt: "2024-02-10T15:10:00Z",
    token: "TOKEN-202",
    score: 85,
    answers: {},
    evaluatedAt: "2024-02-15T09:45:00Z",
    evaluatedBy: "Admin User"
  },
  {
    id: "8",
    contactName: "Dr. Carlos Gomez",
    email: "carlos.gomez@barcelona-clinic.es",
    description: "Specialized in neurology.",
    location: "Barcelona, ES",
    country: "Spain",
    status: "ToConsider",
    registeredAt: "2024-02-18T10:00:00Z",
    token: "TOKEN-303",
    score: 60,
    answers: {},
    evaluatedAt: "2024-02-22T16:20:00Z",
    evaluatedBy: "Admin User"
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      sites: MOCK_SITES,
      questions: QUESTIONS.map(q => ({ ...q, enabled: q.enabled !== undefined ? q.enabled : true })),

      login: (user) => set({ user }),
      logout: () => set({ user: null }),

      registerSite: (data) => set((state) => ({
        sites: [
          {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            status: "Pending",
            registeredAt: new Date().toISOString(),
            answers: {}
          },
          ...state.sites
        ]
      })),

      generateToken: (siteId) => set((state) => ({
        sites: state.sites.map(s => {
          if (s.id === siteId) {
            return { ...s, status: "TokenSent", token: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}` };
          }
          return s;
        })
      })),

      submitEvaluation: (siteId, answers) => set((state) => {
        const result = calculateScore(answers, state.questions);
        
        let status: SiteStatus = "ToConsider"; // Default fallback
        
        if (result.status === "Approved") status = "Approved";
        else if (result.status === "Conditional") status = "ToConsider"; // Mapping Conditional -> ToConsider for backward compatibility
        else status = "Rejected";
        
        return {
          sites: state.sites.map(s => {
            if (s.id === siteId) {
              return { 
                ...s, 
                answers: answers as any, 
                score: result.score, 
                status, 
                evaluatedAt: new Date().toISOString() 
              };
            }
            return s;
          })
        };
      }),

      updateSiteStatus: (siteId, status) => set((state) => ({
        sites: state.sites.map(s => {
          if (s.id === siteId) return { ...s, status };
          return s;
        })
      })),

      addQuestion: (question) => set((state) => ({
        questions: [
          ...state.questions,
          { ...question, id: Math.random().toString(36).substr(2, 9), enabled: true }
        ]
      })),

      updateQuestion: (id, updates) => set((state) => ({
        questions: state.questions.map(q => q.id === id ? { ...q, ...updates } : q)
      })),

      deleteQuestion: (id) => set((state) => ({
        questions: state.questions.filter(q => q.id !== id)
      })),

      toggleQuestion: (id, enabled) => set((state) => ({
        questions: state.questions.map(q => q.id === id ? { ...q, enabled } : q)
      })),
    }),
    {
      name: 'innova-trials-storage',
    }
  )
);
