// components/manager/bookings/BookingTable.tsx
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import BookingTableRow from "./BookingTableRow";

interface BookingTableProps {
  bookings: any[];
  onStatusChange: (booking: any) => void;
}

const BookingTable = memo(({ bookings, onStatusChange }: BookingTableProps) => {
  return (
    <div className="hidden lg:block">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Клиент</TableHead>
                  <TableHead className="font-semibold">Тренер</TableHead>
                  <TableHead className="font-semibold">Дата и время</TableHead>
                  <TableHead className="font-semibold">Услуга</TableHead>
                  <TableHead className="font-semibold">Тип</TableHead>
                  <TableHead className="font-semibold">Статус</TableHead>
                  <TableHead className="font-semibold">Цена</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <BookingTableRow
                    key={booking.id}
                    booking={booking}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

BookingTable.displayName = "BookingTable";

export default BookingTable;
