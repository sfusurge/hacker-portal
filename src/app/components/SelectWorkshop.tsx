import { ScrollArea } from '@/components/ui/scroll-area';
import { redirect } from 'next/navigation';

const preHacksWorkshops = [
  {
    title: 'Intro to Figma',
    date: 'October 2nd',
    time: '2:30 PM',
    type: 'Workshop',
  },
  {
    title: 'Intro to HTML, CSS, and JavaScript',
    date: 'October 3rd',
    time: '4:00 PM',
    type: 'Workshop',
  },
  {
    title: 'Intro to Svelte.js and Firebase',
    date: 'October 4th',
    time: '6:00 PM',
    type: 'Workshop',
  },
];

const dayOneWorkshops = [
  {
    title: 'Full-Stack React and Convex',
    time: '12:00 PM',
    type: 'Workshop',
  },
  {
    title: 'Intro to Arduino',
    time: '12:00 PM',
    type: 'Workshop',
  },
  {
    title: 'MLH GitHub Co-Pilot',
    time: '12:30 PM',
    type: 'Workshop',
  },
  {
    title: 'Intro to GPT-3 in Web Applications',
    time: '2:00 PM',
    type: 'Workshop',
  },
  {
    title: 'Intro to HuggingFace',
    time: '3:00 PM',
    type: 'Workshop',
  },
];

export default function SelectWorkshop() {
  return (
    <div className="flex flex-col justify-center items-center overflow-hidden">
      <div className="max-w-sm w-96 flex-col justify-start items-start inline-flex">
        <div className="self-stretch pt-2 bg-neutral-900 rounded-tl-xl rounded-tr-xl border-t border-neutral-600/30 flex-col justify-start items-center flex overflow-hidden">
          <div className="w-9 h-1.5 relative bg-neutral-750 rounded-full" />

          <div className="self-stretch p-6 flex-col justify-start items-start gap-2 flex">
            <div className="self-stretch pr-2 justify-between items-center inline-flex">
              <div className="text-center text-white text-base font-semibold ">
                Select Workshop or Event
              </div>
            </div>
            <div className="self-stretch text-white/60 text-sm font-normal">
              What workshop/event are you checking in for?
            </div>
          </div>
        </div>
        <div className="self-stretch h-96 px-6 bg-neutral-900 flex-col justify-start items-start flex overflow-hidden">
          <div className="self-stretch h-96 flex-col justify-start items-start gap-4 flex">
            <div className="text-white/60 text-sm font-medium">
              PRE-HACK WORKSHOPS
            </div>
            <ScrollArea className="flex flex-col w-80">
              {preHacksWorkshops?.map((workshop, index) => (
                <button
                  key={index}
                  className="h-11 w-full flex flex-col justify-center items-start mb-4"
                  onClick={() => redirect('/qr/workshop/' + workshop.title)}
                >
                  <div className="text-white text-base font-normal">
                    {workshop.title}
                  </div>
                  <div className="flex justify-start items-center gap-1">
                    <div className="text-white/60 text-sm font-normal">
                      {workshop.date} at {workshop.time}
                    </div>
                    <div className="text-white/60 text-sm font-normal">∙</div>
                    <div className="text-white/60 text-sm font-normal">
                      {workshop.type}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>

            <div className="text-white/60 text-sm font-medium">DAY 1</div>
            <ScrollArea className="flex flex-col w-80">
              {dayOneWorkshops?.map((workshop, index) => (
                <button
                  key={index}
                  className="h-11 w-full flex flex-col justify-center items-start mb-4"
                  onClick={() => redirect('/qr/workshop/' + workshop.title)}
                >
                  <div className="text-white text-base font-normal">
                    {workshop.title}
                  </div>
                  <div className="flex justify-start items-center gap-1">
                    <div className="text-white/60 text-sm font-normal">
                      {workshop.time}
                    </div>
                    <div className="text-white/60 text-sm font-normal">∙</div>
                    <div className="text-white/60 text-sm font-normal">
                      {workshop.type}
                    </div>
                  </div>
                </button>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
