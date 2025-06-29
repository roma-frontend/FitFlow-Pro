// components/book-trainer/forms/BookingForm.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookingStore } from "../hooks/useBookingStore";

export function BookingForm() {
    const { workoutType, setWorkoutType, duration, setDuration, notes, setNotes } = useBookingStore();

    return (
        <>
            <div>
                <label className="block text-sm font-medium mb-2">
                    Тип тренировки *
                </label>
                <Select value={workoutType} onValueChange={setWorkoutType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Выберите тип тренировки" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Персональная тренировка">
                            Персональная тренировка
                        </SelectItem>
                        <SelectItem value="Консультация">Консультация</SelectItem>
                        <SelectItem value="Составление программы">
                            Составление программы
                        </SelectItem>
                        <SelectItem value="Техника выполнения">
                            Техника выполнения
                        </SelectItem>
                        <SelectItem value="Растяжка">Растяжка</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Продолжительность
                </label>
                <Select
                    value={duration.toString()}
                    onValueChange={(value) => setDuration(Number(value))}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="30">30 минут</SelectItem>
                        <SelectItem value="60">60 минут</SelectItem>
                        <SelectItem value="90">90 минут</SelectItem>
                        <SelectItem value="120">120 минут</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Дополнительные пожелания
                </label>
                <Textarea
                    placeholder="Расскажите о ваших целях, опыте, ограничениях или особых пожеланиях..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                />
            </div>
        </>
    );
}