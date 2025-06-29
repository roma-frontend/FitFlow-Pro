// components/manager/bookings/BookingMobileList.tsx
import { memo } from "react";
import BookingCard from "./BookingCard";

interface BookingMobileListProps {
  bookings: any[];
  onStatusChange: (booking: any) => void;
}

const BookingMobileList = memo(({ bookings, onStatusChange }: BookingMobileListProps) => {
  return (
    <div className="lg:hidden space-y-4">
      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onStatusChange={onStatusChange}
        />
    ))}
    </div>
  );
});

BookingMobileList.displayName = "BookingMobileList";

export default BookingMobileList;
