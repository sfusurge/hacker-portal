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
import { useState, useMemo } from 'react';

interface JudgeViewProps {
    filteredJudges: any[];
    assignments: any[];
    teams: any[];
    judgeSearchQuery: string;
    teamSearchQuery: string;
    setJudgeSearchQuery: (query: string) => void;
    setTeamSearchQuery: (query: string) => void;
    handleAssignProject: (judgeId: number, teamId: number) => void;
    handleRemoveAssignment: (judgeId: number, teamId: number) => void;
    assigning: string | null;
    isProjectAssigned: (judgeId: number, teamId: number) => boolean;
    filteredTeams: any[];
    hackathon: any;
}

export default function JudgeView({
    filteredJudges,
    assignments,
    teams,
    judgeSearchQuery,
    teamSearchQuery,
    setJudgeSearchQuery,
    setTeamSearchQuery,
    handleAssignProject,
    handleRemoveAssignment,
    assigning,
    isProjectAssigned,
    hackathon: any,
    filteredTeams,
}: JudgeViewProps) {
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);

    const allQuestions = useMemo(() => {
        const questionSet = new Set<string>();
        assignments.forEach((assignment) => {
            if (assignment.response) {
                Object.keys(assignment.response).forEach((key) =>
                    questionSet.add(key)
                );
            } else if (assignment.team && assignment.team.response) {
                Object.keys(assignment.team.response).forEach((key) =>
                    questionSet.add(key)
                );
            }
        });
        return Array.from(questionSet).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return a.localeCompare(b);
        });
    }, [assignments]);

    const renderScoreValue = (value: string) => {
        if (!value) return '-';

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
                </div>
            );
        }
        return value.length > 50 ? `${value.substring(0, 50)}...` : value;
    };

    return (
        <div>
            <div className="mb-4">
                <FormTextInput
                    name="global-judge-search"
                    id="global-judge-search"
                    type="search"
                    placeholder="Search judges..."
                    icon={
                        <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                    }
                    defaultValue={judgeSearchQuery}
                    lazy
                    onLazyChange={(text) => {
                        setJudgeSearchQuery(text);
                    }}
                />
            </div>
            <div className="space-y-6">
                {filteredJudges.length === 0 ? (
                    <div className="py-8 text-center">No judges found</div>
                ) : (
                    filteredJudges.map((judge) => (
                        <Card key={judge.id} className="bg-neutral-850 p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">
                                    {judge.firstName} {judge.lastName}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <Select
                                        onValueChange={(value) =>
                                            handleAssignProject(
                                                judge.id,
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-40 md:w-[220px]">
                                            <SelectValue placeholder="Assign a team" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="px-2 py-2">
                                                <FormTextInput
                                                    name="team-search"
                                                    id="team-search"
                                                    type="search"
                                                    placeholder="Search teams..."
                                                    icon={
                                                        <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                                                    }
                                                    defaultValue={
                                                        teamSearchQuery
                                                    }
                                                    lazy
                                                    onLazyChange={(text) => {
                                                        setTeamSearchQuery(
                                                            text
                                                        );
                                                    }}
                                                />
                                            </div>
                                            {filteredTeams.map((team) => (
                                                <SelectItem
                                                    key={team.id || team.teamId}
                                                    value={(
                                                        team.id || team.teamId
                                                    ).toString()}
                                                    disabled={isProjectAssigned(
                                                        judge.id,
                                                        team.id || team.teamId
                                                    )}
                                                >
                                                    {team.teamName} (
                                                    {team.id || team.teamId})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[150px]">
                                            Team
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            Status
                                        </TableHead>
                                        <TableHead className="min-w-[120px]">
                                            Last Updated
                                        </TableHead>
                                        {allQuestions.map((questionKey) => (
                                            <TableHead
                                                key={questionKey}
                                                className="min-w-[120px]"
                                            >
                                                Question {questionKey}
                                            </TableHead>
                                        ))}
                                        <TableHead className="w-[150px]">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignments
                                        .filter((a) => a.userId === judge.id)
                                        .map((assignment) => {
                                            const teamId =
                                                assignment.teamId ||
                                                assignment.projectId;
                                            const team = teams.find(
                                                (t) =>
                                                    t.id === teamId ||
                                                    t.teamId === teamId
                                            );

                                            const uniqueKey = `${judge.id}-${teamId}-${assignment.id || Date.now()}`;
                                            const isRemoving =
                                                assigning ===
                                                `${judge.id}-${teamId}`;

                                            // Determine the response object to use (either from assignment or nested team object)
                                            const response =
                                                assignment.response ||
                                                team?.response ||
                                                {};

                                            return (
                                                <TableRow key={uniqueKey}>
                                                    <TableCell className="font-medium">
                                                        {team
                                                            ? `"${team.submission[1]}" - ${team.teamName} (${team.id || team.teamId})`
                                                            : `Team #${teamId}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        {assignment.status ===
                                                        'judged' ? (
                                                            <span className="flex items-center">
                                                                <CheckCircle className="text-success-500 mr-2 h-4 w-4" />
                                                                Judged
                                                                {response &&
                                                                    Object.keys(
                                                                        response
                                                                    ).length >
                                                                        0 && (
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
                                                    {allQuestions.map(
                                                        (questionKey) => (
                                                            <TableCell
                                                                key={
                                                                    questionKey
                                                                }
                                                            >
                                                                {renderScoreValue(
                                                                    response?.[
                                                                        questionKey
                                                                    ] || ''
                                                                )}
                                                            </TableCell>
                                                        )
                                                    )}
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {isRemoving ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Button
                                                                    variant="default"
                                                                    size="cozy"
                                                                    hierarchy="primary"
                                                                    onClick={() =>
                                                                        handleRemoveAssignment(
                                                                            judge.id,
                                                                            teamId
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 className="text-danger-500 h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    {assignments.filter(
                                        (a) => a.userId === judge.id
                                    ).length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-4 text-center"
                                            >
                                                No teams assigned
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
