'use client';

import { useMemo } from 'react';
import type { ColumnDef, Row } from '@tanstack/react-table';
import { useAtomValue } from 'jotai';
import dayjs from 'dayjs';
import { getResponseValue } from '@/lib/admin/submissionExport';
import {
    getApplicationExportField,
    resolveApplicationQuestionIdByRole,
} from '@/lib/applications/applicationReviewExport';
import {
    buildApplicationReviewTableColumns,
    resolveApplicationReviewTableLocationQuestionId,
} from '@/lib/applications/buildApplicationReviewTableColumns';
import { hackathonAtom } from '@/app/(auth)/ClientContext';
import {
    MULTI_VALUE_FILTER_ROLES,
    splitMultiValueTokens,
} from './ReviewTableFilters';
import { ApplicationReviewAnswerCell } from './applications-table/tablePrimitives';
import { ReviewApplicantsTable } from './applications-table/ReviewApplicantsTable';
import {
    sideCardAtomSJ,
    type Applicant,
    type ReviewApplicationsTableProps,
} from './applications-table/types';

export type { Applicant };
export { sideCardAtomSJ };

export default function ReviewApplicationsTable({
    data,
    applicationQuestionPages,
    applicationCount,
    applicationDataMap,
    fetchNextPage,
    onRowClick,
    hackathonId,
}: ReviewApplicationsTableProps) {
    const hackathon = useAtomValue(hackathonAtom);
    const showLocationColumn = hackathon.isMultipleLocations === true;

    const locationQuestionId = useMemo(
        () =>
            resolveApplicationReviewTableLocationQuestionId(
                applicationQuestionPages
            ),
        [applicationQuestionPages]
    );

    const multiValueQuestionIds = useMemo(() => {
        const ids = new Set<string>();
        for (const role of MULTI_VALUE_FILTER_ROLES) {
            const questionId = resolveApplicationQuestionIdByRole(
                applicationQuestionPages,
                role
            );
            if (questionId) ids.add(questionId);
        }
        return ids;
    }, [applicationQuestionPages]);

    const questionColumns = useMemo(() => {
        const cols = buildApplicationReviewTableColumns(
            applicationQuestionPages
        );
        if (!locationQuestionId) return cols;
        return cols.filter((col) => col.questionId !== locationQuestionId);
    }, [applicationQuestionPages, locationQuestionId]);

    const dynamicQuestionColumns: ColumnDef<Applicant>[] = useMemo(
        () =>
            questionColumns.map((col) => {
                const isMultiValue = multiValueQuestionIds.has(col.questionId);

                return {
                    id: `q-${col.id}`,
                    header: col.header,
                    size: 200,
                    minSize: 120,
                    enableColumnFilter: true,
                    accessorFn: (row: Applicant) =>
                        getApplicationExportField(row.response, col.questionId),
                    cell: ({ row }) => (
                        <ApplicationReviewAnswerCell
                            response={row.original.response}
                            questionId={col.questionId}
                            questionType={col.type}
                        />
                    ),
                    ...(isMultiValue
                        ? {
                              filterFn: (
                                  row: Row<Applicant>,
                                  _columnId: string,
                                  filterValue: unknown
                              ) => {
                                  if (
                                      filterValue == null ||
                                      filterValue === ''
                                  ) {
                                      return true;
                                  }
                                  const selected = String(filterValue)
                                      .trim()
                                      .toLowerCase();
                                  const tokens = splitMultiValueTokens(
                                      getResponseValue(
                                          row.original.response,
                                          col.questionId
                                      )
                                  );
                                  return tokens.some(
                                      (token) =>
                                          token.toLowerCase() === selected
                                  );
                              },
                          }
                        : {}),
                };
            }),
        [multiValueQuestionIds, questionColumns]
    );

    const checkedInInfoColumns: ColumnDef<Applicant>[] = useMemo(() => {
        const events = Array.from(
            new Map(
                data
                    .flatMap((row) => row.checkIns ?? [])
                    .map((ci) => [
                        ci.eventId,
                        { eventId: ci.eventId, eventTitle: ci.eventTitle },
                    ])
            ).values()
        );

        return events.map(({ eventTitle, eventId }) => ({
            id: `checkin-${eventId}`,
            header: eventTitle,
            size: 150,
            minSize: 120,
            enableColumnFilter: true,
            // Always keep rows with a check-in above empty ones (asc and desc).
            sortUndefined: 'last' as const,
            sortDescFirst: true,
            accessorFn: (row: Applicant): number | undefined => {
                const checkIn = row.checkIns?.find(
                    (c) => c.eventId === eventId
                );
                if (!checkIn?.checkInTime) return undefined;
                const t = dayjs(checkIn.checkInTime);
                return t.isValid() ? t.valueOf() : undefined;
            },
            cell: ({ getValue }) => {
                const ts = getValue<number | undefined>();
                if (ts == null) return null;
                return (
                    <span className="text-base text-white">
                        {dayjs(ts).format('MM-DD HH:mm')}
                    </span>
                );
            },
            filterFn: (row, columnId, filterValue) => {
                if (filterValue == null || filterValue === '') return true;
                const ts = row.getValue<number | undefined>(columnId);
                if (ts == null) return false;
                return dayjs(ts)
                    .format('MM-DD HH:mm')
                    .includes(String(filterValue));
            },
        }));
    }, [data]);

    const extraColumns: ColumnDef<Applicant>[] = useMemo(
        () => [...dynamicQuestionColumns, ...checkedInInfoColumns],
        [dynamicQuestionColumns, checkedInInfoColumns]
    );

    return (
        <ReviewApplicantsTable
            applicationCount={applicationCount}
            applicationDataMap={applicationDataMap}
            applicationQuestionPages={applicationQuestionPages}
            data={data}
            extraColumns={extraColumns}
            fetchNextPage={fetchNextPage}
            onRowClick={onRowClick}
            hackathonId={hackathonId}
            showLocationColumn={showLocationColumn}
        />
    );
}
