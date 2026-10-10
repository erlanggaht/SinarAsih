export type TeamMember = {
  name: string;
  photo: string;
  whatsapp: string | null;
  instagram: string | null;
};

// WhatsApp uses country-code digits (e.g. 628...), Instagram uses a full profile URL.
export const teamMembers: TeamMember[] = [
  {
    name: "Yusuf Saeful Rizkie",
    photo: "/team/yusuf.jpg",
    whatsapp: null,
    instagram: null,
  },
  {
    name: "Dede Kusnandar",
    photo: "/team/dede.jpeg",
    whatsapp: null,
    instagram: null,
  },
];
