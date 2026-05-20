'use client';

import { useState, useEffect } from 'react';
import { FormTextInput } from '@/components/ui/input/input';
import { Label } from '@/components/ui/label/label';
import ProjectCard from './ProjectCard';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import {
    DrawerContent,
    DrawerTrigger,
    Drawer,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from '../ui/drawer';
import { Button } from '../ui/button';
import { CheckboxGroup } from '../ui/checkboxGroup/CheckBoxGroup';
import { useToast } from '@/hooks/use-toast';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownBadge } from '@/components/ui/dropdown-badge';
import { ProjectGalleryLocationToggle } from './ProjectGalleryLocationToggle';
import {
    createSkeletonProjectListItem,
    projectListItemMatchesLocationFilter,
    projectListItemMatchesSearchQuery,
    type ProjectGalleryLocationFilter,
    type ProjectListItem,
} from '@/lib/projects/projectSubmissionDisplay';
const STATUS_KEY = 'judging_status_data';
const FILTERS_KEY = 'judging_filters_data';

interface ProjectListProps {
    projects: ProjectListItem[];
    userData: any;
    judgedProjects: any[];
    allProjects?: ProjectListItem[];
}

export default function ProjectList({
    projects,
    userData,
    judgedProjects,
    allProjects,
}: ProjectListProps) {
    const { toast } = useToast();
    const [projectStatuses, setProjectStatuses] = useState<
        Record<string, string>
    >({});
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] =
        useState<ProjectGalleryLocationFilter>('all');
    const [filteredProjects, setFilteredProjects] = useState(projects);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showAllProjects, setShowAllProjects] = useState(false);
    const defaultStatusFilters = ['not_started', 'in_progress'];
    const [statusFilters, setStatusFilters] = useState<Set<string>>(
        new Set(defaultStatusFilters)
    );
    const [initialStatusFilters, setInitialStatusFilters] = useState<
        Set<string>
    >(new Set(defaultStatusFilters));

    useEffect(() => {
        // check if all assigned projects are judged, if they are, add unassigned and add to localstorage and select it to display
        const allAssignedProjectsJudged = projects.every((project) => {
            const judgedStatus = judgedProjects?.find(
                (jp) => jp.teamId === project.id
            )?.status;
            return judgedStatus === 'judged';
        });

        if (allAssignedProjectsJudged && allProjects) {
            setShowAllProjects(true);
            try {
                const newFilters = new Set<string>(['completed', 'unassigned']);
                setStatusFilters(newFilters);
                setInitialStatusFilters(newFilters);
                localStorage.setItem(
                    FILTERS_KEY,
                    JSON.stringify(Array.from(newFilters))
                );
            } catch (error) {
                console.error('Error updating filters:', error);
            }
        }
    }, [projects, judgedProjects, allProjects]);

    const handleStatusFilterChange = (selected: Set<string>) => {
        setStatusFilters(selected);

        if (window.innerWidth >= 768) {
            try {
                const filtersArray = Array.from(selected);
                if (filtersArray.length > 0) {
                    localStorage.setItem(
                        FILTERS_KEY,
                        JSON.stringify(filtersArray)
                    );
                    setInitialStatusFilters(new Set(selected));
                } else {
                    localStorage.removeItem(FILTERS_KEY);
                }
            } catch (error) {
                console.error('Error saving filters:', error);
            }
        }
    };

    const resetStatusFilters = () => {
        setStatusFilters(new Set(initialStatusFilters));
    };

    const isFilterChanged = () => {
        if (statusFilters.size !== initialStatusFilters.size) return true;

        for (const filter of statusFilters) {
            if (!initialStatusFilters.has(filter)) return true;
        }

        for (const filter of initialStatusFilters) {
            if (!statusFilters.has(filter)) return true;
        }

        return false;
    };

    const getStatusInfo = (projectId: string | number) => {
        const status = projectStatuses[projectId];
        const isAssigned = projects.some((p) => p.id === projectId);

        if (!isAssigned) {
            return {
                label: 'Not Judging',
                className: 'bg-neutral-800 text-white/60',
            };
        }
        if (status === 'completed') {
            return {
                label: 'Completed',
                className: 'bg-success-950 text-success-300',
            };
        } else if (status === 'in_progress') {
            return {
                label: 'In Progress',
                className: 'bg-caution-950 text-caution-300',
            };
        } else {
            return {
                label: 'Not Yet Started',
                className: 'bg-neutral-800 text-white',
            };
        }
    };

    const handleApplyFilters = () => {
        const filtersArray = Array.from(statusFilters);
        setInitialStatusFilters(new Set(statusFilters));

        try {
            if (filtersArray.length > 0) {
                localStorage.setItem(FILTERS_KEY, JSON.stringify(filtersArray));
            } else {
                localStorage.removeItem(FILTERS_KEY);
            }
        } catch (error) {
            console.error('Error saving filters:', error);
        }

        if (window.innerWidth < 768) {
            toast({
                title: 'Filters applied',
                variant: 'success',
            });
        }
    };

    const handleCancel = () => {
        resetStatusFilters();
    };

    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    useEffect(() => {
        try {
            const savedFilters = localStorage.getItem(FILTERS_KEY);
            if (savedFilters) {
                const parsedFilters = JSON.parse(savedFilters);
                if (Array.isArray(parsedFilters) && parsedFilters.length > 0) {
                    const filtersSet = new Set(parsedFilters);
                    setStatusFilters(filtersSet);
                    setInitialStatusFilters(filtersSet);
                } else {
                    localStorage.removeItem(FILTERS_KEY);
                    setStatusFilters(new Set(defaultStatusFilters));
                    setInitialStatusFilters(new Set(defaultStatusFilters));
                }
            } else {
                setStatusFilters(new Set(defaultStatusFilters));
                setInitialStatusFilters(new Set(defaultStatusFilters));
            }
        } catch (error) {
            console.error('Error loading saved filters:', error);
            setStatusFilters(new Set(defaultStatusFilters));
            setInitialStatusFilters(new Set(defaultStatusFilters));
        }
    }, []);

    useEffect(() => {
        const loadProjectStatuses = () => {
            try {
                const savedData = localStorage.getItem(STATUS_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    if (parsedData && typeof parsedData === 'object') {
                        setProjectStatuses(parsedData);
                    } else {
                        localStorage.removeItem(STATUS_KEY);
                        setProjectStatuses({});
                    }
                } else {
                    setProjectStatuses({});
                }
            } catch (error) {
                console.error('Error loading project statuses:', error);
                setProjectStatuses({});
            }
        };

        loadProjectStatuses();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadProjectStatuses();
            }
        };

        window.addEventListener('focus', loadProjectStatuses);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('focus', loadProjectStatuses);
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, []);

    useEffect(() => {
        if (
            Object.keys(projectStatuses).length > 0 ||
            localStorage.getItem(STATUS_KEY) === null
        ) {
            setInitialLoadComplete(true);
        }
    }, [projectStatuses]);

    useEffect(() => {
        if (!initialLoadComplete) return;

        if (judgedProjects && judgedProjects.length > 0) {
            const newStatuses = { ...projectStatuses };
            const judgedProjectIds = new Set(
                judgedProjects.map((project) => project.teamId)
            );
            let hasChanges = false;

            projects.forEach((project) => {
                if (project && project.id !== undefined) {
                    const projectId = project.id;

                    if (
                        judgedProjectIds.has(Number(projectId)) &&
                        projectStatuses[projectId] !== 'completed'
                    ) {
                        newStatuses[projectId] = 'completed';
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                try {
                    localStorage.setItem(
                        STATUS_KEY,
                        JSON.stringify(newStatuses)
                    );
                    setProjectStatuses(newStatuses);
                } catch (error) {
                    console.error('Error saving project statuses:', error);
                }
            }
        }
    }, [judgedProjects, projects, projectStatuses, initialLoadComplete]);

    useEffect(() => {
        if (!initialLoadComplete) {
            setFilteredProjects([]);
            return;
        }

        const projectsToFilter =
            showAllProjects && allProjects ? allProjects : projects;

        if (
            !searchQuery.trim() &&
            statusFilters.size === 0 &&
            Object.keys(projectStatuses).length === 0
        ) {
            setFilteredProjects(
                locationFilter === 'all'
                    ? projectsToFilter
                    : projectsToFilter.filter((project) =>
                          projectListItemMatchesLocationFilter(
                              project,
                              locationFilter
                          )
                      )
            );
            return;
        }

        const query = searchQuery ? searchQuery.toLowerCase() : '';
        const assignedProjectIds = new Set(projects.map((p) => p.id));

        const filtered = projectsToFilter.filter((project) => {
            if (!project || project.id === undefined) {
                return false;
            }

            const projectId = project.id;
            const isAssigned = assignedProjectIds.has(projectId);

            let projectStatus: string;
            if (!isAssigned) {
                projectStatus = 'unassigned';
            } else {
                projectStatus =
                    projectStatuses && typeof projectStatuses === 'object'
                        ? projectStatuses[projectId] || 'not_started'
                        : 'not_started';
            }

            const matchesStatus =
                statusFilters instanceof Set
                    ? statusFilters.size === 0 ||
                      statusFilters.has(projectStatus)
                    : true;

            const matchesSearch = projectListItemMatchesSearchQuery(
                project,
                query
            );
            const matchesLocation = projectListItemMatchesLocationFilter(
                project,
                locationFilter
            );

            return matchesSearch && matchesStatus && matchesLocation;
        });

        setFilteredProjects(filtered);
    }, [
        searchQuery,
        locationFilter,
        projects,
        statusFilters,
        projectStatuses,
        initialLoadComplete,
        showAllProjects,
        allProjects,
    ]);

    return (
        <div className="flex h-full flex-col">
            <div className="sticky z-10 -m-6 mb-0 bg-neutral-900 p-6 sm:-m-6 sm:p-10 md:-m-10 md:border-b md:border-b-neutral-600/30">
                <div className="mb-6 flex flex-col gap-4">
                    <h1 className="text-3xl font-semibold text-white">
                        Hi, {userData?.firstName} {userData?.lastName}! 👋
                    </h1>
                    <p className="text-white/60">
                        {showAllProjects
                            ? 'Thank you for being a judge for StormHacks 2025! You can now view every project 💖.'
                            : "Here are the projects you've been assigned to judge."}
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Search for a project</Label>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
                        <FormTextInput
                            name="search"
                            id="search"
                            type="search"
                            className="w-full md:max-w-[320px]"
                            icon={
                                <MagnifyingGlassIcon className="h-4 w-4 text-white/60" />
                            }
                            defaultValue={searchQuery}
                            lazy
                            onLazyChange={(text) => {
                                setSearchQuery(text);
                            }}
                        />
                        <ProjectGalleryLocationToggle
                            value={locationFilter}
                            onChange={setLocationFilter}
                            className="shrink-0 md:pb-0.5"
                        />
                    </div>
                    <div className="flex gap-3">
                        <div className="block md:hidden">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <DropdownBadge
                                        label="Status"
                                        count={
                                            statusFilters.size > 0
                                                ? statusFilters.size
                                                : undefined
                                        }
                                        hierarchy="primary"
                                        variant="default"
                                    />
                                </DrawerTrigger>
                                <DrawerContent>
                                    <DrawerTitle>
                                        Filter by project status
                                    </DrawerTitle>
                                    <div className="flex flex-col gap-3">
                                        <CheckboxGroup
                                            id="status-filters-mobile"
                                            choices={[
                                                ...(showAllProjects
                                                    ? [
                                                          {
                                                              name: 'Completed',
                                                              data: 'completed',
                                                          },
                                                          {
                                                              name: 'Unassigned',
                                                              data: 'unassigned',
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              name: 'Not Yet Started',
                                                              data: 'not_started',
                                                          },
                                                          {
                                                              name: 'In Progress',
                                                              data: 'in_progress',
                                                          },
                                                          {
                                                              name: 'Completed',
                                                              data: 'completed',
                                                          },
                                                      ]),
                                            ]}
                                            selected={Array.from(statusFilters)}
                                            onSelection={(selected) =>
                                                handleStatusFilterChange(
                                                    selected
                                                )
                                            }
                                            max={4}
                                        />
                                    </div>
                                    <DrawerFooter className="grid grid-cols-2 gap-4">
                                        <DrawerClose asChild>
                                            <Button
                                                type="button"
                                                hierarchy={'primary'}
                                                variant={'default'}
                                                size="cozy"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </DrawerClose>
                                        <DrawerClose asChild>
                                            <Button
                                                type="button"
                                                hierarchy={'primary'}
                                                variant={'brand'}
                                                size="cozy"
                                                disabled={!isFilterChanged()}
                                                onClick={handleApplyFilters}
                                            >
                                                Apply filters
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        </div>

                        <div className="hidden md:block">
                            <DropdownMenu onOpenChange={setIsDropdownOpen}>
                                <DropdownMenuTrigger asChild>
                                    <DropdownBadge
                                        label="Status"
                                        count={
                                            statusFilters.size > 0
                                                ? statusFilters.size
                                                : undefined
                                        }
                                        hierarchy="primary"
                                        variant="default"
                                        isOpen={isDropdownOpen}
                                    />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    className="w-56"
                                >
                                    <div className="p-2">
                                        <CheckboxGroup
                                            id="status-filters-desktop"
                                            choices={[
                                                ...(showAllProjects
                                                    ? [
                                                          {
                                                              name: 'Completed',
                                                              data: 'completed',
                                                          },
                                                          {
                                                              name: 'Unassigned',
                                                              data: 'unassigned',
                                                          },
                                                      ]
                                                    : [
                                                          {
                                                              name: 'Not Yet Started',
                                                              data: 'not_started',
                                                          },
                                                          {
                                                              name: 'In Progress',
                                                              data: 'in_progress',
                                                          },
                                                          {
                                                              name: 'Completed',
                                                              data: 'completed',
                                                          },
                                                      ]),
                                            ]}
                                            selected={Array.from(statusFilters)}
                                            onSelection={(selected) => {
                                                handleStatusFilterChange(
                                                    selected
                                                );
                                            }}
                                            max={4}
                                        />
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-fill mt-6 flex-grow overflow-y-auto pb-12 sm:-mx-6 sm:p-10 md:-mx-10 md:mt-10">
                <div className="@container">
                    <div className="mb-24 grid grid-cols-1 gap-8 sm:mb-0 @[450px]:grid-cols-2 @[650px]:grid-cols-3 @[925px]:grid-cols-4">
                        {!initialLoadComplete ? (
                            Array(6)
                                .fill(0)
                                .map((_, index) => (
                                    <ProjectCard
                                        key={`skeleton-${index}`}
                                        project={createSkeletonProjectListItem()}
                                        statusInfo={{
                                            label: '',
                                            className: '',
                                        }}
                                        isLoading={true}
                                    />
                                ))
                        ) : filteredProjects.length === 0 ? (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-lg text-white">
                                    No projects match your current filters.
                                </p>
                                {(searchQuery.trim() !== '' ||
                                    statusFilters.size > 0) && (
                                    <p className="mt-2 text-sm text-white/60">
                                        Try clearing your filters or adjusting
                                        your search query.
                                    </p>
                                )}
                            </div>
                        ) : (
                            filteredProjects
                                .sort((a, b) => {
                                    const projectIdA = String(a.id);
                                    const projectIdB = String(b.id);
                                    const statusA =
                                        projectStatuses[projectIdA] ||
                                        'not_started';
                                    const statusB =
                                        projectStatuses[projectIdB] ||
                                        'not_started';

                                    const order = {
                                        in_progress: 0,
                                        not_started: 1,
                                        completed: 2,
                                    };
                                    return (
                                        (order[statusA as keyof typeof order] ??
                                            0) -
                                        (order[statusB as keyof typeof order] ??
                                            0)
                                    );
                                })
                                .map((project, index) => {
                                    const projectId = project.id;
                                    const statusInfo = getStatusInfo(projectId);
                                    return (
                                        <ProjectCard
                                            key={projectId}
                                            project={project}
                                            statusInfo={statusInfo}
                                        />
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
