// components/book-trainer/hooks/useTrainers.ts
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Trainer } from "../types";

export function useTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/trainers");
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки тренеров");
      }
      
      const data = await response.json();
      setTrainers(data.trainers || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return { trainers, loading, error, refetch: fetchTrainers };
}
