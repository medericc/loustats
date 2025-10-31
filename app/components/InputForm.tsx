'use client';

import { Button } from '@/components/ui/button';

export default function InputForm({
  value,
  onChange,
  onGenerate,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
}) {
  return (
     <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <Button 
        onClick={onGenerate} 
        className="bg-[#001E5A] text-gray-100 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#000C32] hover:text-white transition-colors w-full"
      >
        VOIR STATS
      </Button>
    </div>
  );
}