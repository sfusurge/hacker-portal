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
import { CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ScoreViewProps {
    assignments: any[];
    teams: any[];
    judges: any[];
    teamSearchQuery: string;
    judgeSearchQuery: string;
    setTeamSearchQuery: (query: string) => void;
    setJudgeSearchQuery: (query: string) => void;
}

export default function ScoreView({
    assignments,
    teams,
    judges,
    teamSearchQuery,
    judgeSearchQuery,
    setTeamSearchQuery,
    setJudgeSearchQuery,
}: ScoreViewProps) {
    const judgedAssignments = assignments.filter(
        (a) => a.status === 'judged' && a.response
    );

    const filteredAssignments = judgedAssignments.filter((assignment) => {
        const team = teams.find(
            (t) => t.id === assignment.teamId || t.teamId === assignment.teamId
        );
        const judge = judges.find((j) => j.id === assignment.userId);

        const teamName = team ? team.teamName.toLowerCase() : '';
        const judgeName = judge
            ? `${judge.firstName} ${judge.lastName}`.toLowerCase()
            : '';

        const teamQuery = teamSearchQuery.toLowerCase();
        const judgeQuery = judgeSearchQuery.toLowerCase();

        return (
            (teamName.includes(teamQuery) ||
                (team && team.id.toString().includes(teamQuery))) &&
            (judgeName.includes(judgeQuery) ||
                (judge && judge.id.toString().includes(judgeQuery)))
        );
    });

    const assignmentsByTeam = useMemo(() => {
        const grouped = new Map();

        filteredAssignments.forEach((assignment) => {
            const teamId = assignment.teamId;
            if (!grouped.has(teamId)) {
                const team = teams.find(
                    (t) => t.id === teamId || t.teamId === teamId
                );
                grouped.set(teamId, {
                    team,
                    assignments: [],
                });
            }
            grouped.get(teamId).assignments.push(assignment);
        });

        return Array.from(grouped.values()).sort((a, b) => {
            const nameA = a.team?.teamName || '';
            const nameB = b.team?.teamName || '';
            return nameA.localeCompare(nameB);
        });
    }, [filteredAssignments, teams]);

    const allQuestions = useMemo(() => {
        const questionSet = new Set<string>();
        filteredAssignments.forEach((assignment) => {
            if (assignment.response) {
                Object.keys(assignment.response).forEach((key) =>
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
    }, [filteredAssignments]);

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
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <FormTextInput
                        name="score-team-search"
                        id="score-team-search"
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
                <div className="flex-1">
                    <FormTextInput
                        name="score-judge-search"
                        id="score-judge-search"
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
            </div>

            {assignmentsByTeam.length === 0 ? (
                <div className="py-8 text-center">No scores found</div>
            ) : (
                <div className="space-y-6">
                    {assignmentsByTeam.map(({ team, assignments }) => (
                        <Card
                            key={team?.id || 'unknown'}
                            className="bg-neutral-850 p-4"
                        >
                            <h3 className="mb-4 text-lg font-medium">
                                {team ? team.teamName : 'Unknown Team'}
                                {team && (
                                    <span className="text-sm text-gray-400">
                                        ({team.id || team.teamId})
                                    </span>
                                )}
                            </h3>

                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[150px]">
                                                Judge
                                            </TableHead>
                                            <TableHead className="min-w-[120px]">
                                                Status
                                            </TableHead>
                                            {allQuestions.map((questionKey) => (
                                                <TableHead
                                                    key={questionKey}
                                                    className="min-w-[120px]"
                                                >
                                                    Question {questionKey}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assignments.map((assignment: any) => {
                                            const judge = judges.find(
                                                (j) =>
                                                    j.id === assignment.userId
                                            );

                                            return (
                                                <TableRow
                                                    key={`${assignment.teamId}-${assignment.userId}`}
                                                >
                                                    <TableCell className="font-medium">
                                                        {judge
                                                            ? `${judge.firstName} ${judge.lastName}`
                                                            : `Judge #${assignment.userId}`}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center text-sm text-white/60">
                                                            <CheckCircle className="text-success-500 mr-1 h-3 w-3" />
                                                            {new Date(
                                                                assignment.updatedDate
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </TableCell>
                                                    {allQuestions.map(
                                                        (questionKey) => (
                                                            <TableCell
                                                                key={
                                                                    questionKey
                                                                }
                                                            >
                                                                {renderScoreValue(
                                                                    assignment
                                                                        .response?.[
                                                                        questionKey
                                                                    ] || ''
                                                                )}
                                                            </TableCell>
                                                        )
                                                    )}
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
