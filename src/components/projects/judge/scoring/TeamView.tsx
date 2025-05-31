'use client';

import { Card } from '@/components/ui/card';
import { FormTextInput } from '@/components/ui/input/input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CheckCircle, AlertCircle, Loader2, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TeamViewProps {
    filteredTeams: any[];
    filteredJudges: any[];
    assignments: any[];
    judges: any[];
    teamSearchQuery: string;
    judgeSearchQuery: string;
    setTeamSearchQuery: (query: string) => void;
    setJudgeSearchQuery: (query: string) => void;
    handleAssignProject: (teamId: number, judgeId: number) => void;
    handleRemoveAssignment: (teamId: number, judgeId: number) => void;
    assigning: string | null;
    isProjectAssigned: (teamId: number, judgeId: number) => boolean;
    hackathon: any;
}

export default function TeamView({
    filteredTeams,
    filteredJudges,
    assignments,
    judges,
    teamSearchQuery,
    judgeSearchQuery,
    setTeamSearchQuery,
    setJudgeSearchQuery,
    handleAssignProject,
    handleRemoveAssignment,
    assigning,
    isProjectAssigned,
    hackathon,
}: TeamViewProps) {
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
    const [selectedScore, setSelectedScore] = useState(null);
    const [selectedTeamName, setSelectedTeamName] = useState<string>('');
    const [selectedJudgeName, setSelectedJudgeName] = useState<string>('');

    const handleViewScore = (assignment: any) => {
        if (!assignment.response) return;

        const team = filteredTeams.find(
            (t) => t.id === assignment.teamId || t.teamId === assignment.teamId
        );
        const judge = judges.find((j) => j.id === assignment.userId);

        setSelectedScore(assignment.response);
        setSelectedTeamName(
            team ? team.teamName : `Team #${assignment.teamId}`
        );
        setSelectedJudgeName(
            judge
                ? `${judge.firstName} ${judge.lastName}`
                : `Judge #${assignment.userId}`
        );
        setScoreDialogOpen(true);
    };

    const renderScoreValue = (value: string) => {
        if (['1', '2', '3', '4', '5'].includes(value)) {
            return (
                <div className="flex">
                    {Array.from({ length: parseInt(value) }).map((_, i) => (
                        <span key={i} className="text-brand-500">
                            ★
                        </span>
                    ))}
                    {Array.from({ length: 5 - parseInt(value) }).map((_, i) => (
                        <span
                            key={i + parseInt(value)}
                            className="text-white/60"
                        >
                            ★
                        </span>
                    ))}
                    ({value})
                </div>
            );
        }

        return value;
    };
    return (
        <div>
            <div className="mb-4">
                <FormTextInput
                    name="global-team-search"
                    id="global-team-search"
                    type="search"
                    placeholder="Search teams..."
                    icon={
                        <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                    }
                    defaultValue={teamSearchQuery}
                    lazy
                    onLazyChange={(text) => {
                        setTeamSearchQuery(text);
                    }}
                />
            </div>
            <div className="space-y-6">
                {filteredTeams.length === 0 ? (
                    <div className="py-8 text-center">No teams found</div>
                ) : (
                    filteredTeams.map((team) => (
                        <Card
                            key={team.id || team.teamId}
                            className="bg-neutral-850 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">
                                    {`"${team.submission[1]}" by `}{' '}
                                    {team.teamName} ({team.id || team.teamId})
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Select
                                        onValueChange={(value) =>
                                            handleAssignProject(
                                                parseInt(value),
                                                team.id || team.teamId
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-40 md:w-[220px]">
                                            <SelectValue placeholder="Assign a judge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="px-2 py-2">
                                                <FormTextInput
                                                    name="judge-search"
                                                    id="judge-search"
                                                    type="search"
                                                    placeholder="Search judges..."
                                                    icon={
                                                        <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                                                    }
                                                    defaultValue={
                                                        judgeSearchQuery
                                                    }
                                                    lazy
                                                    onLazyChange={(text) => {
                                                        setJudgeSearchQuery(
                                                            text
                                                        );
                                                    }}
                                                />
                                            </div>
                                            {filteredJudges.map((judge) => (
                                                <SelectItem
                                                    key={judge.id}
                                                    value={judge.id.toString()}
                                                    disabled={isProjectAssigned(
                                                        judge.id,
                                                        team.id || team.teamId
                                                    )}
                                                >
                                                    {judge.firstName}{' '}
                                                    {judge.lastName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Judge</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead className="w-[150px]">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments
                                        .filter((a) => {
                                            const teamIdentifier =
                                                team.id || team.teamId;
                                            return (
                                                a.teamId === teamIdentifier ||
                                                a.projectId === teamIdentifier
                                            );
                                        })
                                        .map((assignment, index) => {
                                            const judgeId = assignment.userId;
                                            const judge = judges.find(
                                                (j) => j.id === judgeId
                                            );

                                            const uniqueKey = assignment.id
                                                ? `${team.id || team.teamId}-${judgeId}-${assignment.id}`
                                                : `${team.id || team.teamId}-${judgeId}-unassigned-${index}`;
                                            const isRemoving =
                                                assigning ===
                                                `${team.id || team.teamId}-${judgeId}`;

                                            return (
                                                <TableRow key={uniqueKey}>
                                                    <TableCell>
                                                        {judge
                                                            ? `${judge.firstName} ${judge.lastName}`
                                                            : `Judge #${judgeId}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignment.status ===
                                                        'judged' ? (
                                                            <span className="flex items-center">
                                                                <CheckCircle className="text-success-500 mr-2 h-4 w-4" />
                                                                Judged
                                                                {assignment.response && (
                                                                    <span className="bg-success-900 text-success-100 ml-2 rounded-full px-2 py-0.5 text-xs">
                                                                        Scored
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center">
                                                                <AlertCircle className="text-caution-500 mr-2 h-4 w-4" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            assignment.updatedDate
                                                        ).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {isRemoving ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="default"
                                                                        size="cozy"
                                                                        hierarchy="primary"
                                                                        onClick={() =>
                                                                            handleRemoveAssignment(
                                                                                judge.id,
                                                                                team.id
                                                                            )
                                                                        }
                                                                    >
                                                                        <Trash2 className="text-danger-500 h-4 w-4" />
                                                                    </Button>

                                                                    {assignment.response && (
                                                                        <Button
                                                                            variant="default"
                                                                            size="cozy"
                                                                            hierarchy="secondary"
                                                                            onClick={() =>
                                                                                handleViewScore(
                                                                                    assignment
                                                                                )
                                                                            }
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {assignments.filter((a) => {
                                        const teamIdentifier =
                                            team.id || team.teamId;
                                        return (
                                            a.teamId === teamIdentifier ||
                                            a.projectId === teamIdentifier
                                        );
                                    }).length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-4 text-center"
                                            >
                                                No judges assigned
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    ))
                )}
            </div>
            <Dialog open={scoreDialogOpen} onOpenChange={setScoreDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Score Details: {selectedTeamName} -{' '}
                            {selectedJudgeName}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedScore && (
                        <div className="max-h-[70vh] space-y-4 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Score/Response</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(selectedScore).map(
                                        ([key, value]) => (
                                            <TableRow key={key}>
                                                <TableCell className="font-medium">
                                                    Question {key}
                                                </TableCell>
                                                <TableCell>
                                                    {renderScoreValue(
                                                        value as string
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
