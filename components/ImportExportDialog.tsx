// components/ImportExportDialog.tsx (обновленная версия с useToast)
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Импортируем useToast
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FileUp, FileDown } from "lucide-react";

interface ImportExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImport: (file: File) => Promise<void>;
}

export function ImportExportDialog({
    open,
    onOpenChange,
    onImport,
}: ImportExportDialogProps) {
    const { toast } = useToast(); // Используем хук useToast
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            toast({
                title: "Ошибка",
                description: "Выберите файл для импорта",
                variant: "destructive",
            });
            return;
        }

        if (!file.name.endsWith('.json')) {
            toast({
                title: "Ошибка",
                description: "Файл должен быть в формате JSON",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            await onImport(file);
        } catch (error) {
            console.error("Ошибка импорта:", error);
            toast({
                title: "Ошибка",
                description: error instanceof Error ? error.message : "Ошибка при импорте файла",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            setFile(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Импорт настроек Badge</DialogTitle>
                    <DialogDescription>
                        Загрузите файл JSON с настройками badge
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                        <FileUp className="h-8 w-8 text-gray-400 mb-4" />
                        <p className="text-sm text-gray-500 mb-2">
                            {file ? file.name : "Выберите файл JSON для импорта"}
                        </p>
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outline" size="sm" className="mt-2" asChild>
                                <span>Выбрать файл</span>
                            </Button>
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Отмена
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!file || isUploading}
                            className="flex items-center gap-2"
                        >
                            {isUploading ? "Импортирую..." : "Импортировать"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

