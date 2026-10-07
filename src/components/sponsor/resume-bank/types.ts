export interface User {
    id: number;
    firstName: string;
    lastName: string;
    school: string;
    /** Sponsor-facing school bucket (Secondary / named school / Other). */
    schoolLabel: string;
    education: string;
    github: string;
    linkedin: string;
    resumeUrl: string;
    email: string;
    currentStatus: string;
}
