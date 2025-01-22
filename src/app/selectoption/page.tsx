'use client';

import SelectOption from '@/app/selectoption/components/SelectOption';
import { useEffect, useState } from 'react';
import SelectMeal from '@/app/components/SelectMeal';
import SelectWorkshop from '@/app/components/SelectWorkshop';
import { redirect } from 'next/navigation';

export default function SelectOptionPage() {
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);

  const toggleOptions = () => {
    setIsOptionsOpen(!isOptionsOpen);
  };

  const [checkInType, setCheckInType] = useState<string>('');

  const [isMealsOpen, setIsMealsOpen] = useState(false);

  const toggleMeals = () => {
    setIsMealsOpen(true);
  };

  const closeMeals = () => {
    setIsMealsOpen(false);
    setCheckInType('');
  };

  const [isWorkshopsOpen, setIsWorkshopsOpen] = useState(false);

  const toggleWorkshops = () => {
    setIsWorkshopsOpen(true);
  };

  const closeWorkshops = () => {
    setIsWorkshopsOpen(false);
    setCheckInType('');
  };

  useEffect(() => {
    if (checkInType === 'Meal Check-in') {
      toggleMeals();
    } else if (checkInType === 'Workshop Check-in') {
      toggleWorkshops();
    } else if (checkInType === 'Hackathon Check-in') {
      redirect('/qr/hackathon');
    }
  }, [checkInType]);

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-neutral-900 p-4">
      <div className="relative w-full aspect-[3/4] max-w-sm min-h-screen">
        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isOptionsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={toggleOptions}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isOptionsOpen ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectOption setCheckInType={setCheckInType} />
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isMealsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeMeals}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isMealsOpen ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectMeal />
          </div>
        </div>

        <div
          className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity duration-300 ${isWorkshopsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          onClick={closeWorkshops}
        >
          <div
            className={`fixed bottom-0 left-0 right-0 transition-transform duration-300 ease-in-out transform ${isWorkshopsOpen ? 'translate-y-0' : 'translate-y-full'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SelectWorkshop />
          </div>
        </div>
      </div>
    </div>
  );
}
