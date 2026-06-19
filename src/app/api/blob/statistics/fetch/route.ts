import { NextRequest, NextResponse } from 'next/server';
import { databaseClient } from '@/db/client';
import { applications } from '@/db/schema/applications';
import { eq, and, or } from 'drizzle-orm';
import { put } from '@vercel/blob';

// helper function to process field data for pie charts
function processFieldData(applications: any[], fieldKey: string) {
    const fieldCount = applications.reduce(
        (acc: Record<string, number>, app: any) => {
            const value = app.response[fieldKey] || 'Not specified';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    // group categories with less than 6 into "Other"
    const processedData: Record<string, number> = {};
    let otherCount = 0;

    Object.entries(fieldCount).forEach(([value, count]) => {
        if (count >= 5) {
            processedData[value] = count;
        } else {
            otherCount += count;
        }
    });

    if (otherCount > 0) {
        processedData['Other'] = otherCount;
    }

    // sort by count (descending) and format for pie chart
    const sortedEntries = Object.entries(processedData).sort(
        (a, b) => b[1] - a[1]
    );

    return sortedEntries.map(([value, count], index) => ({
        name: value,
        value: count,
        fill: index === 0 ? '#3730a3' : getColorByIndex(index), // brand-700 for largest
    }));
}

// color palette for pie charts
function getColorByIndex(index: number): string {
    const colors = [
        'hsl(220 70% 60%)', // Blue
        'hsl(160 60% 55%)', // Teal
        'hsl(45 85% 65%)', // Yellow
        'hsl(320 70% 65%)', // Pink
        'hsl(120 50% 55%)', // Green
        'hsl(280 65% 65%)', // Purple
        'hsl(15 75% 60%)', // Orange
        'hsl(0 60% 60%)', // Red
        'hsl(200 60% 60%)', // Cyan
        'hsl(60 70% 60%)', // Lime
    ];
    return colors[index % colors.length];
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hackathonId = parseInt(searchParams.get('hackathonId') || '1');

        const applications_result = await databaseClient
            .select({
                userId: applications.userId,
                response: applications.response,
            })
            .from(applications)
            .where(
                and(
                    eq(applications.hackathonId, hackathonId),
                    or(
                        eq(applications.currentStatus, 'Accepted')
                        // eq(
                        //     applications.currentStatus,
                        //     'Accepted - RSVP to Confirm'
                        // )
                    )
                )
            );

        const filteredApplications = applications_result.map((app) => ({
            userId: app.userId,
            response: {
                '3':
                    app.response &&
                    typeof app.response === 'object' &&
                    '3' in app.response
                        ? (app.response as Record<string, any>)['3']
                        : null,
                '5':
                    app.response &&
                    typeof app.response === 'object' &&
                    '5' in app.response
                        ? (app.response as Record<string, any>)['5']
                        : null,
                '16':
                    app.response &&
                    typeof app.response === 'object' &&
                    '16' in app.response
                        ? (app.response as Record<string, any>)['16']
                        : null,
                '17':
                    app.response &&
                    typeof app.response === 'object' &&
                    '17' in app.response
                        ? (app.response as Record<string, any>)['17']
                        : null,
                '18':
                    app.response &&
                    typeof app.response === 'object' &&
                    '18' in app.response
                        ? (app.response as Record<string, any>)['18']
                        : null,
                '19':
                    app.response &&
                    typeof app.response === 'object' &&
                    '19' in app.response
                        ? (app.response as Record<string, any>)['19']
                        : null,
                '20':
                    app.response &&
                    typeof app.response === 'object' &&
                    '20' in app.response
                        ? (app.response as Record<string, any>)['20']
                        : null,
            },
        }));

        const pieChartData = {
            pronouns: processFieldData(filteredApplications, '3'),
            experience: processFieldData(filteredApplications, '5'),
            school: processFieldData(filteredApplications, '16'),
            levelStudy: processFieldData(filteredApplications, '18'),
            year: processFieldData(filteredApplications, '19'),
            program: processFieldData(filteredApplications, '20'),
        };

        const pieChartBlob = await put(
            `statistics/${hackathonId}/stats.json`,
            JSON.stringify(pieChartData, null, 2),
            {
                access: 'public',
                contentType: 'application/json',
                allowOverwrite: true,
            }
        );

        return NextResponse.json({
            success: true,
            message: `Statistics data uploaded to Vercel Blob for hackathon ${hackathonId}`,
            count: filteredApplications.length,
            pieChartDataUrl: pieChartBlob.url,
            pieChartData: pieChartData,
        });
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics data',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
