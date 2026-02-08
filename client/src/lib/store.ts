import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Site, User, SiteStatus } from './types';
import { QUESTIONS, calculateScore } from './questions';

interface AppState {
  user: User | null;
  sites: Site[];
  login: (user: User) => void;
  logout: () => void;
  registerSite: (site: Omit<Site, "id" | "status" | "registeredAt" | "answers">) => void;
  generateToken: (siteId: string) => string;
  submitEvaluation: (siteId: string, answers: Record<string, any>) => void;
  updateSiteStatus: (siteId: string, status: SiteStatus) => void;
}

// Initial Mock Data
const MOCK_SITES: Site[] = [
  {
    id: "1",
    contactName: "Dr. Sarah Chen",
    email: "sarah.chen@univ-hospital.com",
    description: "University hospital with specialized oncology unit.",
    location: "Boston, MA",
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
    status: "Pending",
    registeredAt: "2023-12-01T16:45:00Z",
    answers: {}
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      sites: MOCK_SITES,

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
        const { score, isKnockOut } = calculateScore(answers);
        let status: SiteStatus = "ToConsider";
        
        if (isKnockOut) status = "Rejected";
        else if (score >= 50) status = "Approved";
        
        return {
          sites: state.sites.map(s => {
            if (s.id === siteId) {
              return { 
                ...s, 
                answers: answers as any, 
                score, 
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
    }),
    {
      name: 'innova-trials-storage',
    }
  )
);
