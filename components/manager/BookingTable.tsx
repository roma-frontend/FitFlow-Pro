// components/manager/BookingTable.tsx
import React from "react";
import { Booking } from "@/contexts/ManagerContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookingTableProps {
  bookings: Booking[];
  getBookingStatusColor: (status: Booking["status"]) => string;
  getBookingStatusText: (status: Booking["status"]) => string;
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  getBookingStatusColor,
  getBookingStatusText,
}) => {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Последние записи
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => router.push("/manager/bookings")}>
          Все записи
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тренер</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.slice(0, 5).map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="font-medium text-gray-900">{booking.trainerName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-gray-900">{booking.clientName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(booking.date).toLocaleDateString("ru-RU")}
                      </div>
                      <div className="text-gray-500">{booking.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBookingStatusColor(booking.status)}>
                      {getBookingStatusText(booking.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{booking.price.toLocaleString()} ₽</span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
