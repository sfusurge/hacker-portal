'use client';

import { useState, useEffect, useMemo } from 'react';
import { trpc } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useHackathon } from '@/hooks/use-hackathon';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import TeamView from '@/components/projects/judge/scoring/TeamView';
import JudgeView from '@/components/projects/judge/scoring/JudgeView';
import ScoreView from '@/components/projects/judge/scoring/ScoreView';

export default function JudgeAssignmentPage() {
    const [judges, setJudges] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState<string | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{
        judgeId: number;
        teamId: number;
    } | null>(null);
    const { toast } = useToast();
    const { hackathon } = useHackathon();

    const [judgeSearchQuery, setJudgeSearchQuery] = useState('');
    const [teamSearchQuery, setTeamSearchQuery] = useState('');

    const filteredJudges = useMemo(() => {
        if (!judgeSearchQuery.trim()) return judges;
        const query = judgeSearchQuery.toLowerCase();
        return judges.filter(
            (judge) =>
                `${judge.firstName} ${judge.lastName}`
                    .toLowerCase()
                    .includes(query) || judge.id.toString().includes(query)
        );
    }, [judges, judgeSearchQuery]);

    const filteredTeams = useMemo(() => {
        if (!teamSearchQuery.trim()) return teams;
        const query = teamSearchQuery.toLowerCase();
        return teams.filter(
            (team) =>
                team.teamName.toLowerCase().includes(query) ||
                (team.id || team.teamId).toString().includes(query)
        );
    }, [teams, teamSearchQuery]);

    const getJudges = trpc.users.getJudges.useQuery(undefined, {
        enabled: false,
    });

    const getTeams = trpc.teams.getTeams.useQuery(
        { hackathonId: hackathon?.id },
        {
            enabled: false,
        }
    );

    const getJudgingProjects = trpc.judging.getJudgingProjects.useQuery(
        { hackathonId: hackathon?.id || 0 },
        { enabled: !!hackathon?.id }
    );

    const assignJudgingProject = trpc.judging.assignJudgingProject.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Project assigned successfully',
                variant: 'success',
            });
            setAssigning(null);
            fetchAssignments();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: `Failed to assign project: ${error.message}`,
                variant: 'error',
            });
            setAssigning(null);
        },
    });

    const fetchJudges = async () => {
        try {
            const { data } = await getJudges.refetch();
            if (data) {
                setJudges(data);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch judges',
                variant: 'error',
            });
        }
    };

    const fetchTeams = async () => {
        try {
            const { data } = await getTeams.refetch();
            if (data) {
                const teamsWithValidIds = data.map((team) => ({
                    ...team,
                    id: team.id || team.displayId,
                }));
                setTeams(teamsWithValidIds);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch teams',
                variant: 'error',
            });
        }
    };

    const fetchAssignments = async () => {
        if (!hackathon?.id) return;

        try {
            const data = await getJudgingProjects.refetch();
            if (data.data) {
                setAssignments(data.data);
            } else {
                setAssignments([]);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch assignments',
                variant: 'error',
            });
            setAssignments([]);
        }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchJudges(), fetchTeams(), fetchAssignments()]).then(
            () => {
                setLoading(false);
            }
        );
    }, [hackathon?.id]);

    const removeJudgingProject = trpc.judging.removeJudgingProject.useMutation({
        onSuccess: () => {
            toast({
                title: 'Success',
                description: 'Project assignment removed successfully',
                variant: 'success',
            });
            setAssigning(null);
            fetchAssignments();
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: `Failed to remove assignment: ${error.message}`,
                variant: 'error',
            });
            setAssigning(null);
        },
    });

    const isProjectAssigned = (judgeId: number, teamId: number) => {
        return assignments.some(
            (assignment) =>
                assignment.userId === judgeId &&
                (assignment.projectId === teamId ||
                    assignment.teamId === teamId)
        );
    };

    const handleAssignProject = (judgeId: number, teamId: number) => {
        if (!hackathon?.id) {
            toast({
                title: 'Error',
                description: 'No active hackathon found',
                variant: 'error',
            });
            return;
        }

        if (!teamId) {
            toast({
                title: 'Error',
                description: 'Invalid team ID',
                variant: 'error',
            });
            return;
        }

        setAssigning(`${judgeId}-${teamId}`);
        assignJudgingProject.mutate({
            hackathonId: hackathon.id,
            teamId: teamId,
            userId: judgeId,
            status: 'unjudged',
        });
    };

    const handleRemoveAssignment = (judgeId: number, teamId: number) => {
        if (!hackathon?.id) {
            toast({
                title: 'Error',
                description: 'No active hackathon found',
                variant: 'error',
            });
            return;
        }

        setDeleteTarget({ judgeId, teamId });
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!deleteTarget || !hackathon?.id) return;

        setAssigning(`${deleteTarget.judgeId}-${deleteTarget.teamId}`);
        removeJudgingProject.mutate({
            hackathonId: hackathon.id,
            teamId: deleteTarget.teamId,
            userId: deleteTarget.judgeId,
        });
        setDeleteConfirmOpen(false);
    };

    return (
        <Card className="h-max pb-20 md:pb-0">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    Judge Project Assignment
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex h-40 items-center justify-center">
                        <Loader2 className="text-brand-500 h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between">
                            <h2 className="text-xl">
                                Assignments for{' '}
                                {hackathon?.hackathonName ||
                                    'Current Hackathon'}
                            </h2>
                            <Button
                                onClick={() => {
                                    setLoading(true);
                                    Promise.all([
                                        fetchJudges(),
                                        fetchTeams(),
                                        fetchAssignments(),
                                    ]).then(() => {
                                        setLoading(false);
                                    });
                                }}
                            >
                                Refresh
                            </Button>
                        </div>

                        <Tabs defaultValue="teams">
                            <TabsList className="mb-2">
                                <TabsTrigger value="teams">
                                    Teams View
                                </TabsTrigger>
                                <TabsTrigger value="judges">
                                    Judges View
                                </TabsTrigger>
                                <TabsTrigger value="scores">
                                    Scores View
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="teams">
                                <TeamView
                                    filteredJudges={filteredJudges}
                                    filteredTeams={filteredTeams}
                                    assignments={assignments}
                                    judges={judges}
                                    teamSearchQuery={teamSearchQuery}
                                    judgeSearchQuery={judgeSearchQuery}
                                    setTeamSearchQuery={setTeamSearchQuery}
                                    setJudgeSearchQuery={setJudgeSearchQuery}
                                    handleAssignProject={handleAssignProject}
                                    handleRemoveAssignment={
                                        handleRemoveAssignment
                                    }
                                    assigning={assigning}
                                    hackathon={hackathon}
                                    isProjectAssigned={isProjectAssigned}
                                />
                            </TabsContent>

                            <TabsContent value="judges">
                                <JudgeView
                                    filteredJudges={filteredJudges}
                                    hackathon={hackathon}
                                    filteredTeams={filteredTeams}
                                    assignments={assignments}
                                    teams={teams}
                                    judgeSearchQuery={judgeSearchQuery}
                                    teamSearchQuery={teamSearchQuery}
                                    setJudgeSearchQuery={setJudgeSearchQuery}
                                    setTeamSearchQuery={setTeamSearchQuery}
                                    handleAssignProject={handleAssignProject}
                                    handleRemoveAssignment={
                                        handleRemoveAssignment
                                    }
                                    assigning={assigning}
                                    isProjectAssigned={isProjectAssigned}
                                />
                            </TabsContent>

                            <TabsContent value="scores">
                                <ScoreView
                                    hackathon={hackathon}
                                    assignments={assignments}
                                    teams={teams}
                                    judges={judges}
                                    teamSearchQuery={teamSearchQuery}
                                    judgeSearchQuery={judgeSearchQuery}
                                    setTeamSearchQuery={setTeamSearchQuery}
                                    setJudgeSearchQuery={setJudgeSearchQuery}
                                />
                            </TabsContent>
                        </Tabs>
                    </>
                )}
            </CardContent>

            <Dialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Removal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this judge
                            assignment? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex flex-row justify-end gap-3">
                        <Button
                            variant="default"
                            hierarchy="primary"
                            size="cozy"
                            onClick={() => setDeleteConfirmOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            hierarchy={'primary'}
                            size="cozy"
                            onClick={confirmDelete}
                        >
                            Remove Assignment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
