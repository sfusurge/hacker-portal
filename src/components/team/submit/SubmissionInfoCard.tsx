import { Card, CardContent } from '@/components/ui/card';

type SubmissionInfoCardProps = {
    date: string;
    time: string;
};

export default function SubmissionInfoCard({
    date,
    time,
}: SubmissionInfoCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="border-b p-6">
                <h3 className="text-lg font-medium">
                    Due date: {date} at {time}
                </h3>
            </CardContent>

            <CardContent className="border-b p-6">
                <h3 className="mb-1 text-lg font-medium">
                    One Submission Per Team
                </h3>
                <p className="text-muted-foreground text-sm">
                    This submission counts for all team members.
                </p>
            </CardContent>

            <CardContent className="p-6">
                <h3 className="mb-1 text-lg font-medium">
                    Submission is Final
                </h3>
                <p className="text-muted-foreground text-sm">
                    You can't edit this form once it's submitted.
                </p>
            </CardContent>
        </Card>
    );
}
