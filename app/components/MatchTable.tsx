'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface MatchTableProps {
  data: string[][];
}

const actionMapping: Record<string, string> = {
  'foulon': 'Foul On',
  'rebound': 'Rebond',
  'assist': 'Assist',
  '2pt': 'Tir à 2',
  'turnover': 'Turnover',
  '3pt': 'Tir à 3',
  'steal': 'Steal',
  'block': 'Block',
  'foul': 'Foul',
  '1pt': 'Lancer-Franc',
};

export default function MatchTable({ data }: MatchTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 w-full">
      {[1, 2, 3, 4].map((period) => (
        <Card key={period}>
          <CardContent>
            <h3 className="text-lg font-bold text-center mt-6 mb-3">
              PÉRIODE {period}
            </h3>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center font-bold">Chrono</TableHead>
                  <TableHead className="text-center font-bold">Action</TableHead>
                  <TableHead className="text-center font-bold">Résultat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data
                  .filter((row) => row[0] === `${period}`)
                  .filter((row) => row[2] !== 'substitution')
                  .map((row, index) => {
                    const action = row[2].toLowerCase();
                    const success = row[3] === '1';
                    const displayAction = actionMapping[action] || row[2];

                    let statusSymbol = '❔';
                    let statusColor = 'text-gray-500';

                    // 🎯 Logique d’affichage plus naturelle
                    if (['2pt', '3pt', '1pt', 'assist'].includes(action)) {
                      // ✅ positif si réussite
                      statusSymbol = success ? '✔️' : '❌';
                      statusColor = success ? 'text-green-500' : 'text-red-500';
                    } else if (['turnover', 'foul'].includes(action)) {
                      // ❌ toujours négatif
                      statusSymbol = '❌';
                      statusColor = 'text-red-500';
                    } else if (['rebound', 'steal', 'block'].includes(action)) {
                      // ✅ toujours positif
                      statusSymbol = '✔️';
                      statusColor = 'text-green-500';
                    }

                    return (
                      <TableRow key={index}>
                        <TableCell className="text-center">{row[1]}</TableCell>
                        <TableCell className="text-center">{displayAction}</TableCell>
                        <TableCell className={`text-center ${statusColor}`}>
                          {statusSymbol}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
