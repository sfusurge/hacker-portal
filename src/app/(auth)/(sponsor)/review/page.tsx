import ResumeTable from './table/resumeBank';

// TODO USE DRIZZLE
import testData from './table/testData';

export default async function ResumeBankPage() {
    // TODO: CHANGE MAP TO CORRECT FIELDS
    const transformedData = testData.map((item: any, index: number) => ({
        id: index + 1,
        firstName: item['1'],
        lastName: item['2'],
        school: item['3'],
        country: item['4'],

        github: item['5'],
        linkedin: item['6'],
        resumeUrl: item['7'],
    }));

    return (
        <div className="w-full">
            <ResumeTable data={transformedData} />
        </div>
    );
}
